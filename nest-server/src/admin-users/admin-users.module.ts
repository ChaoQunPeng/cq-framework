import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminAccessModule } from '../admin-access/admin-access.module';
import { AdminRolesModule } from '../admin-roles/admin-roles.module';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';
import { AdminUser, AdminUserSchema } from './schemas/admin-user.schema';

/** 注册后台用户模型、管理接口及供后台认证使用的用户查询能力。 */
@Module({
  imports: [
    AdminAccessModule,
    MongooseModule.forFeature([
      { name: AdminUser.name, schema: AdminUserSchema },
    ]),
    AdminRolesModule,
  ],
  controllers: [AdminUsersController],
  providers: [AdminUsersService],
  exports: [AdminUsersService],
})
export class AdminUsersModule {}
