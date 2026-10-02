/** 管理端 JWT 只承载稳定用户身份，角色和权限在每次请求时从数据库读取。 */
export interface AdminJwtPayload {
  sub: string;
  username: string;
  type?: never;
}

/** C 端 JWT 保留独立用户角色和来源标识，不参与后台角色体系。 */
export interface AppJwtPayload {
  sub: string;
  username: string;
  role: 'user';
  type: 'app';
}

/** 共享 JWT 策略支持的管理端和 C 端令牌联合类型。 */
export type JwtPayload = AdminJwtPayload | AppJwtPayload;
