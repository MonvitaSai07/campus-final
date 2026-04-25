import { useState, useRef, useEffect } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, CreditCard, BarChart2,
  GraduationCap, X, Menu, LogOut, Sun, Moon, Bell,
  Megaphone, UserPlus, BookOpen, Sparkles
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import NotificationPanel from '../../components/NotificationPanel'
import { useNotifications } from '../../contexts/NotificationContext'

const nav = [
  { to:'/admin',           label:'Dashboard',        icon:LayoutDashboard, end:true },
  { to:'/admin/students',  label:'Students',         icon:Users },
  { to:'/admin/teachers',  label:'Teachers',         icon:BookOpen },
  { to:'/admin/fees',      label:'Fees',             icon:CreditCard },
  { to:'/admin/analytics', label:'Analytics',        icon:BarChart2 },
  { to:'/admin/circulars', label:'Circulars',        icon:Megaphone },
  { to:'/admin/leads',     label:'Leads',            icon:UserPlus },
]

const timetableNav = [
  { to:'/admin/timetable-generator', label:'Generate Timetable', icon:Sparkles },
]

const titles = {
  '/admin':'Dashboard',      '/admin/students':'Students',
  '/admin/teachers':'Teachers', '/admin/fees':'Fees',
  '/admin/analytics':'Analytics', '/admin/circulars':'Circulars',
  '/admin/leads':'Admissions Leads',
  '/admin/timetable-generator':'Timetable Generator',
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const { dark, toggle } = useTheme()
  const { user, logout } = useAuth()
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()
  const location = useLocation()
  const title = titles[location.pathname] || 'Admin'
  const sidebarRef = useRef(null)
  const hamburgerRef = useRef(null)

  useEffect(() => {
    if (!open) { hamburgerRef.current?.focus(); return }
    const sidebar = sidebarRef.current
    if (!sidebar) return
    const focusable = Array.from(sidebar.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'))
    focusable[0]?.focus()
    const handleKeyDown = (e) => {
      if (e.key !== 'Tab' || !focusable.length) return
      const first = focusable[0], last = focusable[focusable.length - 1]
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus() } }
      else { if (document.activeElement === last) { e.preventDefault(); first.focus() } }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  const initials = user?.username?.slice(0, 2).toUpperCase() || 'AD'

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setOpen(false)} />
      )}

      {/* ── SIDEBAR ── */}
      <aside ref={sidebarRef}
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col
          transition-transform duration-300 ease-out
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ width: 240, background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>

        {/* Brand */}
        <div className="flex items-center justify-between px-5"
          style={{ height: 64, borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: '#2D6A4F' }}>
              <GraduationCap size={16} className="text-white" />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>
                Campus Pocket
              </p>
              <p style={{ fontSize: 11, fontWeight: 500, color: '#2D6A4F' }}>Admin Portal</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="btn-ghost lg:hidden">
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto" style={{ padding: '12px 8px' }}>
          <p className="section-title mt-2">MAIN</p>
          <div className="space-y-0.5">
            {nav.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Icon size={16} className="flex-shrink-0" />
                <span className="flex-1">{label}</span>
              </NavLink>
            ))}
          </div>
          <p className="section-title mt-4">TIMETABLE</p>
          <div className="space-y-0.5">
            {timetableNav.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} onClick={() => setOpen(false)}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Icon size={16} className="flex-shrink-0" />
                <span className="flex-1">{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Profile footer */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2.5 rounded-lg px-3 py-2.5"
            style={{ background: 'var(--surface-2)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-semibold flex-shrink-0"
              style={{ background: '#2D6A4F' }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }} className="truncate">
                {user?.username}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-4)' }}>Administrator</p>
            </div>
            <button onClick={() => { logout(); navigate('/login') }}
              className="btn-ghost" style={{ minHeight: 28, minWidth: 28, padding: 4 }}>
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Topbar */}
        <header style={{
          height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', position: 'sticky', top: 0, zIndex: 30,
          background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        }}>
          <div className="flex items-center gap-3">
            <button ref={hamburgerRef} onClick={() => setOpen(true)} className="btn-ghost lg:hidden">
              <Menu size={18} />
            </button>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={toggle} className="btn-ghost">
              {dark
                ? <Sun size={17} style={{ color: '#F59E0B' }} />
                : <Moon size={17} />}
            </button>
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
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-semibold"
                style={{ background: '#2D6A4F' }}>
                {initials}
              </div>
              <div className="hidden sm:block">
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{user?.username}</p>
              </div>
            </div>
            <button onClick={() => { logout(); navigate('/login') }}
              className="btn-ghost ml-1" title="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto" style={{ padding: '32px', background: 'var(--bg)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
