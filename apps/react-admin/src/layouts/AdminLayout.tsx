import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import AdminHeader from '../components/AdminHeader'
import AdminSidebar from '../components/AdminSidebar'

const { Content, Footer } = Layout

/** 后台主布局，统一承载顶部导航、侧边菜单和路由页面内容。 */
function AdminLayout() {
  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <AdminHeader />

      {/* 固定后台工作区高度，由内容区独立承载纵向滚动。 */}
      <Layout style={{ flex: 1, minHeight: 0 }}>
        <AdminSidebar />

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
