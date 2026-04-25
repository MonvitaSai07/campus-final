import { useAuth } from '../../contexts/AuthContext'
import { mockClassrooms, mockAssignments, mockTests, mockAnnouncements, mockClassroomStudents } from '../../services/teacherMockData'
import { BookOpen, ClipboardList, FileText, Users, Bell, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function TeacherDashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const totalStudents = Object.values(mockClassroomStudents).flat().length
  const upcomingTests = mockTests.filter(t => new Date(t.test_date) >= new Date()).length
  const recentAnn     = mockAnnouncements.slice(0, 3)

  const upcomingEvents = [
    ...mockTests.filter(t => new Date(t.test_date) >= new Date()).map(t => ({ ...t, kind: 'test' })),
    ...mockAssignments.filter(a => new Date(a.due_date) >= new Date()).map(a => ({ ...a, kind: 'assignment' })),
  ].sort((a, b) => new Date(a.test_date || a.due_date) - new Date(b.test_date || b.due_date)).slice(0, 4)

  return (
    <div className="space-y-5 fade-in" style={{ maxWidth: 900 }}>

      {/* Greeting card — clean, no gradient */}
      <div className="card" style={{ borderLeft: '3px solid #2D6A4F' }}>
        <p style={{ fontSize: 14, color: 'var(--text-3)' }}>{greeting} 👋</p>
        <h2 style={{ fontSize: 24, fontWeight: 600, color: 'var(--text)', marginTop: 4, letterSpacing: '-0.01em' }}>
          {profile?.name || 'Teacher'}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-4)', marginTop: 4 }}>
          {profile?.subject} · Demo School
        </p>
        <div className="flex gap-2 mt-3 flex-wrap">
          <span className="badge-green badge-nodot">{mockClassrooms.length} Classrooms</span>
          <span className="badge-blue badge-nodot">{totalStudents} Students</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label:'Classrooms',    value:mockClassrooms.length,  icon:BookOpen,     iconBg:'#D8F3DC', iconColor:'#2D6A4F' },
          { label:'Students',      value:totalStudents,          icon:Users,        iconBg:'#EFF6FF', iconColor:'#1D4ED8' },
          { label:'Assignments',   value:mockAssignments.length, icon:ClipboardList,iconBg:'#F5F3FF', iconColor:'#7C3AED' },
          { label:'Upcoming Tests',value:upcomingTests,          icon:FileText,     iconBg:'#FEF3C7', iconColor:'#92400E' },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-3">
            <div className="flex items-center justify-center flex-shrink-0"
              style={{ width: 40, height: 40, borderRadius: 10, background: s.iconBg }}>
              <s.icon size={18} style={{ color: s.iconColor }} />
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-4)', fontWeight: 500 }}>{s.label}</p>
              <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Classrooms */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>My Classrooms</p>
            <button onClick={() => navigate('/teacher/classrooms')}
              style={{ fontSize: 13, color: '#2D6A4F', fontWeight: 500 }}>
              View all →
            </button>
          </div>
          <div className="space-y-2">
            {mockClassrooms.map(cls => (
              <div key={cls.id} onClick={() => navigate('/teacher/classrooms')}
                className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors group"
                style={{ background: 'var(--surface-2)' }}
                onMouseEnter={e => e.currentTarget.style.background = '#D8F3DC'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-2)'}>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center text-white text-[13px] font-bold rounded-lg"
                    style={{ width: 36, height: 36, background: '#2D6A4F' }}>
                    {cls.section}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{cls.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-4)' }}>
                      {mockClassroomStudents[cls.id]?.length || 0} students
                    </p>
                  </div>
                </div>
                <ChevronRight size={15} style={{ color: 'var(--border)' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Upcoming</p>
            <button onClick={() => navigate('/teacher/calendar')}
              style={{ fontSize: 13, color: '#2D6A4F', fontWeight: 500 }}>
              Calendar →
            </button>
          </div>
          <div className="space-y-2">
            {upcomingEvents.map(ev => {
              const date = new Date(ev.test_date || ev.due_date)
              const daysLeft = Math.ceil((date - new Date()) / 86400000)
              return (
                <div key={ev.id} className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: 'var(--surface-2)' }}>
                  <div className="flex items-center gap-3">
                    <div style={{
                      width: 8, height: 8, borderRadius: 9999, flexShrink: 0,
                      background: ev.kind === 'test' ? '#DC2626' : '#F59E0B'
                    }} />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{ev.title}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-4)' }}>
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <span className={daysLeft <= 3 ? 'badge-red' : daysLeft <= 7 ? 'badge-yellow' : 'badge-blue'}>
                    {daysLeft}d
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent announcements */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <p className="flex items-center gap-2"
            style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
            <Bell size={15} style={{ color: '#2D6A4F' }} /> Recent Announcements
          </p>
          <button onClick={() => navigate('/teacher/announcements')}
            style={{ fontSize: 13, color: '#2D6A4F', fontWeight: 500 }}>
            View all →
          </button>
        </div>
        <div className="space-y-2">
          {recentAnn.map(a => (
            <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg"
              style={{ background: 'var(--surface-2)' }}>
              <div style={{
                width: 8, height: 8, borderRadius: 9999, marginTop: 6, flexShrink: 0,
                background: a.priority === 'high' || a.priority === 'urgent' ? '#DC2626' : '#2D6A4F'
              }} />
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{a.title}</p>
                <p style={{ fontSize: 12, color: 'var(--text-3)' }} className="truncate">{a.message}</p>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-4)', flexShrink: 0 }}>
                {new Date(a.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
