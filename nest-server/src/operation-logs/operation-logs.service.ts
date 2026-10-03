import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import { QueryOperationLogsDto } from './dto/query-operation-logs.dto';
import { OperationLog } from './schemas/operation-log.schema';

/** 保存后台管理操作，并提供只读分页查询。 */
@Injectable()
export class OperationLogsService {
  private readonly logger = new Logger(OperationLogsService.name);

  constructor(
    @InjectModel(OperationLog.name) private readonly model: Model<OperationLog>,
  ) {}

  /** 日志写入失败只记录服务器错误，避免已完成的业务操作被误报为失败。 */
  async record(log: Omit<OperationLog, 'createdAt'>): Promise<void> {
    try {
      await this.model.create(log);
    } catch (error) {
      this.logger.error(
        '操作日志写入失败',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  /** 按创建时间倒序返回日志，操作者和动作使用精确匹配。 */
  async findAll(query: QueryOperationLogsDto) {
    const { page, pageSize, operatorName, action } = query;
    const filter: QueryFilter<OperationLog> = {};
    if (operatorName) filter.operatorName = operatorName;
    if (action) filter.action = action;

    const [list, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean()
        .exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { list, total, page, pageSize };
  }
}
