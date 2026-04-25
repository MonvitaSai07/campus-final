import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getChildrenOfParent, getFees, getGrades, getExams, findStudentByCredentials, linkChildToParent } from '../../services/db'
import AttendanceRiskBadge from '../../components/AttendanceRiskBadge'
import StudentDetailModal from '../../components/StudentDetailModal'
import LoadingSpinner from '../../components/LoadingSpinner'
import { CreditCard, BarChart2, Plus, X, CheckCircle, ChevronRight, AlertTriangle, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

function Ring({ pct, size=56, stroke=5, color='#2D6A4F' }) {
  const r=(size-stroke)/2, circ=2*Math.PI*r, offset=circ-(pct/100)*circ
  return (
    <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={stroke} className="ring-track" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition:'stroke-dashoffset 1s ease' }} />
    </svg>
  )
}

export default function ParentDashboard() {
  const { profile } = useAuth()
  const [children, setChildren]       = useState([])
  const [childData, setChildData]     = useState({})
  const [loading, setLoading]         = useState(true)
  const [showAdd, setShowAdd]         = useState(false)
  const [addUsername, setAddUsername] = useState('')
  const [addPassword, setAddPassword] = useState('')
  const [showAddPass, setShowAddPass] = useState(false)
  const [addError, setAddError]       = useState('')
  const [addSuccess, setAddSuccess]   = useState('')
  const [selected, setSelected]       = useState(null)

  const load = async () => {
    if (!profile?.id) return
    const kids = await getChildrenOfParent(profile.id)
    setChildren(kids)
    const data = {}
    await Promise.all(kids.map(async kid => {
      const [fees, grades, exams] = await Promise.all([getFees(kid.id), getGrades(kid.id), getExams(kid.id)])
      data[kid.id] = { fees, grades, exams }
    }))
    setChildData(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [profile?.id])

  const handleAdd = async (e) => {
    e.preventDefault(); setAddError('')
    try {
      const student = await findStudentByCredentials(addUsername, addPassword)
      if (!student) { setAddError('No student found with that username'); return }
      if (children.find(c => c.id === student.id)) { setAddError('This child is already linked to your account'); return }
      await linkChildToParent(profile.id, student.id)
      setAddSuccess(`${student.name} has been added!`)
      setAddUsername(''); setAddPassword('')
      await load()
      setTimeout(() => { setAddSuccess(''); setShowAdd(false) }, 2500)
    } catch (err) {
      setAddError(err.message === 'Invalid password'
        ? 'Incorrect password. Please check and try again.'
        : err.message || 'Something went wrong.')
    }
  }

  const closeAddModal = () => {
    setShowAdd(false); setAddUsername(''); setAddPassword('')
    setAddError(''); setAddSuccess('')
  }

  if (loading) return <LoadingSpinner />

  const alerts = [
    ...children.filter(c => c.attendance_percentage < 75).map(c => ({
      type:'att', msg:`${c.name}'s attendance is ${c.attendance_percentage}% — below 75%`
    })),
    ...children.filter(c => (childData[c.id]?.fees||[]).some(f=>f.status==='OVERDUE')).map(c => ({
      type:'fee', msg:`${c.name} has overdue fees — please clear them`
    })),
  ]

  return (
    <div className="space-y-5 fade-in" style={{ maxWidth: 900 }}>

      {/* ── HEADER CARD ── */}
      <div className="card" style={{ borderLeft: '3px solid #2D6A4F' }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p style={{ fontSize: 14, color: 'var(--text-3)' }}>Parent Portal 👋</p>
            <h2 style={{ fontSize: 24, fontWeight: 600, color: 'var(--text)', marginTop: 4, letterSpacing: '-0.01em' }}>
              {profile?.name?.split(' ')[0]}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-4)', marginTop: 4 }}>
              {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
            </p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="badge-green badge-nodot">
                {children.length} {children.length===1?'child':'children'} linked
              </span>
              {alerts.length > 0 && (
                <span className="badge-red badge-nodot flex items-center gap-1">
                  <AlertTriangle size={10} /> {alerts.length} alert{alerts.length>1?'s':''}
                </span>
              )}
            </div>
          </div>
          <button onClick={() => setShowAdd(true)} className="btn-primary flex-shrink-0">
            <Plus size={15} /> Add Child
          </button>
        </div>
      </div>

      {/* ── ALERTS ── */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-lg"
              style={{
                background: a.type==='att' ? '#FEF2F2' : '#FFFBEB',
                border: `1px solid ${a.type==='att' ? '#FECACA' : '#FDE68A'}`,
              }}>
              <AlertTriangle size={14} style={{ color: a.type==='att' ? '#DC2626' : '#F59E0B', flexShrink: 0 }} />
              <p style={{ fontSize: 13, fontWeight: 500, color: a.type==='att' ? '#DC2626' : '#92400E' }}>
                {a.msg}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── ADD CHILD MODAL ── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
          <div className="slide-up flex flex-col"
            style={{
              background: 'var(--surface)', borderRadius: 24, maxWidth: 420, width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}>
            <div className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center rounded-xl"
                  style={{ width: 32, height: 32, background: '#D8F3DC' }}>
                  <ShieldCheck size={15} style={{ color: '#2D6A4F' }} />
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Add Child</p>
                  <p style={{ fontSize: 12, color: 'var(--text-4)' }}>Verify with student credentials</p>
                </div>
              </div>
              <button onClick={closeAddModal} className="btn-ghost" style={{ minHeight: 28, minWidth: 28, padding: 4 }}>
                <X size={15} />
              </button>
            </div>

            <div className="p-6">
              {addSuccess ? (
                <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
                  <div className="flex items-center justify-center rounded-2xl"
                    style={{ width: 56, height: 56, background: '#D8F3DC' }}>
                    <CheckCircle size={28} style={{ color: '#2D6A4F' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Child Added!</p>
                    <p style={{ fontSize: 13, color: 'var(--text-4)', marginTop: 4 }}>{addSuccess}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAdd} className="space-y-4">
                  <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-lg"
                    style={{ background: '#F0FDF4', border: '1px solid #D8F3DC' }}>
                    <ShieldCheck size={13} style={{ color: '#2D6A4F', flexShrink: 0, marginTop: 2 }} />
                    <p style={{ fontSize: 12, color: '#2D6A4F', lineHeight: 1.6 }}>
                      Enter your child's login credentials to verify their identity before linking.
                    </p>
                  </div>

                  {addError && (
                    <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-lg"
                      style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                      <div style={{ width: 6, height: 6, borderRadius: 9999, background: '#DC2626', flexShrink: 0, marginTop: 6 }} />
                      <p style={{ fontSize: 12, color: '#DC2626', fontWeight: 500 }}>{addError}</p>
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>
                      Student Username
                    </label>
                    <input value={addUsername} onChange={e => setAddUsername(e.target.value)}
                      className="input" style={{ height: 44 }} placeholder="e.g. priya.sharma" autoComplete="off" required />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>
                      Student Password
                    </label>
                    <div className="relative">
                      <input type={showAddPass ? 'text' : 'password'} value={addPassword}
                        onChange={e => setAddPassword(e.target.value)}
                        className="input" style={{ height: 44, paddingRight: 44 }}
                        placeholder="Enter student's password" autoComplete="new-password" required />
                      <button type="button" onClick={() => setShowAddPass(v => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                        style={{ color: 'var(--text-4)' }}>
                        {showAddPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <p style={{ fontSize: 12, color: 'var(--text-4)' }}>
                    Demo: <span style={{ fontWeight: 600, color: 'var(--text-3)' }}>priya.sharma</span>
                    {' · '}
                    <span style={{ fontWeight: 600, color: 'var(--text-3)' }}>student123</span>
                  </p>

                  <button type="submit" className="btn-primary w-full" style={{ height: 44 }}>
                    Verify &amp; Add Child
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {selected && <StudentDetailModal student={selected} onClose={() => setSelected(null)} />}

      {/* ── CHILDREN CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children.map(child => {
          const { fees=[], grades=[], exams=[] } = childData[child.id] || {}
          const avgGrade   = grades.length ? Math.round(grades.reduce((s,g)=>s+g.score,0)/grades.length) : 0
          const hasOverdue = fees.some(f=>f.status==='OVERDUE')
          const hasPending = fees.some(f=>f.status==='PENDING')
          const feeStatus  = hasOverdue?'OVERDUE':hasPending?'PENDING':'PAID'
          const att        = child.attendance_percentage
          const trendData  = grades.slice(-6).map(g=>({ date:g.date?.slice(5), score:g.score }))

          return (
            <div key={child.id} className="card-hover group" onClick={() => setSelected(child)}>

              {/* Card header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center text-white text-[16px] font-bold flex-shrink-0 rounded-xl"
                    style={{ width: 44, height: 44, background: '#2D6A4F' }}>
                    {child.name[0]}
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{child.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-4)' }}>Class {child.class} · Sec {child.section}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AttendanceRiskBadge percentage={att} />
                  <ChevronRight size={14} style={{ color: 'var(--border)' }} />
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="flex flex-col items-center justify-center py-3 rounded-lg"
                  style={{ background: 'var(--surface-2)' }}>
                  <div className="relative">
                    <Ring pct={att} size={44} stroke={4}
                      color={att>=85?'#2D6A4F':att>=75?'#F59E0B':'#DC2626'} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text)' }}>{att}%</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 6 }}>Attend.</p>
                </div>

                <div className="flex flex-col items-center justify-center py-3 rounded-lg"
                  style={{ background: 'var(--surface-2)' }}>
                  <BarChart2 size={14} style={{ color: '#2D6A4F', marginBottom: 4 }} />
                  <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{avgGrade}%</p>
                  <p style={{ fontSize: 10, color: 'var(--text-4)' }}>Grade</p>
                </div>

                <div className="flex flex-col items-center justify-center py-3 rounded-lg"
                  style={{ background: hasOverdue ? '#FEF2F2' : hasPending ? '#FFFBEB' : '#F0FDF4' }}>
                  <CreditCard size={14} style={{
                    color: hasOverdue ? '#DC2626' : hasPending ? '#F59E0B' : '#2D6A4F',
                    marginBottom: 4
                  }} />
                  <p style={{
                    fontSize: 9, fontWeight: 700,
                    color: hasOverdue ? '#DC2626' : hasPending ? '#F59E0B' : '#2D6A4F'
                  }}>
                    {feeStatus}
                  </p>
                  <p style={{ fontSize: 10, color: 'var(--text-4)' }}>Fees</p>
                </div>
              </div>

              {/* Mini grade trend */}
              {trendData.length > 0 && (
                <div style={{ height: 48, marginBottom: 16 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <Line type="monotone" dataKey="score" stroke="#2D6A4F" strokeWidth={2} dot={false} />
                      <Tooltip
                        contentStyle={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, fontSize:11 }}
                        cursor={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
