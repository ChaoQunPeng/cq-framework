import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

/** 创建后台用户的请求参数，用户创建时至少分配一个角色。 */
export class CreateAdminUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  username!: string;

  @IsString()
  @Matches(/^1\d{10}$/)
  phone!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  password!: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsMongoId({ each: true })
  roleIds!: string[];
}
