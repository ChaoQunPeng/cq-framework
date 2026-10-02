import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AdminPermission,
  AdminPermissionSchema,
} from '../admin-permissions/schemas/admin-permission.schema';
import {
  AdminRole,
  AdminRoleSchema,
} from '../admin-roles/schemas/admin-role.schema';
import {
  AdminUser,
  AdminUserSchema,
} from '../admin-users/schemas/admin-user.schema';
import { AdminAccessGuard } from './admin-access.guard';
import { AdminAuthorizationService } from './admin-authorization.service';

/** 注册后台实时授权查询和接口访问 Guard，避免业务模块之间形成循环依赖。 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AdminUser.name, schema: AdminUserSchema },
      { name: AdminRole.name, schema: AdminRoleSchema },
      { name: AdminPermission.name, schema: AdminPermissionSchema },
    ]),
  ],
  providers: [AdminAuthorizationService, AdminAccessGuard],
  exports: [AdminAuthorizationService, AdminAccessGuard],
})
export class AdminAccessModule {}
