import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAvatar } from '../context/AvatarContext'

const NAV_ITEMS = [
  { path: '/', label: '首页', icon: 'home' },
  { path: '/add', label: '记录消费', icon: 'edit_square' },
  { path: '/records', label: '消费明细', icon: 'list_alt' },
  { path: '/stats', label: '统计报表', icon: 'analytics' },
]

export const Header = () => {
  const location = useLocation()
  const { user } = useAuth()
  const { avatar } = useAvatar()

  return (
    <header className="bg-surface border-b border-border sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-layout-margin h-16 max-w-[1280px] mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: 'FILL 1' }}>
              account_balance_wallet
            </span>
          </div>
          <span className="font-display-title text-display-title text-primary hidden sm:block">轻账本</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center h-full">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  h-full flex items-center px-4 font-body-main text-body-main transition-colors relative
                  ${isActive
                    ? 'text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                  }
                `}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-md">
          <Link
            to="/settings/profile"
            className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant hover:ring-2 hover:ring-primary/20 transition-all"
          >
            {avatar ? (
              <img src={avatar} alt="头像" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-surface-container-highest flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant text-sm">
                  person
                </span>
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}