import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ADMIN_SYSTEM_PERMISSIONS } from '../admin-permissions/admin-permission.constants';
import { AdminUser } from '../admin-users/schemas/admin-user.schema';
import type { AdminAuthorization } from './admin-access.types';

/** 从数据库实时解析管理员身份、角色和权限，避免依赖 JWT 中的历史授权数据。 */
@Injectable()
export class AdminAuthorizationService {
  constructor(
    @InjectModel(AdminUser.name)
    private readonly adminUserModel: Model<AdminUser>,
  ) {}

  /**
   * 使用一次聚合查询读取管理员及其当前有效权限。
   * 账号被删除时返回 null，由 Guard 将当前登录状态判定为失效。
   */
  async resolve(userId: string): Promise<AdminAuthorization | null> {
    const [authorization] = await this.adminUserModel
      .aggregate<AdminAuthorization>([
        {
          // 兼容新增状态字段前的历史账号；只有明确停用的账号拒绝访问。
          $match: {
            _id: new Types.ObjectId(userId),
            status: { $ne: 'disabled' },
          },
        },
        {
          $lookup: {
            from: 'admin_roles',
            localField: 'roleIds',
            foreignField: '_id',
            as: 'roles',
          },
        },
        {
          $lookup: {
            from: 'admin_permissions',
            localField: 'roles.permissionIds',
            foreignField: '_id',
            as: 'permissions',
          },
        },
        {
          $project: {
            _id: 0,
            id: { $toString: '$_id' },
            username: 1,
            phone: 1,
            roleCodes: '$roles.code',
            permissionCodes: '$permissions.code',
          },
        },
      ])
      .exec();

    // 内置超级管理员始终拥有代码声明的全部系统权限，包括尚未同步到角色关联的新增权限。
    if (authorization?.roleCodes.includes('super_admin')) {
      authorization.permissionCodes = [
        ...new Set([
          ...authorization.permissionCodes,
          ...ADMIN_SYSTEM_PERMISSIONS.map((permission) => permission.code),
        ]),
      ];
    }

    return authorization ?? null;
  }
}
