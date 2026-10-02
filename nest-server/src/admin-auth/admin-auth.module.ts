import { Module } from '@nestjs/common';
import { AdminAccessModule } from '../admin-access/admin-access.module';
import { AdminUsersModule } from '../admin-users/admin-users.module';
import { JwtAuthModule } from '../jwt-auth/jwt-auth.module';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { AdminJwtAuthGuard } from './admin-jwt.guard';

/** 注册管理端登录、当前用户授权查询及两端共用的 JWT 解析策略。 */
@Module({
  imports: [
    AdminAccessModule,
    AdminUsersModule,
    JwtAuthModule,
  ],
  controllers: [AdminAuthController],
  providers: [AdminAuthService, AdminJwtAuthGuard],
  exports: [AdminJwtAuthGuard],
})
export class AdminAuthModule {}
