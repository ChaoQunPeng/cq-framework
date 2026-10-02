import { AdminAccessGuard } from '../admin-access/admin-access.guard';
import type { AdminAccessRequest } from '../admin-access/admin-access.types';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { AdminJwtAuthGuard } from './admin-jwt.guard';
import { LoginAdminDto } from './dto/login-admin.dto';

/** 管理后台认证接口，提供登录、令牌签发和当前管理员授权信息。 */
@Controller('api/admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) { }

  /**
   * 管理端用户登录。
   * @remarks 接收账号密码并返回后续接口认证使用的 Bearer Token。
   */
  @Post('login')
  login(@Body() dto: LoginAdminDto) {
    return this.adminAuthService.login(dto);
  }

  /** 返回数据库实时计算的当前管理员资料、角色和有效权限。 */
  @Post('currentUser')
  @UseGuards(AdminJwtAuthGuard, AdminAccessGuard)
  currentUser(@Req() request: AdminAccessRequest) {
    return request.adminAccess;
  }
}
