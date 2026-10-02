import {
  CheckCircleOutlined,
  DeleteOutlined,
  StopOutlined,
} from "@ant-design/icons";
import {
  type ActionType,
  PageContainer,
  type ProColumns,
  ProTable,
} from "@ant-design/pro-components";
import { App, Button, Popconfirm } from "antd";
import { useAccess, useModel } from "@umijs/max";
import { useEffect, useMemo, useRef, useState } from "react";
import UserForm, { UserEditTrigger } from "./components/UserForm";
import {
  deleteUser,
  getRoles,
  getUsers,
  updateUserStatus,
  type AdminUserStatus,
  type RoleItem,
  type UserItem,
  type UserQuery,
} from "./service";

/** 管理员用户列表，承载用户分页、新增、编辑、启停和删除入口。 */
export default function UserManagement() {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();
  const access = useAccess();
  const { initialState } = useModel("@@initialState");
  const [roles, setRoles] = useState<RoleItem[]>([]);

  /** 页面加载时读取角色选项，请求异常由全局请求处理器统一提示。 */
  useEffect(() => {
    void getRoles()
      .then(setRoles)
      .catch(() => undefined);
  }, []);

  /** 将角色 ID 映射为展示名称，供列表在一次查表后重复使用。 */
  const roleNameMap = useMemo(
    () => new Map(roles.map((role) => [role.id, role.name])),
    [roles]
  );

  /** 删除用户后刷新列表，接口异常由全局请求处理器提示。 */
  const handleDelete = async (id: string) => {
    await deleteUser(id);
    message.success("用户删除成功");
    actionRef.current?.reload();
  };

  /** 更新管理员启停状态，成功后刷新列表以展示数据库中的最新结果。 */
  const handleStatusChange = async (id: string, status: AdminUserStatus) => {
    await updateUserStatus(id, status);
    message.success(status === "active" ? "用户已启用" : "用户已停用");
    actionRef.current?.reload();
  };

  const columns: ProColumns<UserItem>[] = [
    {
      title: "用户名",
      dataIndex: "username",
      ellipsis: true,
      search: false,
      width: 150,
      fixed: "left",
    },
    {
      title: "手机号",
      dataIndex: "phone",
      width: 150,
      search: false,
    },
    {
      title: "用户角色",
      dataIndex: "roleIds",
      width: 220,
      search: false,
      render: (_, record) =>
        record.roleIds
          .map((roleId) => roleNameMap.get(roleId) ?? roleId)
          .join("、"),
    },
    {
      title: "账号状态",
      dataIndex: "status",
      valueType: "select",
      valueEnum: {
        active: { text: "启用", status: "Success" },
        disabled: { text: "停用", status: "Default" },
      },
      width: 100,
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      valueType: "dateTime",
      width: 180,
      search: false,
    },
    {
      title: "更新时间",
      dataIndex: "updatedAt",
      valueType: "dateTime",
      width: 180,
      search: false,
    },
    {
      title: "操作",
      valueType: "option",
      width: 260,
      search: false,
      fixed: "right",
      hideInTable:
        !access.canUpdateUser && !access.canDeleteUser,
      render: (_, record) => {
        // 普通管理员不能修改、停用或删除超级管理员账号。
        const targetIsSuperAdmin = roles.some(
          (role) =>
            role.code === 'super_admin' && record.roleIds.includes(role.id),
        );
        const canManageTarget = access.isSuperAdmin || !targetIsSuperAdmin;
        /** 按权限逐项生成操作入口，无任何操作权限时隐藏整列。 */
        const actions = [
          access.canUpdateUser && canManageTarget ? (
            <UserForm
              key="edit"
              user={record}
              roles={roles}
              canAssignRoles={access.isSuperAdmin}
              canChangePassword={
                access.isSuperAdmin || record.id === initialState?.currentUser?.userid
              }
              trigger={<UserEditTrigger />}
              onSaved={() => actionRef.current?.reload()}
            />
          ) : null,
          access.canUpdateUser && canManageTarget ? (
            <Popconfirm
              key="status"
              title={record.status === "active" ? "停用用户" : "启用用户"}
              description={`确定${
                record.status === "active" ? "停用" : "启用"
              }“${record.username}”吗？`}
              okText={record.status === "active" ? "停用" : "启用"}
              cancelText="取消"
              okButtonProps={{ danger: record.status === "active" }}
              onConfirm={() =>
                handleStatusChange(
                  record.id,
                  record.status === "active" ? "disabled" : "active"
                )
              }
            >
              <Button
                type="link"
                danger={record.status === "active"}
                size="small"
                disabled={
                  record.status === "active" &&
                  record.id === initialState?.currentUser?.userid
                }
                icon={
                  record.status === "active" ? (
                    <StopOutlined />
                  ) : (
                    <CheckCircleOutlined />
                  )
                }
              >
                {record.status === "active" ? "停用" : "启用"}
              </Button>
            </Popconfirm>
          ) : null,
          access.canDeleteUser && canManageTarget ? (
            <Popconfirm
              key="delete"
              title="删除用户"
              description={`确定删除“${record.username}”吗？`}
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
      <ProTable<UserItem, UserQuery>
        headerTitle="用户列表"
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        request={getUsers}
        search={{ labelWidth: "auto" }}
        scroll={{ x: "max-content" }}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
        toolBarRender={() =>
          access.canCreateUser
            ? [
                <UserForm
                  key="create"
                  roles={roles}
                  canAssignRoles={access.isSuperAdmin}
                  canChangePassword
                  onSaved={() => actionRef.current?.reload()}
                />,
              ]
            : []
        }
      />
    </PageContainer>
  );
}
