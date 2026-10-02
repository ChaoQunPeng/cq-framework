import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'node:path';
import { AppModule } from './app.module';

/**
 * 初始化后端接口文档，供前后端联调时查看请求结构并携带 JWT 调试接口。
 */
function setupSwagger(app: NestExpressApplication): void {
  const config = new DocumentBuilder()
    .setTitle('cq-framework API')
    .setDescription('cq-framework 管理后台接口文档')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, document, {
    customSiteTitle: 'cq-framework API 文档',
  });
}

/** 启动 HTTP 服务并注册全局校验、跨域、接口文档和静态资源能力。 */
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // 允许的前端开发服务器来源，通过环境变量配置，默认指向本地 Umi Max 开发端口。
  app.enableCors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:8000' });

  setupSwagger(app);

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
