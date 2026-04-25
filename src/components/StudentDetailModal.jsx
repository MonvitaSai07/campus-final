import { useState, useEffect } from 'react'
import {
  X, User, Hash, BookOpen, Calendar, Phone, Mail, MapPin, Droplets,
  Upload, Download, Eye, FileText, Award, Star, Pen, FileCheck
} from 'lucide-react'
import { getGrades, getFees, getAttendance } from '../services/db'
import AttendanceRiskBadge from './AttendanceRiskBadge'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { CreditCard as IdCard } from 'lucide-react'

const DOCUMENTS = [
  { id: 'birth',    label: 'Birth Certificate',        icon: FileText,  category: 'Personal' },
  { id: 'bonafide', label: 'Bonafide Certificate',      icon: FileCheck, category: 'Academic' },
  { id: 'tc',       label: 'Transfer Certificate (TC)', icon: FileText,  category: 'Academic' },
  { id: 'sports',   label: 'Sports Certificate',        icon: Award,     category: 'Extra-curricular' },
  { id: 'aadhar',   label: 'Student Aadhar Card',       icon: IdCard,    category: 'Personal' },
  { id: 'father',   label: 'Father Signature',          icon: Pen,       category: 'Personal' },
  { id: 'mother',   label: 'Mother Signature',          icon: Pen,       category: 'Personal' },
  { id: 'rc_t1',    label: 'Report Card — Term 1',      icon: BookOpen,  category: 'Academic' },
  { id: 'rc_t2',    label: 'Report Card — Term 2',      icon: BookOpen,  category: 'Academic' },
  { id: 'rc_t3',    label: 'Report Card — Term 3',      icon: BookOpen,  category: 'Academic' },
]

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-2.5" style={{ borderBottom: '1px solid var(--border-light)' }}>
      <div className="flex items-center justify-center flex-shrink-0 rounded-lg"
        style={{ width: 28, height: 28, background: 'var(--surface-2)', marginTop: 2 }}>
        <Icon size={13} style={{ color: 'var(--text-4)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: 11, color: 'var(--text-4)', fontWeight: 500 }}>{label}</p>
        <p style={{ fontSize: 13, fontWeight: 600, marginTop: 2, color: 'var(--text)' }} className="truncate">
          {value || '—'}
        </p>
      </div>
    </div>
  )
}

const TABS = ['Overview', 'Documents', 'Performance']

export default function StudentDetailModal({ student, onClose }) {
  const [activeTab, setActiveTab] = useState('Overview')
  const [docStates, setDocStates] = useState({})
  const [grades, setGrades]       = useState([])
  const [fees, setFees]           = useState([])
  const [attendance, setAttendance] = useState([])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    if (!student?.id) return
    Promise.all([getGrades(student.id), getFees(student.id), getAttendance(student.id)])
      .then(([g, f, a]) => { setGrades(g); setFees(f); setAttendance(a) })
  }, [student?.id])

  if (!student) return null

  const avgGrade   = grades.length ? Math.round(grades.reduce((s, g) => s + g.score, 0) / grades.length) : 0
  const hasOverdue = fees.some(f => f.status === 'OVERDUE')
  const hasPending = fees.some(f => f.status === 'PENDING')
  const feeStatus  = hasOverdue ? 'OVERDUE' : hasPending ? 'PENDING' : 'PAID'
  const present    = attendance.filter(a => a.status === 'present').length
  const absent     = attendance.filter(a => a.status === 'absent').length
  const late       = attendance.filter(a => a.status === 'late').length

  const subjects    = [...new Set(grades.map(g => g.subject))]
  const subjectAvgs = subjects.map(sub => {
    const scores = grades.filter(g => g.subject === sub).map(g => g.score)
    return { subject: sub.slice(0, 4), full: sub, avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) }
  })
  const timeline = grades.map(g => ({ date: g.date.slice(5), score: g.score }))

  const docCategories = [...new Set(DOCUMENTS.map(d => d.category))]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="fade-in flex flex-col"
        style={{
          background: 'var(--surface)', borderRadius: 24,
          width: '100%', maxWidth: 720,
          maxHeight: '92vh', overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}>

        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', background: '#F0FDF4' }}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center text-white text-2xl font-bold rounded-2xl flex-shrink-0"
                style={{ width: 64, height: 64, background: '#2D6A4F' }}>
                {student.name[0]}
              </div>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{student.name}</h2>
                <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>
                  Class {student.class} — Section {student.section}
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="badge-green badge-nodot">{student.admission_number}</span>
                  <span className="badge-gray badge-nodot capitalize">{student.gender}</span>
                  {student.blood_group && <span className="badge-gray badge-nodot">{student.blood_group}</span>}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="btn-ghost" style={{ minHeight: 32, minWidth: 32, padding: 6 }}>
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: 'Attendance', value: `${student.attendance_percentage}%` },
              { label: 'Avg Grade',  value: `${avgGrade}%` },
              { label: 'Fee Status', value: feeStatus,
                color: feeStatus==='OVERDUE' ? '#DC2626' : feeStatus==='PENDING' ? '#F59E0B' : '#2D6A4F' },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-3 text-center"
                style={{ background: 'var(--surface)' }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: s.color || 'var(--text)' }}>{s.value}</p>
                <p style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 2 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`tab flex-1 ${activeTab === tab ? 'active' : ''}`}
              style={{ borderRadius: 0 }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: 24 }}>

          {/* ── OVERVIEW ── */}
          {activeTab === 'Overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <p className="section-title mb-3" style={{ padding: 0 }}>PERSONAL INFORMATION</p>
                  <div className="card">
                    <InfoRow icon={Hash}     label="Student ID"    value={student.id.slice(0, 12).toUpperCase()} />
                    <InfoRow icon={BookOpen} label="Admission No." value={student.admission_number} />
                    <InfoRow icon={Calendar} label="Date of Birth" value={student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }) : null} />
                    <InfoRow icon={User}     label="Gender"        value={student.gender} />
                    <InfoRow icon={Droplets} label="Blood Group"   value={student.blood_group} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="section-title mb-3" style={{ padding: 0 }}>CONTACT & GUARDIAN</p>
                    <div className="card">
                      <InfoRow icon={User}   label="Guardian Name" value={student.guardian_name} />
                      <InfoRow icon={Phone}  label="Contact"       value={student.contact} />
                      <InfoRow icon={Mail}   label="Email"         value={student.email} />
                      <InfoRow icon={MapPin} label="Address"       value={student.address} />
                    </div>
                  </div>
                  <div>
                    <p className="section-title mb-3" style={{ padding: 0 }}>ATTENDANCE</p>
                    <div className="card">
                      <div className="flex items-center justify-between mb-3">
                        <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Risk Level</span>
                        <AttendanceRiskBadge percentage={student.attendance_percentage} />
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        {[
                          { label:'Present', value:present, bg:'#F0FDF4', color:'#2D6A4F' },
                          { label:'Absent',  value:absent,  bg:'#FEF2F2', color:'#DC2626' },
                          { label:'Late',    value:late,    bg:'#FFFBEB', color:'#F59E0B' },
                        ].map(s => (
                          <div key={s.label} className="rounded-xl p-2" style={{ background: s.bg }}>
                            <p style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</p>
                            <p style={{ fontSize: 11, color: 'var(--text-4)' }}>{s.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fees */}
              <div>
                <p className="section-title mb-3" style={{ padding: 0 }}>FEE STATUS</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {fees.map(fee => (
                    <div key={fee.id} className="card"
                      style={{ borderLeft: `3px solid ${fee.status==='OVERDUE'?'#DC2626':fee.status==='PENDING'?'#F59E0B':'#2D6A4F'}` }}>
                      <div className="flex items-center justify-between mb-1">
                        <p style={{ fontSize: 12, color: 'var(--text-4)', fontWeight: 500 }}>{fee.term}</p>
                        <span className={fee.status==='OVERDUE'?'badge-red':fee.status==='PENDING'?'badge-yellow':'badge-green'}>
                          {fee.status}
                        </span>
                      </div>
                      <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>₹{fee.amount.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── DOCUMENTS ── */}
          {activeTab === 'Documents' && (
            <div className="space-y-6">
              <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
                Upload, download, or view official documents for {student.name.split(' ')[0]}.
              </p>
              {docCategories.map(cat => (
                <div key={cat}>
                  <p className="section-title mb-3" style={{ padding: 0 }}>{cat.toUpperCase()}</p>
                  <div className="space-y-2">
                    {DOCUMENTS.filter(d => d.category === cat).map(doc => {
                      const Icon = doc.icon
                      const uploaded = !!docStates[doc.id]
                      return (
                        <div key={doc.id} className="flex items-center justify-between p-3.5 rounded-xl transition-colors"
                          style={{ background: 'var(--surface-2)' }}>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center rounded-xl flex-shrink-0"
                              style={{ width: 36, height: 36, background: uploaded ? '#D8F3DC' : 'var(--surface-3)' }}>
                              <Icon size={15} style={{ color: uploaded ? '#2D6A4F' : 'var(--text-4)' }} />
                            </div>
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{doc.label}</p>
                              <p style={{ fontSize: 11, color: 'var(--text-4)' }}>{uploaded ? 'Uploaded' : 'Not uploaded'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {uploaded && (
                              <>
                                <button className="btn-ghost" style={{ minHeight: 28, minWidth: 28, padding: 6 }} title="View">
                                  <Eye size={14} />
                                </button>
                                <button className="btn-ghost" style={{ minHeight: 28, minWidth: 28, padding: 6 }} title="Download">
                                  <Download size={14} />
                                </button>
                              </>
                            )}
                            <label className="cursor-pointer">
                              <input type="file" className="hidden" onChange={() => setDocStates(p => ({ ...p, [doc.id]: 'uploaded' }))} />
                              <span className="btn-secondary" style={{ height: 32, padding: '0 12px', fontSize: 12, cursor: 'pointer' }}>
                                <Upload size={12} /> {uploaded ? 'Replace' : 'Upload'}
                              </span>
                            </label>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── PERFORMANCE ── */}
          {activeTab === 'Performance' && (
            <div className="space-y-6">
              {timeline.length > 0 && (
                <div>
                  <p className="section-title mb-3" style={{ padding: 0 }}>GRADE TIMELINE</p>
                  <div className="card">
                    <div style={{ height: 200 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={timeline}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-4)' }} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--text-4)' }} />
                          <Tooltip contentStyle={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, fontSize:12 }} />
                          <Line type="monotone" dataKey="score" stroke="#2D6A4F" strokeWidth={2} dot={{ r: 3, fill: '#2D6A4F' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
              {subjectAvgs.length > 0 && (
                <div>
                  <p className="section-title mb-3" style={{ padding: 0 }}>SUBJECT AVERAGES</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {subjectAvgs.map((s, i) => {
                      const colors = ['#2D6A4F','#1D4ED8','#F59E0B','#7C3AED','#DC2626','#0891B2']
                      return (
                        <div key={s.full} className="card">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center justify-center text-white text-xs font-bold rounded-lg"
                              style={{ width: 28, height: 28, background: colors[i % colors.length] }}>
                              {s.subject}
                            </div>
                            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-2)' }} className="truncate">{s.full}</p>
                          </div>
                          <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>{s.avg}%</p>
                          <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 9999, overflow: 'hidden', marginTop: 8 }}>
                            <div style={{ height: '100%', width: `${s.avg}%`, background: colors[i % colors.length], borderRadius: 9999, transition: 'width 0.7s ease' }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between"
          style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--surface-2)' }}>
          <p style={{ fontSize: 12, color: 'var(--text-4)' }}>School ID: {student.school_id} · Demo School</p>
          <button onClick={onClose} className="btn-secondary" style={{ height: 36, fontSize: 13 }}>Close</button>
        </div>
      </div>
    </div>
  )
}
