import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { mergeMap, Observable } from 'rxjs';
import type { AdminAccessRequest } from '../admin-access/admin-access.types';
import {
  OPERATION_LOG_KEY,
  type OperationLogMetadata,
} from './operation-log.decorator';
import { OperationLogsService } from './operation-logs.service';

/** 在标记的管理接口成功完成后采集日志，避免在每个业务服务中重复编排。 */
@Injectable()
export class OperationLogInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly logs: OperationLogsService,
  ) {}

  /** 使用 Guard 提供的实时管理员身份和接口结果中的对象 ID 形成日志。 */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const metadata = this.reflector.get<OperationLogMetadata>(
      OPERATION_LOG_KEY,
      context.getHandler(),
    );
    if (!metadata) return next.handle();

    const request = context.switchToHttp().getRequest<AdminAccessRequest>();
    return next.handle().pipe(
      mergeMap(async (result: { id?: string }) => {
        await this.logs.record({
          operatorId: request.adminAccess.id,
          operatorName: request.adminAccess.username,
          action: metadata.action,
          description: metadata.description,
          targetId: request.body.id ?? result.id,
          path: request.originalUrl,
          ip: request.ip,
          userAgent: request.get('user-agent'),
        });
        return result;
      }),
    );
  }
}
