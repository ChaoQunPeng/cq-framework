import { AdminAccessGuard } from '@/admin-access/admin-access.guard';
import type { AdminAccessRequest } from '@/admin-access/admin-access.types';
import { RequirePermissions } from '@/admin-access/require-permissions.decorator';
import { RequireRoles } from '@/admin-access/require-roles.decorator';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AdminJwtAuthGuard } from '@/admin-auth/admin-jwt.guard';
import { AdminUsersService } from './admin-users.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { DeleteAdminUserDto } from './dto/delete-admin-user.dto';
import { QueryAdminUsersDto } from './dto/query-admin-users.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { UpdateAdminUserStatusDto } from './dto/update-admin-user-status.dto';

/** 管理后台用户接口，统一校验后台 Token 后再处理用户和角色数据。 */
@Controller('api/admin/users')
// 用户管理接口统一校验管理端 Token，防止未登录请求修改用户及其角色分配。
@UseGuards(AdminJwtAuthGuard, AdminAccessGuard)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) { }

  /**
   * 查询管理端用户。
   * @remarks 按分页条件查询管理端用户列表。
   */
  @Post('findUsers')
  @RequirePermissions('user:read')
  findUsers(@Body() query: QueryAdminUsersDto) {
    return this.adminUsersService.findAll(query);
  }

  /**
   * 新增管理端用户。
   * @remarks 服务层负责密码哈希及唯一性校验。
   */
  @Post('createUser')
  @RequirePermissions('user:create')
  @RequireRoles('super_admin')
  createUser(@Body() dto: CreateAdminUserDto) {
    return this.adminUsersService.create(dto);
  }

  /**
   * 修改管理端用户。
   * @remarks 用户 ID 与待更新字段一并通过请求体提交。
   */
  @Post('updateUser')
  @RequirePermissions('user:update')
  updateUser(
    @Req() request: AdminAccessRequest,
    @Body() dto: UpdateAdminUserDto,
  ) {
    return this.adminUsersService.update(request.adminAccess, dto);
  }

  /**
   * 启用或停用管理端用户。
   * @remarks 当前操作者 ID 来自实时授权上下文，用于禁止停用自己。
   */
  @Post('updateUserStatus')
  @RequirePermissions('user:update')
  updateUserStatus(
    @Req() request: AdminAccessRequest,
    @Body() dto: UpdateAdminUserStatusDto,
  ) {
    return this.adminUsersService.updateStatus(request.adminAccess, dto);
  }

  /**
   * 删除管理端用户。
   * @remarks 根据请求体中的用户 ID 删除用户。
   */
  @Post('deleteUser')
  @RequirePermissions('user:delete')
  deleteUser(
    @Req() request: AdminAccessRequest,
    @Body() dto: DeleteAdminUserDto,
  ) {
    return this.adminUsersService.remove(request.adminAccess, dto.id);
  }
}
