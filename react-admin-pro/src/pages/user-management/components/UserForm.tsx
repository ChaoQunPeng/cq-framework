import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { App, Button, type ButtonProps } from 'antd';
import {
  createUser,
  type CreateUserPayload,
  type RoleItem,
  type UserItem,
  updateUser,
} from '../service';

type UserFormValues = Pick<UserItem, 'username' | 'phone'> & {
  roleIds?: string[];
  password?: string;
};

type UserFormProps = {
  user?: UserItem;
  roles: RoleItem[];
  canAssignRoles: boolean;
  canChangePassword: boolean;
  trigger?: React.JSX.Element;
  onSaved: () => void;
};

/** 用户新增和编辑共用表单，密码是否必填由业务场景决定。 */
export default function UserForm({
  user,
  roles,
  canAssignRoles,
  canChangePassword,
  trigger,
  onSaved,
}: UserFormProps) {
  const { message } = App.useApp();
  const editing = Boolean(user);

  /** 编辑时空密码不提交，表示保持用户原密码不变。 */
  const handleFinish = async (values: UserFormValues) => {
    try {
      if (user) {
        const { password, roleIds, ...profile } = values;
        await updateUser({
          id: user.id,
          ...profile,
          ...(password ? { password } : {}),
          // 普通管理员编辑资料时不提交角色字段，后端也独立校验分配权限。
          ...(canAssignRoles && roleIds ? { roleIds } : {}),
        });
      } else {
        await createUser(values as CreateUserPayload);
      }
      message.success(editing ? '用户更新成功' : '用户创建成功');
      onSaved();
      return true;
    } catch {
      return false;
    }
  };

  /** 管理员编辑表单与角色表单统一使用横向标签布局。 */
  return (
    <ModalForm<UserFormValues>
      key={user?.id ?? 'create-user'}
      title={editing ? '编辑用户' : '新增用户'}
      trigger={
        trigger ?? (
          <Button type="primary" icon={<PlusOutlined />}>
            新增用户
          </Button>
        )
      }
      width={520}
      layout="horizontal"
      labelCol={{ span: 5 }}
      wrapperCol={{ span: 18 }}
      initialValues={{
        username: user?.username,
        phone: user?.phone,
        roleIds: user?.roleIds ?? [],
      }}
      modalProps={{ destroyOnHidden: true }}
      onFinish={handleFinish}
    >
      <ProFormText
        name="username"
        label="用户名"
        rules={[
          { required: true, message: '请输入用户名' },
          { max: 30, message: '用户名不能超过 30 个字符' },
        ]}
      />
      <ProFormText
        name="phone"
        label="手机号"
        rules={[
          { required: true, message: '请输入手机号' },
          { pattern: /^1\d{10}$/, message: '请输入正确的 11 位手机号' },
        ]}
      />
      {canChangePassword && (
        <ProFormText.Password
          name="password"
          label="密码"
          rules={[
            { required: !editing, message: '请输入密码' },
            { max: 100, message: '密码不能超过 100 个字符' },
          ]}
        />
      )}
      {canAssignRoles && (
        <ProFormSelect
          name="roleIds"
          label="用户角色"
          fieldProps={{ mode: 'multiple' }}
          options={roles.map((role) => ({
            label: role.name,
            value: role.id,
          }))}
          rules={[{ required: true, message: '请至少选择一个用户角色' }]}
        />
      )}
    </ModalForm>
  );
}

/** 用户列表操作列使用的编辑按钮，并透传弹框注入的打开事件。 */
export function UserEditTrigger(props: ButtonProps) {
  return (
    <Button {...props} type="link" size="small" icon={<EditOutlined />}>
      编辑
    </Button>
  );
}
