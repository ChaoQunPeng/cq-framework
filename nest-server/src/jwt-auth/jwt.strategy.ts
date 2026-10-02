import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';

/** 解析管理端和 C 端共用签名配置签发的 JWT，并挂载身份载荷。 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /** Passport 会将返回的 JWT 身份信息挂载到 request.user。 */
  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
