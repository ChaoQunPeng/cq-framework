import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { isValidObjectId, Model, QueryFilter, Types } from 'mongoose';
import type { AdminAuthorization } from '../admin-access/admin-access.types';
import { AdminRolesService } from '../admin-roles/admin-roles.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { QueryAdminUsersDto } from './dto/query-admin-users.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { UpdateAdminUserStatusDto } from './dto/update-admin-user-status.dto';
import {
  AdminUser,
  type AdminUserDocument,
} from './schemas/admin-user.schema';

/** 管理后台用户的登录查询、分页管理、启停、角色校验和密码哈希能力。 */
@Injectable()
export class AdminUsersService {
  constructor(
    @InjectModel(AdminUser.name)
    private readonly adminUserModel: Model<AdminUser>,
    private readonly adminRolesService: AdminRolesService,
  ) { }

  /** 根据登录账号查询用户，并显式读取默认隐藏的密码哈希。 */
  findByAccount(account: string) {
    return this.adminUserModel
      .findOne({ $or: [{ username: account }, { phone: account }] })
      .select('+password')
      .exec();
  }

  /** 按账号状态筛选，并按创建时间倒序分页查询后台用户。 */
  async findAll(query: QueryAdminUsersDto) {
    const { page, pageSize, status } = query;
    const filter: QueryFilter<AdminUserDocument> = {};

    // 新增状态字段前的历史管理员记录没有 status，业务上统一视为启用。
    if (status === 'active') filter.status = { $ne: 'disabled' };
    if (status === 'disabled') filter.status = 'disabled';

    const [list, total] = await Promise.all([
      this.adminUserModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec(),
      this.adminUserModel.countDocuments(filter).exec(),
    ]);
    return { list, total, page, pageSize };
  }

  /** 创建用户时校验角色并只持久化密码哈希。 */
  async create(dto: CreateAdminUserDto) {
    await this.adminRolesService.ensureAllExist(dto.roleIds);

    try {
      const password = await bcrypt.hash(dto.password, 12);
      return await this.adminUserModel.create({ ...dto, password });
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException('用户名或手机号已存在');
      }
      throw error;
    }
  }

  /** 普通管理员只能修改非超级管理员的资料，角色分配由超级管理员操作。 */
  async update(operator: AdminAuthorization, dto: UpdateAdminUserDto) {
    if (!isValidObjectId(dto.id)) throw new NotFoundException('用户不存在');

    const user = await this.adminUserModel.findById(dto.id).exec();
    if (!user) throw new NotFoundException('用户不存在');
    const { superAdminRoleId, isSuperAdmin } =
      await this.getSuperAdminRoleForUser(user);
    const operatorIsSuperAdmin = operator.roleCodes.includes('super_admin');
    if (isSuperAdmin && !operatorIsSuperAdmin) {
      throw new ForbiddenException('只有超级管理员可以修改超级管理员账号');
    }
    // 普通管理员只能修改自己的密码，避免通过重置他人密码取得更高权限的账号。
    if (dto.password && dto.id !== operator.id && !operatorIsSuperAdmin) {
      throw new ForbiddenException('只有超级管理员可以重置其他用户的密码');
    }

    if (dto.roleIds) {
      if (!operatorIsSuperAdmin) {
        throw new ForbiddenException('只有超级管理员可以分配用户角色');
      }
      await this.adminRolesService.ensureAllExist(dto.roleIds);
      // 移除最后一个启用中超级管理员的角色会使后台失去管理入口。
      if (
        isSuperAdmin &&
        user.status !== 'disabled' &&
        !dto.roleIds.includes(superAdminRoleId.toString())
      ) {
        await this.ensureAnotherActiveSuperAdmin(superAdminRoleId);
      }
    }

    const { id, password, ...profile } = dto;
    const update = password
      ? { ...profile, password: await bcrypt.hash(password, 12) }
      : profile;

    try {
      const user = await this.adminUserModel
        .findByIdAndUpdate(id, update, { new: true, runValidators: true })
        .exec();
      if (!user) throw new NotFoundException('用户不存在');
      return user;
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException('用户名或手机号已存在');
      }
      throw error;
    }
  }

  /**
   * 启用或停用管理员账号。
   * 禁止停用当前操作者和最后一个启用中的超级管理员，避免后台失去管理入口。
   */
  async updateStatus(
    operator: AdminAuthorization,
    dto: UpdateAdminUserStatusDto,
  ): Promise<AdminUserDocument> {
    if (!isValidObjectId(dto.id)) {
      throw new NotFoundException('用户不存在');
    }

    const user = await this.adminUserModel.findById(dto.id).exec();
    if (!user) throw new NotFoundException('用户不存在');
    const { superAdminRoleId, isSuperAdmin } =
      await this.getSuperAdminRoleForUser(user);
    if (isSuperAdmin && !operator.roleCodes.includes('super_admin')) {
      throw new ForbiddenException('只有超级管理员可以管理超级管理员账号');
    }
    if (user.status === dto.status) return user;

    if (dto.status === 'disabled') {
      if (dto.id === operator.id) {
        throw new ConflictException('不能停用当前登录账号');
      }

      if (isSuperAdmin) {
        await this.ensureAnotherActiveSuperAdmin(superAdminRoleId);
      }
    }

    user.status = dto.status;
    return user.save();
  }

  /** 删除用户前保护当前账号及最后一个启用中的超级管理员。 */
  async remove(operator: AdminAuthorization, id: string) {
    if (!isValidObjectId(id)) throw new NotFoundException('用户不存在');

    const user = await this.adminUserModel.findById(id).exec();
    if (!user) throw new NotFoundException('用户不存在');
    if (id === operator.id) {
      throw new ConflictException('不能删除当前登录账号');
    }

    const { superAdminRoleId, isSuperAdmin } =
      await this.getSuperAdminRoleForUser(user);
    if (isSuperAdmin) {
      if (!operator.roleCodes.includes('super_admin')) {
        throw new ForbiddenException('只有超级管理员可以删除超级管理员账号');
      }
      if (user.status !== 'disabled') {
        await this.ensureAnotherActiveSuperAdmin(superAdminRoleId);
      }
    }

    await this.adminUserModel.findByIdAndDelete(id).exec();
    return {};
  }

  /** 判断目标用户是否拥有系统超级管理员角色，供各用户管理动作统一使用。 */
  private async getSuperAdminRoleForUser(user: AdminUserDocument) {
    const superAdminRole = await this.adminRolesService.findByCode('super_admin');
    return {
      superAdminRoleId: superAdminRole._id,
      isSuperAdmin: user.roleIds.some((roleId) =>
        roleId.equals(superAdminRole._id),
      ),
    };
  }

  /** 失去一个启用中超级管理员前，确认系统仍有其他可用的超级管理员。 */
  private async ensureAnotherActiveSuperAdmin(
    superAdminRoleId: Types.ObjectId,
  ): Promise<void> {
    const activeSuperAdminCount = await this.adminUserModel
      .countDocuments({
        roleIds: superAdminRoleId,
        status: { $ne: 'disabled' },
      })
      .exec();
    if (activeSuperAdminCount <= 1) {
      throw new ConflictException('必须保留至少一个启用中的超级管理员');
    }
  }
}
