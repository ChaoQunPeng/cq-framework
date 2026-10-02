import { requestApiData } from '@/services/api';

/** 系统预定义权限，角色表单只负责选择，不提供权限增删改入口。 */
export type PermissionItem = {
  id: string;
  name: string;
  code: string;
};

/** 角色列表和编辑表单共用的角色数据。 */
export type RoleItem = {
  id: string;
  name: string;
  code: string;
  permissionIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreateRolePayload = Pick<
  RoleItem,
  'name' | 'code' | 'permissionIds'
>;

export type UpdateRolePayload = Partial<CreateRolePayload> & {
  id: string;
};

/** 查询全部角色，供角色列表展示。 */
export function getRoles() {
  return requestApiData<RoleItem[]>('/api/admin/roles/findRoles', {
    method: 'POST',
  });
}

/** 查询系统预定义权限，供角色新增和编辑时分配。 */
export function getPermissions() {
  return requestApiData<PermissionItem[]>(
    '/api/admin/permissions/findPermissions',
    {
      method: 'POST',
    },
  );
}

/** 创建角色并保存其权限关联。 */
export function createRole(values: CreateRolePayload) {
  return requestApiData<RoleItem>('/api/admin/roles/createRole', {
    method: 'POST',
    data: values,
  });
}

/** 更新指定角色的基础信息和权限关联。 */
export function updateRole(values: UpdateRolePayload) {
  return requestApiData<RoleItem>('/api/admin/roles/updateRole', {
    method: 'POST',
    data: values,
  });
}

/** 删除未分配给用户的角色，已被引用时由后端返回业务冲突。 */
export function deleteRole(id: string) {
  return requestApiData<Record<string, never>>('/api/admin/roles/deleteRole', {
    method: 'POST',
    data: { id },
  });
}
