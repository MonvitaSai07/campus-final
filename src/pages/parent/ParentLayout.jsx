import { useState, useRef, useEffect } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, CalendarDays, BarChart2, CreditCard,
  Clock, FileText, MessageSquare, X, GraduationCap,
  Megaphone, ClipboardList, Bus, HelpCircle, Bot, Menu
} from 'lucide-react'
import Topbar from '../../components/Topbar'

const nav = [
  { to:'/parent',            label:'Dashboard',    icon:LayoutDashboard, end:true },
  { to:'/parent/attendance', label:'Attendance',   icon:CalendarDays },
  { to:'/parent/grades',     label:'Grades',       icon:BarChart2 },
  { to:'/parent/fees',       label:'Fees',         icon:CreditCard },
  { to:'/parent/timetable',  label:'Timetable',    icon:Clock },
  { to:'/parent/exams',      label:'Exams',        icon:FileText },
  { to:'/parent/messages',   label:'Messages',     icon:MessageSquare },
  { to:'/parent/circulars',  label:'Circulars',    icon:Megaphone },
  { to:'/parent/requests',   label:'Requests',     icon:ClipboardList },
  { to:'/parent/transport',  label:'Transport',    icon:Bus },
  { to:'/parent/helpdesk',   label:'Helpdesk',     icon:HelpCircle },
  { to:'/parent/bot',        label:'AI Assistant', icon:Bot },
]

const titles = {
  '/parent':'Dashboard', '/parent/attendance':'Attendance',
  '/parent/grades':'Grades', '/parent/fees':'Fees',
  '/parent/timetable':'Timetable', '/parent/exams':'Exams',
  '/parent/messages':'Messages', '/parent/circulars':'Circulars',
  '/parent/requests':'Requests', '/parent/transport':'Transport',
  '/parent/helpdesk':'Helpdesk', '/parent/bot':'AI Assistant',
}

export default function ParentLayout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const title = titles[location.pathname] || 'Parent Portal'
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

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setOpen(false)} />
      )}

      <aside ref={sidebarRef}
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col
          transition-transform duration-300 ease-out
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ width: 240, background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>

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
              <p style={{ fontSize: 11, fontWeight: 500, color: '#2D6A4F' }}>Parent Portal</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="btn-ghost lg:hidden"><X size={16} /></button>
        </div>

        <nav className="flex-1 overflow-y-auto" style={{ padding: '12px 8px' }}>
          <p className="section-title mt-2">NAVIGATION</p>
          <div className="space-y-0.5">
            {nav.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Icon size={16} className="flex-shrink-0" />
                <span className="flex-1">{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
          <div className="rounded-lg px-3 py-2.5" style={{ background: 'var(--surface-2)' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#2D6A4F' }}>Demo School</p>
            <p style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 2 }}>Parent Portal</p>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar onMenuClick={() => setOpen(true)} title={title} hamburgerRef={hamburgerRef} />
        <main className="flex-1 overflow-y-auto" style={{ padding: '32px', background: 'var(--bg)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
