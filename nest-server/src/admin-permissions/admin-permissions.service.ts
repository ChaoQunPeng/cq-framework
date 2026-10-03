import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ADMIN_SYSTEM_PERMISSIONS } from './admin-permission.constants';
import { AdminPermission } from './schemas/admin-permission.schema';

/** 管理系统预定义权限的查询、关联校验和初始化能力。 */
@Injectable()
export class AdminPermissionsService implements OnModuleInit {
  constructor(
    @InjectModel(AdminPermission.name)
    private readonly adminPermissionModel: Model<AdminPermission>,
  ) {}

  /** 服务启动时同步代码定义的权限，确保新增权限可立即在角色表单中分配。 */
  async onModuleInit(): Promise<void> {
    await this.initializeSystemPermissions();
  }

  /** 查询全部权限，供角色分配权限时展示选项。 */
  findAll() {
    return this.adminPermissionModel.find().sort({ code: 1 }).exec();
  }

  /** 确认角色提交的权限 ID 均属于系统权限，避免保存无效权限关联。 */
  async ensureAllExist(permissionIds: string[]): Promise<void> {
    const permissionCount = await this.adminPermissionModel
      .countDocuments({ _id: { $in: permissionIds } })
      .exec();
    if (permissionCount !== permissionIds.length) {
      throw new NotFoundException('权限不存在');
    }
  }

  /**
   * 幂等写入系统权限。
   * 以 code 定位同一个权限，重复执行时只同步展示名称，不会创建重复记录。
   */
  async initializeSystemPermissions(): Promise<void> {
    await this.adminPermissionModel.bulkWrite(
      ADMIN_SYSTEM_PERMISSIONS.map((permission) => ({
        updateOne: {
          filter: { code: permission.code },
          update: { $set: permission },
          upsert: true,
        },
      })),
    );
  }
}
