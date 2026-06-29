import { Link, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { path: '/', label: '首页', icon: 'home' },
  { path: '/add', label: '记账', icon: 'edit_square' },
  { path: '/records', label: '明细', icon: 'list_alt' },
  { path: '/stats', label: '统计', icon: 'analytics' },
]

export const MobileNav = () => {
  const location = useLocation()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex justify-around items-center h-16 z-50">
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`
              flex flex-col items-center gap-1 transition-colors
              ${isActive ? 'text-primary' : 'text-text-secondary'}
            `}
          >
            <span
              className="material-symbols-outlined"
              style={isActive ? { fontVariationSettings: 'FILL 1' } : {}}
            >
              {item.icon}
            </span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}