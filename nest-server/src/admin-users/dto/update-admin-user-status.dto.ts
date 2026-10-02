import { IsIn, IsMongoId } from 'class-validator';
import {
  ADMIN_USER_STATUSES,
  type AdminUserStatus,
} from '../schemas/admin-user.schema';

/** 启用或停用后台管理员账号的请求参数。 */
export class UpdateAdminUserStatusDto {
  @IsMongoId()
  id!: string;

  @IsIn(ADMIN_USER_STATUSES)
  status!: AdminUserStatus;
}
