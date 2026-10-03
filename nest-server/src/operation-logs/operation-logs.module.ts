import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminAccessModule } from '../admin-access/admin-access.module';
import { OperationLogInterceptor } from './operation-log.interceptor';
import { OperationLogsController } from './operation-logs.controller';
import { OperationLogsService } from './operation-logs.service';
import {
  OperationLog,
  OperationLogSchema,
} from './schemas/operation-log.schema';

/** 注册操作日志存储、查询和供全局拦截器使用的采集能力。 */
@Module({
  imports: [
    AdminAccessModule,
    MongooseModule.forFeature([
      { name: OperationLog.name, schema: OperationLogSchema },
    ]),
  ],
  controllers: [OperationLogsController],
  providers: [OperationLogsService, OperationLogInterceptor],
  exports: [OperationLogInterceptor],
})
export class OperationLogsModule {}
