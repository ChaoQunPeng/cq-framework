import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';

/**
 * 校验 Authorization Bearer Token，缺失或无效时由 Passport 返回 401。
 * 后台管理接口专用：C 端登录签发的令牌（payload 中 type 为 'app'）一律拒绝访问。
 */
@Injectable()
export class AdminJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = JwtPayload>(err: Error | null, user: TUser): TUser {
    // token 缺失或无效时沿用 Passport 的认证错误，统一返回 401。
    if (err || !user) {
      throw err ?? new UnauthorizedException('登录状态无效');
    }
    // 后台接口只接受后台签发的令牌，C 端令牌即使签名有效也不予放行。
    if ((user as any).type === 'app') {
      throw new UnauthorizedException('C 端用户无权访问后台接口');
    }
    return user;
  }
}
