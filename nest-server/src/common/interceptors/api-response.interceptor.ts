import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map } from 'rxjs';
import type { Observable } from 'rxjs';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';
import type { ApiResponse } from '../interfaces/api-response.interface';

/** 业务接口成功时统一使用 code=1，实际返回值原样放入 data。 */
@Injectable()
export class ApiResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  constructor(private readonly reflector: Reflector) {}

  /** 在 Controller 返回后统一包装成功响应，避免各业务模块重复组装响应结构。 */
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    // 标记 @ResponseMessage 的接口在 msg 中返回动作成功提示，未标记时保持为空字符串。
    const msg =
      this.reflector.get<string>(RESPONSE_MESSAGE_KEY, context.getHandler()) ??
      '';

    return next.handle().pipe(
      map((data) => ({
        code: 1,
        msg,
        data,
      })),
    );
  }
}
