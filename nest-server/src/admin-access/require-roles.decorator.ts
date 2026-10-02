import { SetMetadata } from '@nestjs/common';

export const REQUIRED_ROLES_KEY = 'admin:requiredRoles';

/** 声明接口允许任一匹配的后台角色编码。 */
export const RequireRoles = (...roleCodes: string[]) =>
  SetMetadata(REQUIRED_ROLES_KEY, roleCodes);
