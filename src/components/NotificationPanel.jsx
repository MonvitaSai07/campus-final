import { Bell, X, CheckCheck, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useNotifications } from '../contexts/NotificationContext'

const SEV_CONFIG = {
  critical: {
    borderColor: '#DC2626',
    bg: '#FEF2F2',
    icon: AlertCircle,
    iconColor: '#DC2626',
  },
  warning: {
    borderColor: '#F59E0B',
    bg: '#FFFBEB',
    icon: AlertTriangle,
    iconColor: '#F59E0B',
  },
  info: {
    borderColor: '#2D6A4F',
    bg: '#F0FDF4',
    icon: Info,
    iconColor: '#2D6A4F',
  },
}

export default function NotificationPanel({ onClose }) {
  const { notifications, markRead, markAllRead } = useNotifications()
  const unread = notifications.filter(n => !n.read).length

  return (
    <div className="absolute right-0 top-12 scale-in overflow-hidden"
      style={{
        width: 380, maxWidth: 'calc(100vw - 2rem)',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        zIndex: 50,
      }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <Bell size={15} style={{ color: '#2D6A4F' }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Notifications</p>
          {unread > 0 && (
            <span className="flex items-center justify-center text-white"
              style={{
                width: 18, height: 18, borderRadius: 9999,
                background: '#2D6A4F', fontSize: 10, fontWeight: 700
              }}>
              {unread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={markAllRead}
            className="flex items-center gap-1 transition-colors"
            style={{ fontSize: 12, color: '#2D6A4F', fontWeight: 600, padding: '4px 8px', borderRadius: 6 }}>
            <CheckCheck size={11} /> Mark all read
          </button>
          <button onClick={onClose} className="btn-ghost" style={{ minHeight: 28, minWidth: 28, padding: 4 }}>
            <X size={14} />
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ maxHeight: 320, overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <div className="flex items-center justify-center"
              style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--surface-2)' }}>
              <Bell size={16} style={{ color: 'var(--text-4)' }} />
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-4)', fontWeight: 500 }}>All caught up</p>
          </div>
        ) : notifications.map(n => {
          const cfg = SEV_CONFIG[n.severity] || SEV_CONFIG.info
          const Icon = cfg.icon
          return (
            <div key={n.id} onClick={() => markRead(n.id)}
              className="cursor-pointer transition-colors"
              style={{
                borderLeft: `3px solid ${n.read ? 'transparent' : cfg.borderColor}`,
                background: n.read ? 'transparent' : cfg.bg,
                padding: '12px 16px',
                opacity: n.read ? 0.5 : 1,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
              onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : cfg.bg}>
              <div className="flex items-start gap-2.5">
                <Icon size={14} style={{ color: cfg.iconColor, flexShrink: 0, marginTop: 2 }} />
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500, lineHeight: 1.5 }}>
                    {n.message}
                  </p>
                  {!n.read && (
                    <span style={{ fontSize: 10, color: '#2D6A4F', fontWeight: 700, letterSpacing: '0.05em' }}>
                      NEW
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
