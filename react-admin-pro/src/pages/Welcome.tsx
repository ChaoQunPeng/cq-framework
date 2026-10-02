import { PageContainer } from "@ant-design/pro-components";
import { useModel } from "@umijs/max";
import { Card, Typography } from "antd";
import React from "react";

const { Paragraph, Title } = Typography;

/**
 * 管理后台欢迎页。
 *
 * 该页面不绑定业务权限，作为所有已登录管理员进入系统后的统一落点。
 */
const Welcome: React.FC = () => {
  const { initialState } = useModel("@@initialState");
  const userName = initialState?.currentUser?.name;

  return (
    <PageContainer title="首页">
      <Card variant="borderless">
        <Title level={2}>欢迎回来，{userName}</Title>
        <Paragraph type="secondary">
          欢迎使用CQ后台管理。请通过左侧菜单进入已授权的业务模块。
        </Paragraph>
      </Card>
    </PageContainer>
  );
};

export default Welcome;
