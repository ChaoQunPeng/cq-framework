import { PageContainer } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Card, Descriptions } from 'antd';

/** 展示当前登录管理员的基本资料，供头像菜单的个人设置入口使用。 */
export default function AccountSettings() {
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;

  return (
    <PageContainer title="个人设置">
      <Card title="账号信息" variant="borderless">
        <Descriptions
          column={1}
          items={[
            { key: 'name', label: '用户名', children: currentUser?.name },
            { key: 'phone', label: '手机号', children: currentUser?.phone },
          ]}
        />
      </Card>
    </PageContainer>
  );
}
