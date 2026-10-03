import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminAccessGuard } from '../admin-access/admin-access.guard';
import { AdminJwtAuthGuard } from '../admin-auth/admin-jwt.guard';
import {
  COMMON_UPLOAD_MAX_SIZE,
  COMMON_UPLOAD_MIME_TYPES,
} from './common.constants';
import { CommonService } from './common.service';
import { UploadDto } from './dto/upload.dto';
import { RecordOperation } from '../operation-logs/operation-log.decorator';

/** 公共上传规则，供各业务模块复用的图片上传入口。 */
const commonUploadOptions = {
  limits: { fileSize: COMMON_UPLOAD_MAX_SIZE },
  fileFilter: (
    _request: Express.Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (
      !COMMON_UPLOAD_MIME_TYPES.includes(
        file.mimetype as (typeof COMMON_UPLOAD_MIME_TYPES)[number],
      )
    ) {
      callback(new BadRequestException('仅支持 JPG、PNG、WebP 图片'), false);
      return;
    }

    callback(null, true);
  },
};

/** 通用上传仅接受仍然有效的管理端登录态。 */
@Controller('api/common')
@UseGuards(AdminJwtAuthGuard, AdminAccessGuard)
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  /**
   * 上传文件。
   * @remarks 接收管理员提交的文件及业务场景，上传成功后返回该场景下的文件地址。
   */
  @Post('upload')
  @RecordOperation('file:upload', '上传图片')
  @UseInterceptors(FileInterceptor('file', commonUploadOptions))
  upload(@Body() dto: UploadDto, @UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('请选择上传文件');

    return this.commonService.upload(file, dto.scene);
  }
}
