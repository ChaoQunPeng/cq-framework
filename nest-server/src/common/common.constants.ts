import { join } from 'node:path';

/**
 * 公共上传支持的业务场景，场景由后端映射到固定存储目录。
 * 框架默认只提供通用场景 common，业务项目接入时按需在此扩展自己的场景。
 */
export const COMMON_UPLOAD_SCENES = {
  COMMON: 'common',
} as const;

export type CommonUploadScene =
  (typeof COMMON_UPLOAD_SCENES)[keyof typeof COMMON_UPLOAD_SCENES];

/** 公共上传接口允许提交的业务场景集合。 */
export const COMMON_ALLOWED_UPLOAD_SCENES = [
  COMMON_UPLOAD_SCENES.COMMON,
] as const;

/** 不同业务场景对应的落盘目录和静态资源访问前缀。 */
export const COMMON_UPLOAD_SCENE_CONFIG: Record<
  CommonUploadScene,
  { directory: string; urlPrefix: string }
> = {
  [COMMON_UPLOAD_SCENES.COMMON]: {
    directory: join(process.cwd(), 'uploads', 'common'),
    urlPrefix: '/uploads/common/',
  },
};

/** 当前图片上传业务允许的最大文件大小为 5MB。 */
export const COMMON_UPLOAD_MAX_SIZE = 5 * 1024 * 1024;

/** 当前图片上传支持的文件类型，后续按真实上传场景统一扩展。 */
export const COMMON_UPLOAD_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

/** 将已校验的图片类型转换为服务器落盘文件扩展名。 */
export const COMMON_UPLOAD_EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};
