import { AdminAccessGuard } from '@/admin-access/admin-access.guard';
import { RequirePermissions } from '@/admin-access/require-permissions.decorator';
import { AdminJwtAuthGuard } from '@/admin-auth/admin-jwt.guard';
import { Controller, Post, UseGuards } from '@nestjs/common';
import { AdminPermissionsService } from './admin-permissions.service';

/** 权限后台接口；权限由系统初始化，管理端只提供查询能力。 */
@Controller('api/admin/permissions')
@UseGuards(AdminJwtAuthGuard, AdminAccessGuard)
export class AdminPermissionsController {
  constructor(
    private readonly adminPermissionsService: AdminPermissionsService,
  ) {}

  /** 查询系统预定义的全部权限，供角色分配权限时展示选项。 */
  @Post('findPermissions')
  @RequirePermissions('role:read')
  findPermissions() {
    return this.adminPermissionsService.findAll();
  }
}
