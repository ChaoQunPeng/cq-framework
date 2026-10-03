import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

/** 登录日志按账号和结果分页检索。 */
export class QueryLoginLogsDto {
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

  @IsOptional()
  @IsString()
  account?: string;

  @IsOptional()
  @IsIn(['success', 'failure'])
  status?: 'success' | 'failure';
}
