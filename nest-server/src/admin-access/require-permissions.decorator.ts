import { SetMetadata } from '@nestjs/common';

export const REQUIRED_PERMISSIONS_KEY = 'admin:requiredPermissions';

/** 声明接口允许任一匹配的后台权限编码。 */
export const RequirePermissions = (...permissionCodes: string[]) =>
  SetMetadata(REQUIRED_PERMISSIONS_KEY, permissionCodes);
