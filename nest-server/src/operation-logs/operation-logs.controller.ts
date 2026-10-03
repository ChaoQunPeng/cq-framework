import { AdminAccessGuard } from '../admin-access/admin-access.guard';
import { RequirePermissions } from '../admin-access/require-permissions.decorator';
import { AdminJwtAuthGuard } from '../admin-auth/admin-jwt.guard';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { QueryOperationLogsDto } from './dto/query-operation-logs.dto';
import { OperationLogsService } from './operation-logs.service';

/** 操作日志只提供受权限保护的查询入口，不提供修改或删除接口。 */
@Controller('api/admin/operation-logs')
@UseGuards(AdminJwtAuthGuard, AdminAccessGuard)
export class OperationLogsController {
  constructor(private readonly logs: OperationLogsService) {}

  /** 分页查询用户和角色的管理操作记录。 */
  @Post('findLogs')
  @RequirePermissions('operation-log:read')
  findLogs(@Body() query: QueryOperationLogsDto) {
    return this.logs.findAll(query);
  }
}
