import type { LoginResponse } from '@/services/auth';

// 框架使用独立的本地存储键，避免同一地址切换原项目时复用其登录态。
const ACCESS_TOKEN_KEY = 'cq_framework_access_token';
const CURRENT_USER_KEY = 'cq_framework_current_user';

/** 读取当前会话的 Bearer Token，供全局请求拦截器使用。 */
export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/** 保存后端登录响应，并转换为前端布局和权限插件使用的用户结构。 */
export function saveAuthSession(response: LoginResponse): API.CurrentUser {
  const currentUser: API.CurrentUser = {
    userid: response.id,
    name: response.username,
    phone: response.phone,
  };
  localStorage.setItem(ACCESS_TOKEN_KEY, response.access_token);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
  return currentUser;
}

/** 从本地会话恢复用户信息，支持浏览器刷新后继续进入管理端。 */
export function getStoredCurrentUser(): API.CurrentUser | undefined {
  const serializedUser = localStorage.getItem(CURRENT_USER_KEY);
  return serializedUser
    ? (JSON.parse(serializedUser) as API.CurrentUser)
    : undefined;
}

/** 清理 Token 和用户信息，结束当前前端登录会话。 */
export function clearAuthSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
}
