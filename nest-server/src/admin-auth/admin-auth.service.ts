import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AdminUsersService } from '../admin-users/admin-users.service';
import type { AdminJwtPayload } from '../common/interfaces/jwt-payload.interface';
import { LoginAdminDto } from './dto/login-admin.dto';

/** 登录成功后返回给客户端的用户身份及访问令牌。 */
export interface AdminLoginResponse {
  id: string;
  username: string;
  phone: string;
  access_token: string;
}

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly adminUsersService: AdminUsersService,
    private readonly jwtService: JwtService,
  ) { }

  /**
   * 校验管理员账号状态和密码，只有启用中的账号才签发访问令牌。
   * 登录凭据失败统一用 BadRequestException（业务 code 0）；
   * 401 保留给 JWT 登录态失效场景（见 admin-jwt.guard、admin-access.guard）。
   */
  async login(dto: LoginAdminDto): Promise<AdminLoginResponse> {
    const user = await this.adminUsersService.findByAccount(dto.account);
    if (!user) throw new BadRequestException('用户名不存在');
    if (user.status === 'disabled') {
      throw new BadRequestException('账号已停用');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new BadRequestException('密码错误');
    }

    const payload: AdminJwtPayload = {
      sub: user.id,
      username: user.username,
    };

    return {
      id: user.id,
      username: user.username,
      phone: user.phone,
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
