import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import { QueryLoginLogsDto } from './dto/query-login-logs.dto';
import { LoginLog } from './schemas/login-log.schema';

/** 保存登录尝试并提供受权限保护的只读分页查询。 */
@Injectable()
export class LoginLogsService {
  private readonly logger = new Logger(LoginLogsService.name);

  constructor(
    @InjectModel(LoginLog.name) private readonly model: Model<LoginLog>,
  ) {}

  /** 登录日志异常不改变原登录结果，错误会写入服务器日志供排查。 */
  async record(log: Omit<LoginLog, 'createdAt'>): Promise<void> {
    try {
      await this.model.create(log);
    } catch (error) {
      this.logger.error(
        '登录日志写入失败',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  /** 按创建时间倒序查询，账号和登录结果使用精确匹配。 */
  async findAll(query: QueryLoginLogsDto) {
    const { page, pageSize, account, status } = query;
    const filter: QueryFilter<LoginLog> = {};
    if (account) filter.account = account;
    if (status) filter.status = status;

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
