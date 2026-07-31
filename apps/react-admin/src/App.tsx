import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { isAuthenticated } from './auth'
import AdminLayout from './layouts/AdminLayout'
import DashboardPage from './pages/dashboard'
import LoginPage from './pages/login'
import SettingsPage from './pages/settings'
import UsersPage from './pages/users'
import './App.scss'

/** 后台路由守卫，未登录时记录目标地址并跳转到登录页。 */
function ProtectedRoute() {
  const location = useLocation()

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <Outlet />
}

/** 应用路由入口，区分公开登录页和需要认证的后台页面。 */
function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
