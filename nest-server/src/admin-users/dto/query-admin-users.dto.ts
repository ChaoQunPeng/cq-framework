import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import {
  ADMIN_USER_STATUSES,
  type AdminUserStatus,
} from '../schemas/admin-user.schema';

/** 查询后台用户列表时使用的分页参数。 */
export class QueryAdminUsersDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 10;

  /** 按账号状态筛选；未设置状态的历史数据按启用处理。 */
  @IsOptional()
  @IsIn(ADMIN_USER_STATUSES)
  status?: AdminUserStatus;
}
