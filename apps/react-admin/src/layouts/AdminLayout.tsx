import {
  DashboardOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons'
import { Avatar, Breadcrumb, Button, Drawer, Dropdown, Grid, Layout, Menu, type MenuProps } from 'antd'
import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { signOut } from '../auth'

const { Header, Sider, Content } = Layout
const { useBreakpoint } = Grid

const menuItems: MenuProps['items'] = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '工作台' },
  { key: '/users', icon: <TeamOutlined />, label: '用户管理' },
  { key: '/settings', icon: <SettingOutlined />, label: '系统设置' }
]

const pageNames: Record<string, string> = {
  '/dashboard': '工作台',
  '/users': '用户管理',
  '/settings': '系统设置'
}

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="app-brand">
      <span className="app-brand-mark">CQ</span>
      {!collapsed && <span className="app-brand-name">CQ Admin</span>}
    </div>
  )
}

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const screens = useBreakpoint()
  const isDesktop = screens.md
  const location = useLocation()
  const navigate = useNavigate()
  const currentPage = pageNames[location.pathname] ?? '工作台'

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key)
    setDrawerOpen(false)
  }

  const handleLogout = () => {
    signOut()
    navigate('/login', { replace: true })
  }

  const userMenu: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ]

  const siderMenu = (
    <>
      <Brand collapsed={isDesktop && collapsed} />
      <Menu theme="light" mode="inline" selectedKeys={[location.pathname]} items={menuItems} onClick={handleMenuClick} />
    </>
  )

  return (
    <Layout className="app-shell">
      {isDesktop ? (
        <Sider width={232} collapsedWidth={80} collapsed={collapsed} trigger={null}>
          {siderMenu}
        </Sider>
      ) : (
        <Drawer
          className="mobile-drawer"
          width={232}
          placement="left"
          closable={false}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          {siderMenu}
        </Drawer>
      )}

      <Layout className="app-main-layout" style={{ marginInlineStart: isDesktop ? (collapsed ? 80 : 232) : 0 }}>
        <Header className="app-header">
          <Button
            type="text"
            aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
            icon={isDesktop ? collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
            onClick={() => (isDesktop ? setCollapsed(value => !value) : setDrawerOpen(true))}
          />
          <div className="app-header-actions">
            <Dropdown menu={{ items: userMenu }} placement="bottomRight">
              <Button type="text" className="app-user-trigger">
                <Avatar size={28} icon={<UserOutlined />} />
                <span className="app-user-name">管理员</span>
              </Button>
            </Dropdown>
          </div>
        </Header>

        <Content className="app-content">
          <div className="page-heading">
            <Breadcrumb items={[{ title: '首页' }, { title: currentPage }]} />
            <h1>{currentPage}</h1>
          </div>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout
