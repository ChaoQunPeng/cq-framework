import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminAccessModule } from '../admin-access/admin-access.module';
import { AdminPermissionsController } from './admin-permissions.controller';
import { AdminPermissionsService } from './admin-permissions.service';
import {
  AdminPermission,
  AdminPermissionSchema,
} from './schemas/admin-permission.schema';

/** 注册权限模型、只读查询接口及系统权限初始化能力。 */
@Module({
  imports: [
    AdminAccessModule,
    MongooseModule.forFeature([
      { name: AdminPermission.name, schema: AdminPermissionSchema },
    ]),
  ],
  controllers: [AdminPermissionsController],
  providers: [AdminPermissionsService],
  exports: [AdminPermissionsService],
})
export class AdminPermissionsModule {}
