import { demoStudents, demoFees, demoAttendance, demoGrades } from '../../services/mockData'
import { Users, CreditCard, AlertTriangle, Clock, CheckCircle, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
} from 'recharts'

const CHART_COLORS = ['#2D6A4F', '#52B788', '#E76F51', '#F4A261', '#3B82F6', '#8B5CF6']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '8px 12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    }}>
      {label && <p style={{ fontSize: 11, color: 'var(--text-4)', marginBottom: 4 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: 13, fontWeight: 700, color: p.color }}>{p.value}</p>
      ))}
    </div>
  )
}

export default function AdminDashboard() {
  const totalStudents = demoStudents.length
  const lowAttendance = demoStudents.filter(s => s.attendance_percentage < 75).length
  const allFees       = demoFees
  const totalRevenue  = allFees.filter(f => f.status === 'PAID').reduce((s,f) => s+f.amount, 0)
  const overdueCount  = allFees.filter(f => f.status === 'OVERDUE').length
  const pendingCount  = allFees.filter(f => f.status === 'PENDING').length

  const classDist = ['9','10','11'].map(cls => ({
    class: `Class ${cls}`,
    count: demoStudents.filter(s => s.class === cls).length,
  }))

  const gradeData = demoStudents.map(s => {
    const sg = demoGrades.filter(g => g.student_id === s.id)
    return { name: s.name.split(' ')[0], avg: sg.length ? Math.round(sg.reduce((a,g)=>a+g.score,0)/sg.length) : 0 }
  })

  const feePie = [
    { name:'Paid',    value: allFees.filter(f=>f.status==='PAID').length,    color:'#2D6A4F' },
    { name:'Pending', value: allFees.filter(f=>f.status==='PENDING').length, color:'#F59E0B' },
    { name:'Overdue', value: allFees.filter(f=>f.status==='OVERDUE').length, color:'#DC2626' },
  ]

  const alerts = demoStudents
    .filter(s => s.attendance_percentage < 75)
    .map(s => ({ type:'attendance', msg:`${s.name}`, sub:`Attendance ${s.attendance_percentage}%`, color:'red' }))
  const overdueStudents = [...new Set(demoFees.filter(f=>f.status==='OVERDUE').map(f=>f.student_id))]
    .map(id => demoStudents.find(s=>s.id===id)).filter(Boolean)
    .map(s => ({ type:'fee', msg:`${s.name}`, sub:'Fee overdue', color:'amber' }))
  const allAlerts = [...alerts, ...overdueStudents].slice(0, 5)

  const metrics = [
    { label:'Total Students',    value:totalStudents,                    sub:'+3 this month',       trend:'up',   icon:Users,          iconBg:'#D8F3DC', iconColor:'#2D6A4F' },
    { label:'Revenue Collected', value:`₹${(totalRevenue/1000).toFixed(0)}K`, sub:'This academic year', trend:'up',   icon:CreditCard,     iconBg:'#D8F3DC', iconColor:'#2D6A4F' },
    { label:'Low Attendance',    value:lowAttendance,                    sub:'Below 75% threshold', trend:'down', icon:AlertTriangle,  iconBg:'#FEE2E2', iconColor:'#DC2626' },
    { label:'Overdue Fees',      value:overdueCount,                     sub:`${pendingCount} pending`, trend:'down', icon:Clock,      iconBg:'#FEF3C7', iconColor:'#92400E' },
  ]

  return (
    <div className="space-y-5 fade-in" style={{ maxWidth: 1200 }}>

      {/* ── METRIC CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div key={m.label} className="card fade-in" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-3)', marginBottom: 8 }}>
                  {m.label}
                </p>
                <p style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', lineHeight: 1, marginBottom: 6 }}>
                  {m.value}
                </p>
                <div className="flex items-center gap-1.5"
                  style={{ color: m.trend === 'up' ? '#2D6A4F' : '#DC2626' }}>
                  {m.trend === 'up'
                    ? <ArrowUpRight size={12} />
                    : <ArrowDownRight size={12} />}
                  <p style={{ fontSize: 12, color: 'var(--text-4)' }}>{m.sub}</p>
                </div>
              </div>
              <div className="flex items-center justify-center flex-shrink-0"
                style={{ width: 44, height: 44, borderRadius: 10, background: m.iconBg }}>
                <m.icon size={20} style={{ color: m.iconColor }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── CHARTS ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Grade bar chart */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Student Performance</p>
              <p style={{ fontSize: 13, color: 'var(--text-4)', marginTop: 2 }}>Average grades across all students</p>
            </div>
            <span className="badge-green badge-nodot">Avg Grades</span>
          </div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize:11, fill:'var(--text-4)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0,100]} tick={{ fontSize:11, fill:'var(--text-4)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill:'rgba(45,106,79,0.06)', radius:6 }} />
                <Bar dataKey="avg" radius={[6,6,0,0]} fill="#2D6A4F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fee pie */}
        <div className="card">
          <div className="mb-4">
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Fee Status</p>
            <p style={{ fontSize: 13, color: 'var(--text-4)', marginTop: 2 }}>Collection overview</p>
          </div>
          <div style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={feePie} cx="50%" cy="50%" innerRadius={42} outerRadius={65}
                  paddingAngle={4} dataKey="value" strokeWidth={0}>
                  {feePie.map((e,i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-3">
            {feePie.map(f => (
              <div key={f.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div style={{ width: 8, height: 8, borderRadius: 9999, background: f.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{f.name}</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{f.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Alerts */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center"
                style={{ width: 28, height: 28, borderRadius: 8, background: '#FEE2E2' }}>
                <Activity size={14} style={{ color: '#DC2626' }} />
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Alerts</p>
            </div>
            {allAlerts.length > 0 && (
              <span className="badge-red badge-nodot">{allAlerts.length} active</span>
            )}
          </div>
          <div className="space-y-2">
            {allAlerts.length === 0 ? (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg"
                style={{ background: '#F0FDF4', border: '1px solid #D8F3DC' }}>
                <CheckCircle size={15} style={{ color: '#2D6A4F', flexShrink: 0 }} />
                <p style={{ fontSize: 13, fontWeight: 500, color: '#2D6A4F' }}>All students are on track</p>
              </div>
            ) : allAlerts.map((a, i) => (
              <div key={i} className="flex items-center gap-3 px-3.5 py-3 rounded-lg"
                style={{
                  background: a.color==='red' ? '#FEF2F2' : '#FFFBEB',
                  border: `1px solid ${a.color==='red' ? '#FECACA' : '#FDE68A'}`,
                }}>
                <div style={{
                  width: 6, height: 6, borderRadius: 9999, flexShrink: 0,
                  background: a.color==='red' ? '#DC2626' : '#F59E0B'
                }} />
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 13, fontWeight: 600, color: a.color==='red' ? '#DC2626' : '#92400E' }}>
                    {a.msg}
                  </p>
                  <p style={{ fontSize: 12, color: a.color==='red' ? '#FCA5A5' : '#FCD34D' }}>{a.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Class distribution */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center justify-center"
              style={{ width: 28, height: 28, borderRadius: 8, background: '#D8F3DC' }}>
              <Users size={14} style={{ color: '#2D6A4F' }} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Class Distribution</p>
          </div>
          <div className="space-y-4">
            {classDist.map((c, i) => {
              const pct = Math.round((c.count / totalStudents) * 100)
              const colors = ['#2D6A4F', '#52B788', '#E76F51']
              return (
                <div key={c.class}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div style={{ width: 8, height: 8, borderRadius: 9999, background: colors[i] }} />
                      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-2)' }}>{c.class}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 13, fontWeight: 700, color: colors[i] }}>{c.count}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-4)' }}>students</span>
                    </div>
                  </div>
                  <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 9999, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: colors[i], borderRadius: 9999, transition: 'width 0.7s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
