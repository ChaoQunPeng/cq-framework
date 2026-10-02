import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import type { ApiResponse } from '../interfaces/api-response.interface';

/** Nest 内置异常和 ValidationPipe 已明确约定的 message 类型。 */
type HttpExceptionBody = {
  message: string | string[];
};

/** 将 Controller 链路中的异常统一转换为 code、msg、data 响应结构。 */
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  /**
   * HTTP 业务异常统一以 HTTP 200 + body.code 返回：
   * 业务失败统一 code 0，登录态失效（401）保留原状态码供前端识别并跳转登录；
   * 未知异常返回 HTTP 500，并避免向客户端暴露内部错误细节。
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const msg = isHttpException
      ? this.getHttpExceptionMessage(exception)
      : '服务器内部错误';

    if (!isHttpException) {
      const error = exception as Error;
      this.logger.error(error.message, error.stack);
    }

    // 登录态失效需要前端据此跳转登录页，保留 401 业务码；其余业务异常统一 code 0 表示失败。
    const isAuthFailure = isHttpException && status === HttpStatus.UNAUTHORIZED;
    const body: ApiResponse<Record<string, never>> = {
      code: isHttpException && !isAuthFailure ? 0 : status,
      msg,
      data: {},
    };
    // 项目统一约定「HTTP 200 + body.code」：RPC 风格下成功为 1、业务失败为 0，
    // 前端据此判断成功与否，避免把业务错误误判为网络层故障。
    // 非 HttpException（未知异常）仍保留 HTTP 500，便于基础设施层识别服务故障。
    response.status(
      isHttpException ? HttpStatus.OK : HttpStatus.INTERNAL_SERVER_ERROR,
    ).json(body);
  }

  /** 参数校验可能返回多条消息，合并后通过统一的 msg 字段提供给调用方。 */
  private getHttpExceptionMessage(exception: HttpException): string {
    const exceptionResponse = exception.getResponse();
    if (typeof exceptionResponse === 'string') return exceptionResponse;

    const { message } = exceptionResponse as HttpExceptionBody;
    return Array.isArray(message) ? message.join('；') : message;
  }
}
