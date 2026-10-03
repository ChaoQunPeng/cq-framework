import { AdminAccessGuard } from '../admin-access/admin-access.guard';
import { RequirePermissions } from '../admin-access/require-permissions.decorator';
import { AdminJwtAuthGuard } from '../admin-auth/admin-jwt.guard';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { QueryLoginLogsDto } from './dto/query-login-logs.dto';
import { LoginLogsService } from './login-logs.service';

/** 登录日志仅提供受权限保护的查询接口。 */
@Controller('api/admin/login-logs')
@UseGuards(AdminJwtAuthGuard, AdminAccessGuard)
export class LoginLogsController {
  constructor(private readonly logs: LoginLogsService) {}

  /** 分页查询成功和失败的后台登录记录。 */
  @Post('findLogs')
  @RequirePermissions('login-log:read')
  findLogs(@Body() query: QueryLoginLogsDto) {
    return this.logs.findAll(query);
  }
}
