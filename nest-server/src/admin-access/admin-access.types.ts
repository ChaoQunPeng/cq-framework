import type { Request } from 'express';
import type { AdminJwtPayload } from '../common/interfaces/jwt-payload.interface';

/** 当前管理员经数据库实时解析后的身份和有效权限。 */
export interface AdminAuthorization {
  id: string;
  username: string;
  phone: string;
  roleCodes: string[];
  permissionCodes: string[];
}

/** 后台 Guard 完成认证和授权后挂载到请求上的上下文。 */
export interface AdminAccessRequest extends Request {
  user: AdminJwtPayload;
  adminAccess: AdminAuthorization;
}
