import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminAccessModule } from '../admin-access/admin-access.module';
import { LoginLogsController } from './login-logs.controller';
import { LoginLogsService } from './login-logs.service';
import { LoginLog, LoginLogSchema } from './schemas/login-log.schema';

/** 注册登录日志模型、查询接口及认证流程使用的记录服务。 */
@Module({
  imports: [
    AdminAccessModule,
    MongooseModule.forFeature([
      { name: LoginLog.name, schema: LoginLogSchema },
    ]),
  ],
  controllers: [LoginLogsController],
  providers: [LoginLogsService],
  exports: [LoginLogsService],
})
export class LoginLogsModule {}
