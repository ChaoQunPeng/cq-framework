import { DeleteOutlined } from '@ant-design/icons';
import {
  type ActionType,
  PageContainer,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { App, Button, Popconfirm } from 'antd';
import { useAccess } from '@umijs/max';
import { useEffect, useMemo, useRef, useState } from 'react';
import RoleForm, { RoleEditTrigger } from './components/RoleForm';
import {
  deleteRole,
  getPermissions,
  getRoles,
  type PermissionItem,
  type RoleItem,
} from './service';

/** 系统角色管理列表，提供角色维护及权限分配入口。 */
export default function RoleManagement() {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();
  const access = useAccess();
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);

  /** 页面加载时读取系统权限字典，请求异常由全局请求处理器统一提示。 */
  useEffect(() => {
    void getPermissions()
      .then(setPermissions)
      .catch(() => undefined);
  }, []);

  /** 将权限 ID 映射为名称，列表展示时复用同一份权限字典。 */
  const permissionNameMap = useMemo(
    () =>
      new Map(
        permissions.map((permission) => [permission.id, permission.name]),
      ),
    [permissions],
  );

  /** 将角色接口的全量结果转换为 ProTable 请求数据。 */
  const requestRoles = async () => {
    const roles = await getRoles();
    return {
      data: roles,
      total: roles.length,
      success: true,
    };
  };

  /** 删除角色成功后刷新列表；已分配角色的冲突由全局处理器提示。 */
  const handleDelete = async (id: string) => {
    await deleteRole(id);
    message.success('角色删除成功');
    actionRef.current?.reload();
  };

  const columns: ProColumns<RoleItem>[] = [
    {
      title: '角色名称',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '角色编码',
      dataIndex: 'code',
      width: 180,
      ellipsis: true,
    },
    {
      title: '系统权限',
      dataIndex: 'permissionIds',
      width: 320,
      ellipsis: true,
      render: (_, record) => {
        // 角色允许暂不分配权限；权限字典加载完成前保留 ID，避免列表出现空白。
        const permissionNames = record.permissionIds
          .map(
            (permissionId) =>
              permissionNameMap.get(permissionId) ?? permissionId,
          )
          .join('、');
        return permissionNames || '-';
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      width: 180,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      width: 180,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 180,
      hideInTable:
        !access.canUpdateRole && !access.canDeleteRole,
      render: (_, record) => {
        /** 按权限逐项生成操作入口，无任何操作权限时隐藏整列。 */
        const actions = [
          access.canUpdateRole && record.code !== 'super_admin' ? (
            <RoleForm
              key="edit"
              role={record}
              permissions={permissions}
              trigger={<RoleEditTrigger />}
              onSaved={() => actionRef.current?.reload()}
            />
          ) : null,
          access.canDeleteRole && record.code !== 'super_admin' ? (
            <Popconfirm
              key="delete"
              title="删除角色"
              description={`确定删除“${record.name}”吗？`}
              okText="删除"
              cancelText="取消"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDelete(record.id)}
            >
              <Button
                type="link"
                danger
                size="small"
                icon={<DeleteOutlined />}
              >
                删除
              </Button>
            </Popconfirm>
          ) : null,
        ];
        return actions.filter(Boolean);
      },
    },
  ];

  return (
    <PageContainer title={false}>
      <ProTable<RoleItem>
        headerTitle="角色列表"
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        request={requestRoles}
        search={false}
        pagination={false}
        toolBarRender={() =>
          access.canCreateRole
            ? [
                <RoleForm
                  key="create"
                  permissions={permissions}
                  onSaved={() => actionRef.current?.reload()}
                />,
              ]
            : []
        }
      />
    </PageContainer>
  );
}
