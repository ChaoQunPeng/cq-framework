import { Module } from '@nestjs/common';
import { AdminAccessModule } from '../admin-access/admin-access.module';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { CommonController } from './common.controller';
import { CommonService } from './common.service';

/**
 * 汇总项目内可跨业务复用的公共能力；上传入口复用管理端身份与实时授权校验。
 */
@Module({
  imports: [AdminAuthModule, AdminAccessModule],
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
