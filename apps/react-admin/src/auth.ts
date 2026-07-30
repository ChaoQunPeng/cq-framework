const AUTH_STORAGE_KEY = 'cq-admin-authenticated'

/** 判断本地或当前会话中是否存在有效的后台登录状态。 */
export function isAuthenticated() {
  return (
    localStorage.getItem(AUTH_STORAGE_KEY) === 'true' ||
    sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true'
  )
}

/** 根据“记住登录状态”选项，将认证状态保存到对应浏览器存储。 */
export function signIn(remember: boolean) {
  signOut()
  const storage = remember ? localStorage : sessionStorage
  storage.setItem(AUTH_STORAGE_KEY, 'true')
}

/** 清理全部浏览器存储中的认证状态，确保退出后无法访问后台路由。 */
export function signOut() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
  sessionStorage.removeItem(AUTH_STORAGE_KEY)
}
