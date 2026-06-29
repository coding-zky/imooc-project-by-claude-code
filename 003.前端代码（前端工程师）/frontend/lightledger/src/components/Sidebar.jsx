import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const SIDEBAR_ITEMS = [
  { path: '/settings/profile', label: '个人资料', icon: 'person' },
  { path: '/settings/security', label: '账户安全', icon: 'shield' },
  { path: '/settings/preferences', label: '偏好设置', icon: 'settings' },
]

export const Sidebar = () => {
  const location = useLocation()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <aside className="h-full w-64 bg-surface border-r border-border hidden md:flex flex-col py-lg px-md shrink-0">
      <div className="mb-lg px-sm">
        <h2 className="font-headline-card text-headline-card text-on-surface">设置</h2>
        <p className="font-body-secondary text-body-secondary text-text-secondary">管理您的账户设置</p>
      </div>

      <nav className="flex flex-col gap-xs">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-md px-md py-sm rounded-lg transition-all active-scale
                ${isActive
                  ? 'bg-primary-container/10 text-primary font-semibold'
                  : 'text-text-secondary hover:bg-surface-container'
                }
              `}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-body-secondary text-body-secondary">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto pt-lg border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-md px-md py-sm rounded-lg text-error hover:bg-error-container/10 w-full transition-all active-scale"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-body-secondary text-body-secondary">退出登录</span>
        </button>
      </div>
    </aside>
  )
}