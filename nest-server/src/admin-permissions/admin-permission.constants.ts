/** 管理后台内置系统权限；code 是鉴权逻辑与数据库共同遵守的稳定契约。 */
export const ADMIN_SYSTEM_PERMISSIONS = [
  { name: '查看用户', code: 'user:read' },
  { name: '新增用户', code: 'user:create' },
  { name: '编辑用户', code: 'user:update' },
  { name: '删除用户', code: 'user:delete' },
  { name: '查看角色', code: 'role:read' },
  { name: '新增角色', code: 'role:create' },
  { name: '编辑角色', code: 'role:update' },
  { name: '删除角色', code: 'role:delete' },
] as const;
