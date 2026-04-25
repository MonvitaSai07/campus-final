import { useAuth } from '../../contexts/AuthContext'
import { BookOpen, School, Hash, User } from 'lucide-react'

export default function StudentIDCard() {
  const { profile, user } = useAuth()

  return (
    <div className="space-y-6 fade-in">
      <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)' }}>Digital ID Card</h2>

      <div style={{ maxWidth: 360, margin: '0 auto' }}>
        {/* Card */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)',
          border: '1px solid var(--border)',
        }}>
          {/* Top bar */}
          <div style={{ background: '#2D6A4F', padding: '16px 20px' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center rounded-lg"
                  style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.2)' }}>
                  <BookOpen size={14} className="text-white" />
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Campus High School</span>
              </div>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: 9999 }}>
                2024-25
              </span>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '20px' }}>
            <div className="flex items-center gap-4 mb-5">
              <div className="flex items-center justify-center text-white text-3xl font-bold rounded-2xl flex-shrink-0"
                style={{ width: 72, height: 72, background: '#D8F3DC', color: '#2D6A4F', fontSize: 28, fontWeight: 700 }}>
                {profile?.name?.[0] || 'S'}
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{profile?.name}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>
                  Class {profile?.class} — Section {profile?.section}
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 2 }}>@{user?.username}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Student ID', value: profile?.id?.slice(0, 10).toUpperCase(), icon: Hash },
                { label: 'School',     value: 'Demo School',                            icon: School },
                { label: 'Role',       value: user?.role,                               icon: User },
                { label: 'Attendance', value: `${profile?.attendance_percentage}%`,     icon: null },
              ].map(s => (
                <div key={s.label} className="rounded-lg p-3"
                  style={{ background: 'var(--surface-2)' }}>
                  <p style={{ fontSize: 11, color: 'var(--text-4)', marginBottom: 4 }}>{s.label}</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: s.label === 'Student ID' ? 'monospace' : 'inherit' }}>
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom bar with barcode */}
          <div style={{ background: '#2D6A4F', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            {Array.from({ length: 32 }).map((_, i) => (
              <div key={i} style={{
                width: 2, borderRadius: 9999,
                height: i % 3 === 0 ? 18 : i % 2 === 0 ? 12 : 8,
                background: 'rgba(255,255,255,0.5)',
              }} />
            ))}
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-4)', marginTop: 12 }}>
          Digital ID card for Campus Pocket demo.
        </p>
      </div>
    </div>
  )
}
