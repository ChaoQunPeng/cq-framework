import { AdminAccessGuard } from '../admin-access/admin-access.guard';
import type { AdminAccessRequest } from '../admin-access/admin-access.types';
import {
  Body,
  Controller,
  HttpException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { LoginLogsService } from '../login-logs/login-logs.service';
import { AdminAuthService } from './admin-auth.service';
import { AdminJwtAuthGuard } from './admin-jwt.guard';
import { LoginAdminDto } from './dto/login-admin.dto';

/** 管理后台认证接口，提供登录、令牌签发和当前管理员授权信息。 */
@Controller('api/admin/auth')
export class AdminAuthController {
  constructor(
    private readonly adminAuthService: AdminAuthService,
    private readonly loginLogsService: LoginLogsService,
  ) {}

  /**
   * 管理端用户登录。
   * @remarks 接收账号密码并返回后续接口认证使用的 Bearer Token。
   */
  @Post('login')
  async login(@Body() dto: LoginAdminDto, @Req() request: Request) {
    /** 登录成功和业务失败都记录；账号密码之外的敏感请求数据不写入日志。 */
    const source = {
      account: dto.account,
      ip: request.ip,
      userAgent: request.get('user-agent'),
    };
    try {
      const result = await this.adminAuthService.login(dto);
      await this.loginLogsService.record({
        ...source,
        userId: result.id,
        status: 'success',
      });
      return result;
    } catch (error) {
      await this.loginLogsService.record({
        ...source,
        status: 'failure',
        reason:
          error instanceof HttpException ? error.message : '服务器内部错误',
      });
      throw error;
    }
  }

  /** 返回数据库实时计算的当前管理员资料、角色和有效权限。 */
  @Post('currentUser')
  @UseGuards(AdminJwtAuthGuard, AdminAccessGuard)
  currentUser(@Req() request: AdminAccessRequest) {
    return request.adminAccess;
  }
}
