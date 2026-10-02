import { requestApiData } from './api';

/** 后端 AdminAuthController 登录接口接收的账号密码。账号可以是用户名或手机号。 */
export type LoginParams = {
  account: string;
  password: string;
};

/** 后端签发 Token 时返回的登录用户信息。 */
export type LoginResponse = {
  id: string;
  username: string;
  phone: string;
  access_token: string;
};

/** 后端根据数据库实时返回的当前管理员资料和有效授权信息。 */
export type CurrentUserResponse = {
  id: string;
  username: string;
  phone: string;
  roleCodes: string[];
  permissionCodes: string[];
};

/** 调用 Nest 服务的管理端认证接口。 */
export async function login(body: LoginParams) {
  return requestApiData<LoginResponse>('/api/admin/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

/** 获取当前管理员资料以及服务端实时计算的角色、权限编码。 */
export async function getCurrentUser() {
  return requestApiData<CurrentUserResponse>('/api/admin/auth/currentUser', {
    method: 'POST',
  });
}
