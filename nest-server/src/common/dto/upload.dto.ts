import { IsIn } from 'class-validator';
import {
  COMMON_ALLOWED_UPLOAD_SCENES,
  type CommonUploadScene,
} from '../common.constants';

/** 公共上传请求参数，scene 用于选择对应业务的固定存储目录。 */
export class UploadDto {
  @IsIn(COMMON_ALLOWED_UPLOAD_SCENES)
  scene!: CommonUploadScene;
}
