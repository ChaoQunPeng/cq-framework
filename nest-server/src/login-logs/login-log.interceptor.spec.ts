import {
  Body,
  Controller,
  INestApplication,
  Post,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { LoginAdminDto } from '../admin-auth/dto/login-admin.dto';
import { LoginLogInterceptor } from './login-log.interceptor';
import { LoginLogsService } from './login-logs.service';

/** 只测试真实 Nest 请求顺序：拦截器必须覆盖参数校验前的失败。 */
@Controller('login-test')
class LoginTestController {
  @Post()
  @UseInterceptors(LoginLogInterceptor)
  login(@Body() dto: LoginAdminDto) {
    return { id: 'admin-1', account: dto.account };
  }
}

describe('LoginLogInterceptor', () => {
  let app: INestApplication;
  /** 模拟异步写入登录日志，保持与服务接口一致。 */
  const record = jest.fn((log: Record<string, unknown>) => Promise.resolve(log));

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [LoginTestController],
      providers: [
        LoginLogInterceptor,
        { provide: LoginLogsService, useValue: { record } },
      ],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  });

  afterEach(() => record.mockClear());
  afterAll(async () => app.close());

  /** 缺少密码时 Controller 不执行，仍应留下失败登录记录。 */
  it('records a validation failure', async () => {
    await request(app.getHttpServer() as App)
      .post('/login-test')
      .send({ account: 'admin' })
      .expect(400);

    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({ account: 'admin', status: 'failure' }),
    );
  });

  /** 通过校验的登录记录管理员 ID，不记录提交的密码。 */
  it('records a successful login without the password', async () => {
    await request(app.getHttpServer() as App)
      .post('/login-test')
      .send({ account: 'admin', password: 'valid-password' })
      .expect(201);

    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({
        account: 'admin',
        userId: 'admin-1',
        status: 'success',
      }),
    );
    expect(record.mock.calls[0][0]).not.toHaveProperty('password');
  });
});
