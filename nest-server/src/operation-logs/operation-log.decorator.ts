import { SetMetadata } from '@nestjs/common';

/** 接口标记的元数据键；只有明确标记的管理写操作才进入日志。 */
export const OPERATION_LOG_KEY = 'admin:operationLog';

export interface OperationLogMetadata {
  action: string;
  description: string;
}

/** 为成功的管理写操作声明稳定动作编码和业务说明。 */
export const RecordOperation = (action: string, description: string) =>
  SetMetadata(OPERATION_LOG_KEY, {
    action,
    description,
  } satisfies OperationLogMetadata);
