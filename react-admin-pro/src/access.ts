/**
 * @see https://umijs.org/docs/max/access#access
 * */
export default function access(
  initialState: { currentUser?: API.CurrentUser } | undefined,
) {
  const permissionCodes = new Set(
    initialState?.currentUser?.permissionCodes ?? [],
  );
  const isSuperAdmin =
    initialState?.currentUser?.roleCodes?.includes('super_admin') ?? false;

  /** 按后端定义的稳定权限编码生成路由和页面操作使用的权限项。 */
  const hasPermission = (code: string) => permissionCodes.has(code);

  return {
    isSuperAdmin,
    canReadUser: hasPermission('user:read'),
    // 新增管理员必须分配角色，与后端的超级管理员限制保持一致。
    canCreateUser: isSuperAdmin && hasPermission('user:create'),
    canUpdateUser: hasPermission('user:update'),
    canDeleteUser: hasPermission('user:delete'),
    canReadRole: hasPermission('role:read'),
    canCreateRole: isSuperAdmin && hasPermission('role:create'),
    canUpdateRole: isSuperAdmin && hasPermission('role:update'),
    canDeleteRole: isSuperAdmin && hasPermission('role:delete'),
  };
}
