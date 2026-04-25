import { useState } from 'react'
import { demoStudents, demoFees } from '../../services/mockData'
import { CreditCard, AlertTriangle, CheckCircle, Clock, Search } from 'lucide-react'

export default function AdminFees() {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const enriched = demoStudents.map(s => {
    const fees = demoFees.filter(f => f.student_id === s.id)
    const hasOverdue = fees.some(f => f.status === 'OVERDUE')
    const hasPending = fees.some(f => f.status === 'PENDING')
    const status = hasOverdue ? 'OVERDUE' : hasPending ? 'PENDING' : 'PAID'
    const totalDue  = fees.filter(f => f.status !== 'PAID').reduce((s,f) => s+f.amount, 0)
    const totalPaid = fees.filter(f => f.status === 'PAID').reduce((s,f) => s+f.amount, 0)
    return { ...s, fees, status, totalDue, totalPaid }
  }).filter(s =>
    (filter === 'All' || s.status === filter) &&
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  const totalRevenue = demoFees.filter(f=>f.status==='PAID').reduce((s,f)=>s+f.amount,0)
  const totalOverdue = demoFees.filter(f=>f.status==='OVERDUE').reduce((s,f)=>s+f.amount,0)
  const totalPending = demoFees.filter(f=>f.status==='PENDING').reduce((s,f)=>s+f.amount,0)

  return (
    <div className="space-y-5 fade-in" style={{ maxWidth: 900 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)' }}>Fee Management</h2>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label:'Collected', value:`₹${(totalRevenue/1000).toFixed(0)}K`, icon:CheckCircle, iconBg:'#D8F3DC', iconColor:'#2D6A4F' },
          { label:'Pending',   value:`₹${(totalPending/1000).toFixed(0)}K`, icon:Clock,       iconBg:'#FEF3C7', iconColor:'#92400E' },
          { label:'Overdue',   value:`₹${(totalOverdue/1000).toFixed(0)}K`, icon:AlertTriangle,iconBg:'#FEE2E2', iconColor:'#DC2626' },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-3">
            <div className="flex items-center justify-center flex-shrink-0"
              style={{ width: 40, height: 40, borderRadius: 10, background: s.iconBg }}>
              <s.icon size={18} style={{ color: s.iconColor }} />
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-4)', fontWeight: 500 }}>{s.label}</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1" style={{ minWidth: 200 }}>
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-4)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input" style={{ paddingLeft: 40 }} placeholder="Search student..." />
        </div>
        <div className="flex gap-2">
          {['All','PAID','PENDING','OVERDUE'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
              style={{
                background: filter===f ? '#2D6A4F' : 'var(--surface-2)',
                color: filter===f ? '#fff' : 'var(--text-3)',
                border: `1px solid ${filter===f ? '#2D6A4F' : 'var(--border)'}`,
              }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse' }}>
            <thead>
              <tr className="table-header">
                {['Student','Class','Status','Paid','Due','Terms'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enriched.map(s => (
                <tr key={s.id} className="table-row">
                  <td style={{ padding: '0 16px' }}>
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center justify-center text-white text-[11px] font-semibold rounded-full flex-shrink-0"
                        style={{ width: 28, height: 28, background: '#2D6A4F' }}>
                        {s.name[0]}
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{s.name}</p>
                    </div>
                  </td>
                  <td style={{ padding: '0 16px' }}>
                    <span className="badge-green badge-nodot">{s.class}{s.section}</span>
                  </td>
                  <td style={{ padding: '0 16px' }}>
                    <span className={s.status==='PAID'?'badge-green':s.status==='PENDING'?'badge-yellow':'badge-red'}>
                      {s.status}
                    </span>
                  </td>
                  <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 600, color: '#2D6A4F' }}>
                    ₹{s.totalPaid.toLocaleString()}
                  </td>
                  <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 600, color: s.totalDue > 0 ? '#DC2626' : 'var(--text-4)' }}>
                    ₹{s.totalDue.toLocaleString()}
                  </td>
                  <td style={{ padding: '0 16px' }}>
                    <div className="flex gap-1">
                      {s.fees.map(f => (
                        <div key={f.id} title={`${f.term}: ${f.status}`}
                          style={{
                            width: 8, height: 8, borderRadius: 9999,
                            background: f.status==='PAID' ? '#2D6A4F' : f.status==='PENDING' ? '#F59E0B' : '#DC2626'
                          }} />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
