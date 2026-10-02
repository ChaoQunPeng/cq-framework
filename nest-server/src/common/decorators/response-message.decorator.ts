import { SetMetadata } from '@nestjs/common';

/** 成功响应 msg 字段的元数据键，由 ApiResponseInterceptor 读取。 */
export const RESPONSE_MESSAGE_KEY = 'responseMessage';

/**
 * 标记 Controller 方法在成功响应的 msg 中返回业务提示文本。
 * 未标记的接口保持 msg 为空字符串，不影响现有调用方。
 */
export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE_KEY, message);
