import { IsNotEmpty, IsString } from 'class-validator';

/** 删除用户动作的请求参数。 */
export class DeleteAdminUserDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}
