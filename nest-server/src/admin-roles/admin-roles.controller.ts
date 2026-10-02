import { AdminAccessGuard } from '@/admin-access/admin-access.guard';
import { RequirePermissions } from '@/admin-access/require-permissions.decorator';
import { RequireRoles } from '@/admin-access/require-roles.decorator';
import { AdminJwtAuthGuard } from '@/admin-auth/admin-jwt.guard';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AdminRolesService } from './admin-roles.service';
import { CreateAdminRoleDto } from './dto/create-admin-role.dto';
import { DeleteAdminRoleDto } from './dto/delete-admin-role.dto';
import { UpdateAdminRoleDto } from './dto/update-admin-role.dto';

/** 角色后台接口，统一通过 POST 动作接口管理角色及权限分配。 */
@Controller('api/admin/roles')
@UseGuards(AdminJwtAuthGuard, AdminAccessGuard)
export class AdminRolesController {
  constructor(private readonly adminRolesService: AdminRolesService) {}

  /** 用户查看权限也可读取角色名称，供用户列表和表单展示。 */
  @Post('findRoles')
  @RequirePermissions('role:read', 'user:read')
  findRoles() {
    return this.adminRolesService.findAll();
  }

  /** 新增角色。 */
  @Post('createRole')
  @RequirePermissions('role:create')
  @RequireRoles('super_admin')
  createRole(@Body() dto: CreateAdminRoleDto) {
    return this.adminRolesService.create(dto);
  }

  /** 修改角色及其权限。 */
  @Post('updateRole')
  @RequirePermissions('role:update')
  @RequireRoles('super_admin')
  updateRole(@Body() dto: UpdateAdminRoleDto) {
    return this.adminRolesService.update(dto);
  }

  /** 删除角色。 */
  @Post('deleteRole')
  @RequirePermissions('role:delete')
  @RequireRoles('super_admin')
  deleteRole(@Body() dto: DeleteAdminRoleDto) {
    return this.adminRolesService.remove(dto.id);
  }
}
