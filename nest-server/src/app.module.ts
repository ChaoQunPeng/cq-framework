import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminAuthModule } from './admin-auth/admin-auth.module';
import { AdminPermissionsModule } from './admin-permissions/admin-permissions.module';
import { AdminRolesModule } from './admin-roles/admin-roles.module';
import { AdminUsersModule } from './admin-users/admin-users.module';
import { CommonModule } from './common/common.module';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';
import { ApiResponseInterceptor } from './common/interceptors/api-response.interceptor';

/** 各运行环境对应的配置文件，未匹配的环境（如本地开发）统一回退到 .env。 */
const envFileMap: Record<string, string> = {
  production: '.env.production',
};

/** 根据运行环境选择配置文件，并兼容仓库根目录和后端目录两种启动位置。 */
const envFileName = envFileMap[process.env.NODE_ENV ?? ''] ?? '.env';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [envFileName, `../${envFileName}`],
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI!),
    CommonModule,
    AdminPermissionsModule,
    AdminRolesModule,
    AdminUsersModule,
    AdminAuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 全局包装 Controller 的成功响应，静态图片等 Express 资源不经过该拦截器。
    { provide: APP_INTERCEPTOR, useClass: ApiResponseInterceptor },
    // 全局统一业务异常、参数校验异常和未知服务器异常的响应结构。
    { provide: APP_FILTER, useClass: ApiExceptionFilter },
  ],
})
export class AppModule { }
