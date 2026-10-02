import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/** 管理端账号密码登录请求。 */
export class LoginAdminDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  account!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  password!: string;
}
