import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { AdminPermissionsService } from '../admin-permissions/admin-permissions.service';
import { CreateAdminRoleDto } from './dto/create-admin-role.dto';
import { UpdateAdminRoleDto } from './dto/update-admin-role.dto';
import {
  AdminRole,
  type AdminRoleDocument,
} from './schemas/admin-role.schema';

/** 管理后台角色、权限分配及系统内置角色初始化。 */
@Injectable()
export class AdminRolesService {
  constructor(
    @InjectModel(AdminRole.name)
    private readonly adminRoleModel: Model<AdminRole>,
    @InjectConnection()
    private readonly connection: Connection,
    private readonly adminPermissionsService: AdminPermissionsService,
  ) {}

  /** 查询全部角色，供角色管理和用户分配角色时使用。 */
  findAll() {
    return this.adminRoleModel.find().sort({ createdAt: -1 }).exec();
  }

  /** 按稳定角色编码查询角色，供管理员状态等后台规则识别系统角色。 */
  async findByCode(code: string): Promise<AdminRoleDocument> {
    const role = await this.adminRoleModel.findOne({ code }).exec();
    if (!role) throw new NotFoundException('角色不存在');
    return role;
  }

  /** 确认用户提交的角色 ID 均属于角色集合，避免保存无效角色关联。 */
  async ensureAllExist(roleIds: string[]): Promise<void> {
    const roleCount = await this.adminRoleModel
      .countDocuments({ _id: { $in: roleIds } })
      .exec();
    if (roleCount !== roleIds.length) {
      throw new NotFoundException('角色不存在');
    }
  }

  /** 创建角色，并确保分配的权限均来自系统权限集合。 */
  async create(dto: CreateAdminRoleDto) {
    await this.adminPermissionsService.ensureAllExist(dto.permissionIds);

    try {
      return await this.adminRoleModel.create(dto);
    } catch (error) {
      // MongoDB 唯一索引冲突表示角色名称或编码已被占用。
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException('角色名称或编码已存在');
      }
      throw error;
    }
  }

  /** 更新角色资料；提交权限列表时同步校验全部权限关联。 */
  async update(dto: UpdateAdminRoleDto) {
    const { id, ...updates } = dto;
    const existingRole = await this.adminRoleModel.findById(id).exec();
    if (!existingRole) throw new NotFoundException('角色不存在');
    // 内置超级管理员的有效权限由授权服务保障，角色资料禁止手工修改。
    if (existingRole.code === 'super_admin') {
      throw new ConflictException('内置超级管理员角色不可修改');
    }

    if (dto.permissionIds) {
      await this.adminPermissionsService.ensureAllExist(dto.permissionIds);
    }

    try {
      const role = await this.adminRoleModel
        .findByIdAndUpdate(id, updates, { new: true, runValidators: true })
        .exec();
      if (!role) throw new NotFoundException('角色不存在');
      return role;
    } catch (error) {
      // 修改名称或编码时同样遵守角色唯一性约束。
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException('角色名称或编码已存在');
      }
      throw error;
    }
  }

  /** 删除未分配给任何用户的角色，避免用户保留失效角色关联。 */
  async remove(id: string) {
    const role = await this.adminRoleModel.findById(id).exec();
    if (!role) throw new NotFoundException('角色不存在');
    if (role.code === 'super_admin') {
      throw new ConflictException('内置超级管理员角色不可删除');
    }

    const assignedUser = await this.connection
      .collection('admin_users')
      .findOne(
        { roleIds: new Types.ObjectId(id) },
        { projection: { _id: 1 } },
      );
    if (assignedUser) {
      throw new ConflictException('角色已分配给用户，无法删除');
    }

    await this.adminRoleModel.findByIdAndDelete(id).exec();
    return {};
  }

  /**
   * 幂等初始化超级管理员角色。
   * seed 同步持久化的权限关联；运行时授权服务也会授予全部内置权限。
   */
  async initializeSystemRoles(): Promise<AdminRoleDocument> {
    const permissions = await this.adminPermissionsService.findAll();

    return this.adminRoleModel
      .findOneAndUpdate(
        { code: 'super_admin' },
        {
          $set: {
            name: '超级管理员',
            permissionIds: permissions.map((permission) => permission._id),
          },
        },
        { upsert: true, new: true, runValidators: true },
      )
      .orFail()
      .exec();
  }
}
