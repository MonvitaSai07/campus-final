import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getAttendance, getGrades, getTimetable, getExams, subscribeAttendance } from '../../services/db'
import AttendanceRiskBadge from '../../components/AttendanceRiskBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import { CalendarDays, BarChart2, BookOpen, Clock, FileText, Zap, TrendingUp } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const SUBJ_COLOR = {
  Mathematics:'#1D4ED8', Science:'#2D6A4F', English:'#7C3AED',
  History:'#C2410C', Physics:'#DC2626', Chemistry:'#0891B2',
}

function Ring({ pct, size=80, stroke=7, color='#2D6A4F' }) {
  const r = (size-stroke)/2, circ = 2*Math.PI*r, offset = circ-(pct/100)*circ
  return (
    <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={stroke} className="ring-track" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition:'stroke-dashoffset 1s ease' }} />
    </svg>
  )
}

export default function StudentDashboard() {
  const { profile } = useAuth()
  const [attendance, setAttendance] = useState([])
  const [grades, setGrades]         = useState([])
  const [timetable, setTimetable]   = useState([])
  const [exams, setExams]           = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    if (!profile?.id) return
    Promise.all([getAttendance(profile.id), getGrades(profile.id), getTimetable(profile.class), getExams(profile.id)])
      .then(([att, gr, tt, ex]) => { setAttendance(att); setGrades(gr); setTimetable(tt); setExams(ex); setLoading(false) })
    const sub = subscribeAttendance(profile.id, () => getAttendance(profile.id).then(setAttendance))
    return () => sub?.unsubscribe?.()
  }, [profile?.id])

  if (loading) return <LoadingSpinner />

  const today         = DAYS[new Date().getDay()]
  const todayClasses  = timetable.filter(t => t.day === today)
  const subjects      = [...new Set(grades.map(g => g.subject))]
  const avgGrade      = grades.length ? Math.round(grades.reduce((s,g)=>s+g.score,0)/grades.length) : 0
  const upcomingExams = exams.filter(e => !e.score && new Date(e.date) >= new Date())
  const att           = profile?.attendance_percentage || 0
  const hour          = new Date().getHours()
  const greeting      = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const trendData     = grades.slice(-8).map(g => ({ date: g.date?.slice(5), score: g.score }))

  const subjectAvgs = subjects.map(sub => {
    const sc = grades.filter(g=>g.subject===sub).map(g=>g.score)
    return { sub, avg: Math.round(sc.reduce((a,b)=>a+b,0)/sc.length) }
  })

  return (
    <div className="space-y-5 fade-in" style={{ maxWidth: 900 }}>

      {/* Hero greeting — clean white card, no gradient */}
      <div className="card" style={{ borderLeft: '3px solid #2D6A4F' }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p style={{ fontSize: 14, color: 'var(--text-3)' }}>{greeting} 👋</p>
            <h2 style={{ fontSize: 24, fontWeight: 600, color: 'var(--text)', marginTop: 4, letterSpacing: '-0.01em' }}>
              {profile?.name?.split(' ')[0]}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-4)', marginTop: 4 }}>
              {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
            </p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <AttendanceRiskBadge percentage={att} />
              <span className="badge-green badge-nodot">
                Class {profile?.class}{profile?.section}
              </span>
            </div>
          </div>
          {/* Attendance ring */}
          <div className="relative flex-shrink-0">
            <Ring pct={att} size={88} stroke={8}
              color={att >= 85 ? '#2D6A4F' : att >= 75 ? '#F59E0B' : '#DC2626'} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{att}%</span>
              <span style={{ fontSize: 9, color: 'var(--text-4)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Attend
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label:'Avg Grade',  value:`${avgGrade}%`, icon:BarChart2,  iconBg:'#D8F3DC', iconColor:'#2D6A4F' },
          { label:'Subjects',   value:subjects.length, icon:BookOpen,  iconBg:'#EFF6FF', iconColor:'#1D4ED8' },
          { label:'Exams Due',  value:upcomingExams.length, icon:Zap,  iconBg:'#FEF3C7', iconColor:'#92400E' },
        ].map(s => (
          <div key={s.label} className="card text-center pop-in">
            <div className="flex items-center justify-center mx-auto mb-2"
              style={{ width: 36, height: 36, borderRadius: 10, background: s.iconBg }}>
              <s.icon size={16} style={{ color: s.iconColor }} />
            </div>
            <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>{s.value}</p>
            <p style={{ fontSize: 13, color: 'var(--text-4)', marginTop: 2 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Grade trend */}
        <div className="card lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="flex items-center gap-2"
                style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
                <TrendingUp size={15} style={{ color: '#2D6A4F' }} /> Grade Trend
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 2 }}>Last 8 assessments</p>
            </div>
            <span className={avgGrade>=80 ? 'badge-green' : avgGrade>=60 ? 'badge-yellow' : 'badge-red'}>
              {avgGrade>=80 ? 'On track' : avgGrade>=60 ? 'Average' : 'Needs work'}
            </span>
          </div>
          <div style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2D6A4F" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize:10, fill:'var(--text-4)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0,100]} tick={{ fontSize:10, fill:'var(--text-4)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, fontSize:12 }} />
                <Area type="monotone" dataKey="score" stroke="#2D6A4F" strokeWidth={2.5} fill="url(#g1)"
                  dot={{ r:3, fill:'#2D6A4F', strokeWidth:0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today's schedule */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <p className="flex items-center gap-2"
              style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
              <Clock size={15} style={{ color: '#2D6A4F' }} /> Today
            </p>
            <span style={{ fontSize: 12, color: 'var(--text-4)' }}>{today}</span>
          </div>
          {todayClasses.length === 0
            ? <div className="flex flex-col items-center justify-center py-8 text-center">
                <span style={{ fontSize: 28, marginBottom: 8 }}>🎉</span>
                <p style={{ fontSize: 13, color: 'var(--text-4)' }}>No classes today</p>
              </div>
            : <div className="space-y-2">
                {todayClasses.map((cls, i) => (
                  <div key={cls.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                    style={{ background: i===0 ? '#D8F3DC' : 'var(--surface-2)' }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: 9999, flexShrink: 0,
                      background: SUBJ_COLOR[cls.subject] || 'var(--text-4)'
                    }} />
                    <div className="flex-1 min-w-0">
                      <p style={{
                        fontSize: 13, fontWeight: 600, color: i===0 ? '#2D6A4F' : 'var(--text)'
                      }} className="truncate">{cls.subject}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-4)' }}>{cls.time}</p>
                    </div>
                    {i===0 && <span className="badge-green badge-nodot" style={{ fontSize: 10 }}>Now</span>}
                  </div>
                ))}
              </div>
          }
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Subject performance */}
        <div className="card">
          <p className="flex items-center gap-2 mb-4"
            style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
            <BarChart2 size={15} style={{ color: '#2D6A4F' }} /> Subject Performance
          </p>
          <div className="space-y-3">
            {subjectAvgs.map(({ sub, avg }) => (
              <div key={sub}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div style={{ width: 8, height: 8, borderRadius: 9999, background: SUBJ_COLOR[sub] || 'var(--text-4)' }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-2)' }}>{sub}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: SUBJ_COLOR[sub] || 'var(--text-4)' }}>{avg}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 9999, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${avg}%`,
                    background: SUBJ_COLOR[sub] || 'var(--text-4)',
                    borderRadius: 9999, transition: 'width 0.7s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming exams */}
        <div className="card">
          <p className="flex items-center gap-2 mb-4"
            style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
            <FileText size={15} style={{ color: '#2D6A4F' }} /> Upcoming Exams
          </p>
          {upcomingExams.length === 0
            ? <div className="flex flex-col items-center justify-center py-8 text-center">
                <span style={{ fontSize: 28, marginBottom: 8 }}>✅</span>
                <p style={{ fontSize: 13, color: 'var(--text-4)' }}>No upcoming exams</p>
              </div>
            : <div className="space-y-2.5">
                {upcomingExams.map(exam => {
                  const daysLeft = Math.ceil((new Date(exam.date)-new Date())/86400000)
                  return (
                    <div key={exam.id} className="flex items-center justify-between p-3 rounded-lg"
                      style={{ background: 'var(--surface-2)' }}>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center text-white text-[12px] font-bold rounded-lg"
                          style={{ width: 36, height: 36, background: SUBJ_COLOR[exam.subject] || 'var(--text-4)' }}>
                          {exam.subject[0]}
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{exam.subject}</p>
                          <p style={{ fontSize: 11, color: 'var(--text-4)' }}>
                            {new Date(exam.date).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
                          </p>
                        </div>
                      </div>
                      <span className={daysLeft<=7 ? 'badge-red' : 'badge-yellow'}>{daysLeft}d left</span>
                    </div>
                  )
                })}
              </div>
          }
        </div>
      </div>
    </div>
  )
}
