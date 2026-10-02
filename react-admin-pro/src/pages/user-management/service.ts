import { requestApiData, type PageData } from '@/services/api';

/** 后台管理员账号状态，与后端 AdminUser 状态契约保持一致。 */
export type AdminUserStatus = 'active' | 'disabled';

/** 用户表单和列表使用的角色基础信息。 */
export type RoleItem = {
  id: string;
  name: string;
  code: string;
};

/** 用户列表展示及编辑使用的公开用户资料，不包含密码。 */
export type UserItem = {
  id: string;
  username: string;
  phone: string;
  roleIds: string[];
  status: AdminUserStatus;
  createdAt: string;
  updatedAt: string;
};

export type UserQuery = {
  page?: number;
  pageSize?: number;
  status?: AdminUserStatus;
};

export type CreateUserPayload = Pick<
  UserItem,
  'username' | 'phone' | 'roleIds'
> & {
  password: string;
};

export type UpdateUserPayload = Partial<CreateUserPayload> & {
  id: string;
};

/** 查询全部后台角色，供用户列表展示和用户表单多选使用。 */
export function getRoles() {
  return requestApiData<RoleItem[]>('/api/admin/roles/findRoles', {
    method: 'POST',
  });
}

/** 调用后端受 JWT 保护的用户分页接口，并转换为 ProTable 需要的数据结构。 */
export async function getUsers({
  current,
  ...params
}: UserQuery & { current?: number }) {
  // ProTable 固定使用 current，调用业务接口时统一转换为后端约定的 page。
  const pageData = await requestApiData<PageData<UserItem>>(
    '/api/admin/users/findUsers',
    {
      method: 'POST',
      data: { ...params, page: current },
    },
  );
  return {
    data: pageData.list,
    total: pageData.total,
    success: true,
    current: pageData.page,
    pageSize: pageData.pageSize,
  };
}

/** 创建用户，后端负责密码哈希和唯一性校验。 */
export function createUser(values: CreateUserPayload) {
  return requestApiData<UserItem>('/api/admin/users/createUser', {
    method: 'POST',
    data: values,
  });
}

/** 更新指定用户资料。 */
export function updateUser(values: UpdateUserPayload) {
  return requestApiData<UserItem>('/api/admin/users/updateUser', {
    method: 'POST',
    data: values,
  });
}

/** 启用或停用指定管理员账号。 */
export function updateUserStatus(id: string, status: AdminUserStatus) {
  return requestApiData<UserItem>('/api/admin/users/updateUserStatus', {
    method: 'POST',
    data: { id, status },
  });
}

/** 删除指定用户。 */
export function deleteUser(id: string) {
  return requestApiData<Record<string, never>>('/api/admin/users/deleteUser', {
    method: 'POST',
    data: { id },
  });
}
