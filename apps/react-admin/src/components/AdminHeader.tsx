import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { Avatar, Button, Dropdown, Layout, type MenuProps } from 'antd'
import { useNavigate } from 'react-router-dom'
import { signOut } from '../auth'

const { Header } = Layout

/** 后台顶部导航，统一提供系统标题和当前用户操作入口。 */
function AdminHeader() {
  const navigate = useNavigate()

  /** 退出当前登录状态，并返回登录页阻止继续访问后台路由。 */
  const handleLogout = () => {
    signOut()
    navigate('/login', { replace: true })
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ]

  return (
    <Header className="app-header">
      <span className="app-header-title">Admin后台</span>

      <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
        <Button type="text" className="app-user-trigger" aria-label="打开用户菜单">
          <Avatar className="app-user-avatar" size={30} icon={<UserOutlined />} />
          <span className="app-user-name">管理员</span>
        </Button>
      </Dropdown>
    </Header>
  )
}

export default AdminHeader
