import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  COMMON_UPLOAD_EXTENSION_BY_MIME_TYPE,
  COMMON_UPLOAD_SCENE_CONFIG,
  type CommonUploadScene,
} from './common.constants';

@Injectable()
export class CommonService {
  private readonly logger = new Logger(CommonService.name);
  private readonly uploadBaseUrl: string;

  constructor(configService: ConfigService) {
    // 上传地址必须由运行环境明确配置，确保接口返回当前环境可直接访问的完整 URL。
    this.uploadBaseUrl = configService.getOrThrow<string>('UPLOAD_BASE_URL');
  }

  /**
   * 按业务场景保存通过公共规则校验的文件，并返回可直接保存的访问地址。
   */
  async upload(
    file: Express.Multer.File,
    scene: CommonUploadScene,
  ): Promise<{ url: string }> {
    const { directory, urlPrefix } = COMMON_UPLOAD_SCENE_CONFIG[scene];
    const extension = COMMON_UPLOAD_EXTENSION_BY_MIME_TYPE[file.mimetype];
    const filename = `${randomUUID()}${extension}`;

    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, filename), file.buffer);

    const url = new URL(`${urlPrefix}${filename}`, this.uploadBaseUrl);
    return { url: url.toString() };
  }

  /**
   * 删除指定业务场景下的上传文件，用于业务保存失败、替换文件和删除记录时清理资源。
   */
  async removeFile(fileUrl: string, scene: CommonUploadScene): Promise<void> {
    const { directory, urlPrefix } = COMMON_UPLOAD_SCENE_CONFIG[scene];
    // 使用配置地址作为相对路径的基准，兼容历史相对地址和新生成的完整地址。
    const pathname = new URL(fileUrl, this.uploadBaseUrl).pathname;
    if (!pathname.startsWith(urlPrefix)) return;

    const filename = pathname.slice(urlPrefix.length);
    try {
      await unlink(join(directory, filename));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        this.logger.warn(`删除上传文件失败: ${filename}`);
      }
    }
  }
}
