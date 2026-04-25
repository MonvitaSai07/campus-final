import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

const PALETTE = {
  green:   { iconBg: '#D8F3DC', iconColor: '#2D6A4F' },
  brand:   { iconBg: '#D8F3DC', iconColor: '#2D6A4F' },
  yellow:  { iconBg: '#FEF3C7', iconColor: '#92400E' },
  red:     { iconBg: '#FEE2E2', iconColor: '#DC2626' },
  blue:    { iconBg: '#EFF6FF', iconColor: '#1D4ED8' },
  purple:  { iconBg: '#F5F3FF', iconColor: '#7C3AED' },
  orange:  { iconBg: '#FFF7ED', iconColor: '#C2410C' },
}

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'green', trend, onClick }) {
  const p = PALETTE[color] || PALETTE.green

  return (
    <div onClick={onClick}
      className={`card fade-in ${onClick ? 'card-hover' : ''}`}
      style={{ borderLeft: '3px solid #2D6A4F' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-3)', marginBottom: 8 }}>
            {title}
          </p>
          <p style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', lineHeight: 1, marginBottom: 6 }}>
            {value}
          </p>
          {subtitle && (
            <p style={{ fontSize: 13, color: 'var(--text-4)' }}>{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-1.5"
              style={{ color: trend > 0 ? '#2D6A4F' : '#DC2626' }}>
              {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              <span style={{ fontSize: 12, fontWeight: 600 }}>{Math.abs(trend)}% vs last month</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="flex items-center justify-center flex-shrink-0"
            style={{ width: 44, height: 44, borderRadius: 10, background: p.iconBg }}>
            <Icon size={20} style={{ color: p.iconColor }} />
          </div>
        )}
      </div>
    </div>
  )
}
