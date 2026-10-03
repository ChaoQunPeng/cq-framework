import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { catchError, from, mergeMap, Observable, throwError } from 'rxjs';
import { LoginLogsService } from './login-logs.service';

/** 在登录参数校验前进入请求链，记录成功及被校验或业务逻辑拒绝的登录请求。 */
@Injectable()
export class LoginLogInterceptor implements NestInterceptor {
  constructor(private readonly logs: LoginLogsService) {}

  /** 从原始请求提取可记录字段，不保存密码、Token 或完整请求体。 */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    // 参数校验尚未执行；缺失或类型错误的账号仍应留下失败记录。
    const submittedAccount = (request.body as { account?: unknown } | undefined)
      ?.account;
    // 校验失败的超长账号只保留 DTO 允许的长度，避免审计记录放大无效输入。
    const account =
      typeof submittedAccount === 'string' ? submittedAccount.slice(0, 30) : '';
    const source = {
      account,
      ip: request.ip,
      userAgent: request.get('user-agent'),
    };

    return next.handle().pipe(
      mergeMap(async (result: { id: string }) => {
        await this.logs.record({
          ...source,
          userId: result.id,
          status: 'success',
        });
        return result;
      }),
      catchError((error: unknown) =>
        from(
          this.logs.record({
            ...source,
            status: 'failure',
            reason:
              error instanceof HttpException ? error.message : '服务器内部错误',
          }),
        ).pipe(mergeMap(() => throwError(() => error))),
      ),
    );
  }
}
