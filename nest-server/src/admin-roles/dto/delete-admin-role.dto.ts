import { IsMongoId } from 'class-validator';

/** 删除角色的请求参数。 */
export class DeleteAdminRoleDto {
  @IsMongoId()
  id!: string;
}
