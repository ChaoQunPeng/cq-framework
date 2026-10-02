import {
  ArrayUnique,
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

/** 创建角色的请求参数。 */
export class CreateAdminRoleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @Matches(/^[a-z][a-z0-9_]*$/)
  code!: string;

  @IsArray()
  @ArrayUnique()
  @IsMongoId({ each: true })
  permissionIds!: string[];
}
