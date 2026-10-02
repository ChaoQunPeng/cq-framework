import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AdminAccessRequest } from './admin-access.types';
import { AdminAuthorizationService } from './admin-authorization.service';
import { REQUIRED_PERMISSIONS_KEY } from './require-permissions.decorator';
import { REQUIRED_ROLES_KEY } from './require-roles.decorator';

/** 实时校验管理员账号、角色和操作权限，并将有效授权信息挂载到当前请求。 */
@Injectable()
export class AdminAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly adminAuthorizationService: AdminAuthorizationService,
  ) {}

  /** 账号失效返回 401；缺少接口要求的角色或权限时返回 403。 */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AdminAccessRequest>();
    const authorization = await this.adminAuthorizationService.resolve(
      request.user.sub,
    );

    if (!authorization) {
      throw new UnauthorizedException('登录账号不存在或已停用');
    }

    request.adminAccess = authorization;

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      REQUIRED_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      REQUIRED_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const hasRequiredPermission =
      !requiredPermissions?.length ||
      requiredPermissions.some((code) =>
        authorization.permissionCodes.includes(code),
      );
    const hasRequiredRole =
      !requiredRoles?.length ||
      requiredRoles.some((code) => authorization.roleCodes.includes(code));

    if (!hasRequiredPermission || !hasRequiredRole) {
      throw new ForbiddenException('无权执行当前操作');
    }

    return true;
  }
}
