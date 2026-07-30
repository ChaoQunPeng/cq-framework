import { Layout, Menu } from 'antd'
import { DashboardOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons'
import { Outlet, useNavigate } from 'react-router-dom'

const { Header, Sider, Content, Footer } = Layout

/** 后台主布局，统一承载顶部导航、侧边菜单和路由页面内容。 */
function AdminLayout() {
  const navigate = useNavigate()

  const items = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘'
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: '用户管理'
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '设置'
    }
  ]

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <Header
        style={{
          color: 'rgba(0, 0, 0, 0.88)',
          background: '#fff',
          borderBottom: '1px solid #f0f0f0'
        }}
      >
        Admin后台
      </Header>

      {/* 固定后台工作区高度，由内容区独立承载纵向滚动。 */}
      <Layout style={{ flex: 1, minHeight: 0 }}>
        <Sider width={240} theme="light" style={{ background: '#fff' }}>
          <Menu mode="inline" items={items} onClick={({ key }) => navigate(key)} />
        </Sider>

        <Content
          style={{
            minWidth: 0,
            padding: 24,
            overflowY: 'auto',
            background: '#f5f5f5'
          }}
        >
          <Outlet />
          <Footer style={{ textAlign: 'center' }}>Admin System ©2026</Footer>
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout
