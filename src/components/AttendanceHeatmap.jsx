import { useMemo } from 'react'

const STATUS_COLORS = {
  present: '#52B788',
  absent:  '#F87171',
  late:    '#FB923C',
  none:    '#E8E6E1',
  weekend: '#F5F4F0',
}

export default function AttendanceHeatmap({ attendance }) {
  const weeks = useMemo(() => {
    const map = {}
    attendance.forEach(a => { map[a.date] = a.status })
    const today = new Date()
    const result = []
    for (let w = 9; w >= 0; w--) {
      const week = []
      for (let d = 0; d < 7; d++) {
        const date = new Date(today)
        date.setDate(today.getDate() - (w * 7) - (6 - d))
        const key = date.toISOString().split('T')[0]
        const isWeekend = date.getDay() === 0 || date.getDay() === 6
        week.push({ date: key, status: isWeekend ? 'weekend' : (map[key] || 'none'), day: date.getDay() })
      }
      result.push(week)
    }
    return result
  }, [attendance])

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ minWidth: 320 }}>
        <div className="flex gap-1 mb-1">
          {days.map((d, i) => (
            <div key={i} style={{ width: 28, textAlign: 'center', fontSize: 11, color: 'var(--text-4)' }}>
              {d}
            </div>
          ))}
        </div>
        <div className="flex gap-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day, di) => (
                <div
                  key={di}
                  title={`${day.date}: ${day.status}`}
                  className="transition-transform hover:scale-110 cursor-default"
                  style={{
                    width: 14, height: 14,
                    borderRadius: 4,
                    background: STATUS_COLORS[day.status] || STATUS_COLORS.none,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3">
          {[
            { label: 'Present', color: '#52B788' },
            { label: 'Absent',  color: '#F87171' },
            { label: 'Late',    color: '#FB923C' },
          ].map(({ label, color }) => (
            <span key={label} className="flex items-center gap-1.5"
              style={{ fontSize: 12, color: 'var(--text-4)' }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: color, display: 'inline-block' }} />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
