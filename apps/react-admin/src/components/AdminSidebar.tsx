import { DashboardOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons'
import { Layout, Menu, type MenuProps } from 'antd'
import { useNavigate } from 'react-router-dom'

const { Sider } = Layout

/** 后台主导航菜单，菜单 key 与对应页面路由保持一致。 */
const menuItems: MenuProps['items'] = [
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

/** 后台侧边栏，统一承载主导航菜单及页面跳转行为。 */
function AdminSidebar() {
  const navigate = useNavigate()

  return (
    <Sider width={240} theme="light" style={{ background: '#fff' }}>
      <Menu mode="inline" items={menuItems} onClick={({ key }) => navigate(key)} />
    </Sider>
  )
}

export default AdminSidebar
