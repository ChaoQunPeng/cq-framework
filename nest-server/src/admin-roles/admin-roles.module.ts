import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminAccessModule } from '../admin-access/admin-access.module';
import { AdminPermissionsModule } from '../admin-permissions/admin-permissions.module';
import { AdminRolesController } from './admin-roles.controller';
import { AdminRolesService } from './admin-roles.service';
import { AdminRole, AdminRoleSchema } from './schemas/admin-role.schema';

/** 注册角色模型、角色 CRUD 接口及系统角色初始化能力。 */
@Module({
  imports: [
    AdminAccessModule,
    MongooseModule.forFeature([
      { name: AdminRole.name, schema: AdminRoleSchema },
    ]),
    AdminPermissionsModule,
  ],
  controllers: [AdminRolesController],
  providers: [AdminRolesService],
  exports: [AdminRolesService],
})
export class AdminRolesModule {}
