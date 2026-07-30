import {
  LockOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Button, Checkbox, Form, Input, message } from 'antd'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { isAuthenticated, signIn } from '../auth'

type LoginFormValues = {
  username: string
  password: string
  remember?: boolean
}

type LoginLocationState = {
  from?: string
}

/** 后台登录页，认证成功后进入用户原本访问的后台地址。 */
function LoginPage() {
  const [form] = Form.useForm<LoginFormValues>()
  const [messageApi, contextHolder] = message.useMessage()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as LoginLocationState | null)?.from

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  /** 保存登录状态，并优先返回路由守卫记录的目标页面。 */
  const handleSubmit = async (values: LoginFormValues) => {
    signIn(Boolean(values.remember))
    await messageApi.success('登录成功')
    navigate(from?.startsWith('/') ? from : '/dashboard', { replace: true })
  }

  return (
    <main className="login-page">
      {contextHolder}
      <section className="login-brand-panel">
        <div className="login-brand">
          <span className="app-brand-mark">CQ</span>
          <span>CQ Admin</span>
        </div>
        <div className="login-intro">
          <h1>让管理更简单，让协作更高效</h1>
          <p>统一的业务管理平台，为团队提供清晰、稳定、高效的工作体验。</p>
        </div>
        <div className="login-copyright">CQ Framework</div>
      </section>

      <section className="login-form-panel">
        <div className="login-form-wrap">
          <div className="login-mobile-brand">
            <span className="app-brand-mark">CQ</span>
            <span>CQ Admin</span>
          </div>
          <h2>欢迎回来</h2>
          <p className="login-subtitle">登录你的管理后台账号</p>

          <Form
            form={form}
            layout="vertical"
            size="large"
            autoComplete="on"
            initialValues={{ remember: true }}
            requiredMark={false}
            onFinish={handleSubmit}
          >
            <Form.Item
              name="username"
              label="账号"
              rules={[{ required: true, message: '请输入账号' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="请输入账号" autoComplete="username" />
            </Form.Item>
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码"
                autoComplete="current-password"
              />
            </Form.Item>
            <Form.Item>
              <div className="login-form-options">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>记住登录状态</Checkbox>
                </Form.Item>
                <Button
                  type="link"
                  size="small"
                  onClick={() => messageApi.info('请联系系统管理员重置密码')}
                >
                  忘记密码
                </Button>
              </div>
            </Form.Item>
            <Form.Item>
              <Button
                className="login-submit"
                type="primary"
                htmlType="submit"
                block
                icon={<SafetyCertificateOutlined />}
              >
                登录
              </Button>
            </Form.Item>
          </Form>
        </div>
      </section>
    </main>
  )
}

export default LoginPage
