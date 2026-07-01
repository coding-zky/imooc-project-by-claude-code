import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { api } from '../utils/api'
import { LayoutDashboard, Users, FileText, Tags, BarChart3, LogOut } from 'lucide-react'

function Layout() {
  const { user, logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    showToast('已退出登录', 'success')
    navigate('/admin/login')
  }

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: '仪表盘' },
    { path: '/admin/users', icon: Users, label: '用户管理' },
    { path: '/admin/records', icon: FileText, label: '消费记录' },
    { path: '/admin/categories', icon: Tags, label: '分类管理' },
    { path: '/admin/reports', icon: BarChart3, label: '数据报表' },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">轻</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-800">轻账本</h1>
              <p className="text-xs text-gray-500">后台管理系统</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout