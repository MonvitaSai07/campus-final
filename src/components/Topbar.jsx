import { useState } from 'react'
import { Bell, Sun, Moon, Menu, LogOut } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import NotificationPanel from './NotificationPanel'
import { useNavigate } from 'react-router-dom'

export default function Topbar({ onMenuClick, title, hamburgerRef }) {
  const { dark, toggle } = useTheme()
  const { user, logout } = useAuth()
  const { unreadCount }  = useNotifications()
  const [showNotif, setShowNotif] = useState(false)
  const navigate = useNavigate()

  const initials = user?.username?.slice(0, 2).toUpperCase() || 'U'

  return (
    <header style={{
      height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', position: 'sticky', top: 0, zIndex: 30,
      background: 'var(--surface)', borderBottom: '1px solid var(--border)',
    }}>

      <div className="flex items-center gap-3">
        <button ref={hamburgerRef} onClick={onMenuClick} className="btn-ghost lg:hidden">
          <Menu size={18} />
        </button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3, letterSpacing: '-0.01em' }}>
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <button onClick={toggle} className="btn-ghost" title={dark ? 'Light mode' : 'Dark mode'}>
          {dark
            ? <Sun size={17} style={{ color: '#F59E0B' }} />
            : <Moon size={17} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button onClick={() => setShowNotif(v => !v)} className="btn-ghost relative">
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ background: '#DC2626', border: '2px solid var(--surface)' }} />
            )}
          </button>
          {showNotif && <NotificationPanel onClose={() => setShowNotif(false)} />}
        </div>

        <div className="w-px h-5 mx-1" style={{ background: 'var(--border)' }} />

        {/* User */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-semibold flex-shrink-0"
            style={{ background: '#2D6A4F' }}>
            {initials}
          </div>
          <div className="hidden sm:block">
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', lineHeight: 1.3 }}>
              {user?.username}
            </p>
          </div>
        </div>

        <button onClick={() => { logout(); navigate('/login') }}
          className="btn-ghost ml-1"
          style={{ color: 'var(--text-3)' }}
          title="Sign out">
          <LogOut size={16} />
        </button>
      </div>
    </header>
  )
}
