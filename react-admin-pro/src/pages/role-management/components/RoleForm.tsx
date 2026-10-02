import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ModalForm, ProFormText } from '@ant-design/pro-components';
import { App, Button, Checkbox, Form, type ButtonProps } from 'antd';
import { createStyles } from 'antd-style';
import {
  createRole,
  type PermissionItem,
  type RoleItem,
  updateRole,
} from '../service';

type RoleFormValues = Pick<RoleItem, 'name' | 'code' | 'permissionIds'>;

const PERMISSION_GROUP_NAMES = {
  role: '角色管理',
  user: '用户管理',
} as const;

type PermissionGroupName = keyof typeof PERMISSION_GROUP_NAMES;

type PermissionSelectorProps = {
  permissions: PermissionItem[];
  value?: string[];
  onChange?: (permissionIds: string[]) => void;
};

const useStyles = createStyles(({ token }) => ({
  permissionSelector: {
    overflow: 'hidden',
    border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadius,
  },
  selectAll: {
    padding: '10px 12px',
    borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
    background: token.colorFillAlter,
  },
  groupList: {
    padding: '0 12px',
  },
  permissionGroup: {
    padding: '12px 0',
    '&:not(:last-child)': {
      borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
    },
  },
  groupTitle: {
    fontWeight: token.fontWeightStrong,
  },
  groupOptions: {
    display: 'grid',
    gap: 8,
    marginTop: 10,
    paddingLeft: 24,
  },
}));

type RoleFormProps = {
  role?: RoleItem;
  permissions: PermissionItem[];
  trigger?: React.JSX.Element;
  onSaved: () => void;
};

/** 将“资源:操作”权限编码转换为纯前端分组，并保持接口返回的分组顺序。 */
function groupPermissions(permissions: PermissionItem[]) {
  return permissions.reduce<
    Array<{
      name: PermissionGroupName;
      permissions: PermissionItem[];
    }>
  >((groups, permission) => {
    const groupName = permission.code.split(':')[0] as PermissionGroupName;
    const currentGroup = groups.find((group) => group.name === groupName);

    if (currentGroup) {
      currentGroup.permissions.push(permission);
    } else {
      groups.push({ name: groupName, permissions: [permission] });
    }

    return groups;
  }, []);
}

/** 权限选择器提供全选、按组选择和单项选择，最终仍向表单回传权限 ID 数组。 */
function PermissionSelector({
  permissions,
  value = [],
  onChange,
}: PermissionSelectorProps) {
  const { styles } = useStyles();
  const permissionGroups = groupPermissions(permissions);
  const selectedPermissionIds = new Set(value);
  const allChecked =
    permissions.length > 0 && value.length === permissions.length;
  const allIndeterminate = value.length > 0 && !allChecked;

  /** 按权限字典顺序回传选中项，确保各种选择入口产生一致的表单值。 */
  const emitSelection = (nextSelectedPermissionIds: Set<string>) => {
    onChange?.(
      permissions
        .filter((permission) => nextSelectedPermissionIds.has(permission.id))
        .map((permission) => permission.id),
    );
  };

  /** 切换全选时一次性选择或清空当前权限字典中的全部权限。 */
  const handleSelectAll = (checked: boolean) => {
    emitSelection(
      new Set(checked ? permissions.map((permission) => permission.id) : []),
    );
  };

  /** 切换分组时只更新该资源下的权限，保留其他分组的选择。 */
  const handleSelectGroup = (
    groupPermissions: PermissionItem[],
    checked: boolean,
  ) => {
    const nextSelectedPermissionIds = new Set(value);
    for (const permission of groupPermissions) {
      if (checked) {
        nextSelectedPermissionIds.add(permission.id);
      } else {
        nextSelectedPermissionIds.delete(permission.id);
      }
    }
    emitSelection(nextSelectedPermissionIds);
  };

  /** 切换单项权限时保留其余已选权限。 */
  const handleSelectPermission = (permissionId: string, checked: boolean) => {
    const nextSelectedPermissionIds = new Set(value);
    if (checked) {
      nextSelectedPermissionIds.add(permissionId);
    } else {
      nextSelectedPermissionIds.delete(permissionId);
    }
    emitSelection(nextSelectedPermissionIds);
  };

  return (
    <div className={styles.permissionSelector}>
      <div className={styles.selectAll}>
        <Checkbox
          checked={allChecked}
          indeterminate={allIndeterminate}
          onChange={(event) => handleSelectAll(event.target.checked)}
        >
          全选
        </Checkbox>
      </div>
      <div className={styles.groupList}>
        {permissionGroups.map((group) => {
          const selectedCount = group.permissions.filter((permission) =>
            selectedPermissionIds.has(permission.id),
          ).length;
          const groupChecked = selectedCount === group.permissions.length;
          const groupIndeterminate =
            selectedCount > 0 && selectedCount < group.permissions.length;

          return (
            <section className={styles.permissionGroup} key={group.name}>
              <Checkbox
                checked={groupChecked}
                className={styles.groupTitle}
                indeterminate={groupIndeterminate}
                onChange={(event) =>
                  handleSelectGroup(group.permissions, event.target.checked)
                }
              >
                {PERMISSION_GROUP_NAMES[group.name]}
              </Checkbox>
              <div className={styles.groupOptions}>
                {group.permissions.map((permission) => (
                  <Checkbox
                    checked={selectedPermissionIds.has(permission.id)}
                    key={permission.id}
                    onChange={(event) =>
                      handleSelectPermission(
                        permission.id,
                        event.target.checked,
                      )
                    }
                  >
                    {permission.name}（{permission.code}）
                  </Checkbox>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

/** 角色新增和编辑共用表单，同时维护角色与系统权限的关联。 */
export default function RoleForm({
  role,
  permissions,
  trigger,
  onSaved,
}: RoleFormProps) {
  const { message } = App.useApp();
  const editing = Boolean(role);

  /** 根据表单场景调用新增或更新接口，保存成功后通知列表刷新。 */
  const handleFinish = async (values: RoleFormValues) => {
    try {
      if (role) {
        await updateRole({ id: role.id, ...values });
      } else {
        await createRole(values);
      }
      message.success(editing ? '角色更新成功' : '角色创建成功');
      onSaved();
      return true;
    } catch {
      return false;
    }
  };

  return (
    <ModalForm<RoleFormValues>
      key={role?.id ?? 'create-role'}
      title={editing ? '编辑角色' : '新增角色'}
      trigger={
        trigger ?? (
          <Button type="primary" icon={<PlusOutlined />}>
            新增角色
          </Button>
        )
      }
      width={680}
      layout="horizontal"
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 18 }}
      initialValues={{
        name: role?.name,
        code: role?.code,
        permissionIds: role?.permissionIds ?? [],
      }}
      modalProps={{ destroyOnHidden: true }}
      onFinish={handleFinish}
    >
      <ProFormText
        name="name"
        label="角色名称"
        rules={[
          { required: true, message: '请输入角色名称' },
          { max: 30, message: '角色名称不能超过 30 个字符' },
        ]}
      />
      <ProFormText
        name="code"
        label="角色编码"
        rules={[
          { required: true, message: '请输入角色编码' },
          { max: 30, message: '角色编码不能超过 30 个字符' },
          {
            pattern: /^[a-z][a-z0-9_]*$/,
            message: '角色编码需以小写字母开头，且只能包含小写字母、数字和下划线',
          },
        ]}
      />
      <Form.Item<RoleFormValues>
        name="permissionIds"
        label="系统权限"
      >
        <PermissionSelector permissions={permissions} />
      </Form.Item>
    </ModalForm>
  );
}

/** 角色列表操作列使用的编辑按钮，并接收弹框注入的打开事件。 */
export function RoleEditTrigger(props: ButtonProps) {
  return (
    <Button {...props} type="link" size="small" icon={<EditOutlined />}>
      编辑
    </Button>
  );
}
