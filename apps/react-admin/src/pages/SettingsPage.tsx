import { SaveOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, message, Select, Switch, Tabs } from 'antd'

function SettingsPage() {
  const [messageApi, contextHolder] = message.useMessage()

  return (
    <Card className="settings-card">
      {contextHolder}
      <Tabs
        defaultActiveKey="basic"
        items={[
          {
            key: 'basic',
            label: '基本设置',
            children: (
              <Form
                className="settings-form"
                layout="vertical"
                initialValues={{
                  name: 'CQ Admin',
                  locale: 'zh-CN',
                  notification: true,
                }}
                onFinish={() => messageApi.success('设置已保存')}
              >
                <Form.Item
                  label="系统名称"
                  name="name"
                  rules={[{ required: true, message: '请输入系统名称' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item label="系统说明" name="description">
                  <Input.TextArea rows={4} placeholder="请输入系统说明" />
                </Form.Item>
                <Form.Item label="默认语言" name="locale">
                  <Select
                    options={[
                      { value: 'zh-CN', label: '简体中文' },
                      { value: 'en-US', label: 'English' },
                    ]}
                  />
                </Form.Item>
                <Form.Item
                  label="系统通知"
                  name="notification"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                  保存设置
                </Button>
              </Form>
            ),
          },
          {
            key: 'security',
            label: '安全设置',
            children: (
              <Form
                className="settings-form"
                layout="vertical"
                onFinish={() => messageApi.success('安全设置已保存')}
              >
                <Form.Item label="登录会话有效期">
                  <Select
                    defaultValue="7d"
                    options={[
                      { value: '1d', label: '1 天' },
                      { value: '7d', label: '7 天' },
                      { value: '30d', label: '30 天' },
                    ]}
                  />
                </Form.Item>
                <Form.Item label="登录失败锁定">
                  <Switch defaultChecked />
                </Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                  保存设置
                </Button>
              </Form>
            ),
          },
        ]}
      />
    </Card>
  )
}

export default SettingsPage
