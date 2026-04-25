import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, BookOpen, ArrowRight, Check, GraduationCap, Users, ShieldCheck } from 'lucide-react'

const FEATURES = ['Real-time Updates', 'AI Insights', 'Parent Alerts']

// 8 demo accounts — 2 per portal
const DEMO_ACCOUNTS = [
  {
    portal: 'Student', color: '#2D6A4F', bg: '#D8F3DC', icon: GraduationCap,
    accounts: [
      { email: 'alex@campus.edu',  password: 'student123', name: 'Alex Johnson' },
      { email: 'priya@campus.edu', password: 'student123', name: 'Priya Sharma' },
    ],
  },
  {
    portal: 'Parent', color: '#1D4ED8', bg: '#EFF6FF', icon: Users,
    accounts: [
      { email: 'robert@campus.edu', password: 'parent123', name: 'Robert Johnson' },
      { email: 'meena@campus.edu',  password: 'parent123', name: 'Meena Sharma' },
    ],
  },
  {
    portal: 'Teacher', color: '#7C3AED', bg: '#F5F3FF', icon: BookOpen,
    accounts: [
      { email: 'sarah@campus.edu', password: 'teacher123', name: 'Sarah Williams' },
      { email: 'james@campus.edu', password: 'teacher123', name: 'James Carter' },
    ],
  },
  {
    portal: 'Admin', color: '#C2410C', bg: '#FFF7ED', icon: ShieldCheck,
    accounts: [
      { email: 'admin@campus.edu', password: 'admin123', name: 'Admin' },
      { email: 'super@campus.edu', password: 'admin123', name: 'Super Admin' },
    ],
  },
]

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { user } = await login(email, password)
      navigate(`/${user.role}`, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fill = (e, p) => { setEmail(e); setPassword(p); setError('') }

  // Find which portal the current email maps to (for live hint)
  const matched = DEMO_ACCOUNTS.find(g =>
    g.accounts.some(a => a.email === email.trim().toLowerCase())
  )

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-[42%] flex-col justify-between p-12"
        style={{ background: '#FFFFFF', borderRight: '1px solid var(--border)' }}>

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#2D6A4F' }}>
            <BookOpen size={18} className="text-white" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>
            Campus Pocket
          </span>
        </div>

        {/* Hero */}
        <div className="space-y-8">
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
              Your school,<br />simplified.
            </h1>
            <p style={{ fontSize: 15, color: 'var(--text-3)', marginTop: 12, lineHeight: 1.6 }}>
              Sign in with your email — your role determines which portal opens automatically.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {FEATURES.map(f => (
              <span key={f} className="inline-flex items-center gap-1.5"
                style={{ padding: '6px 14px', borderRadius: 9999, border: '1px solid #D8F3DC', background: '#F0FDF4', fontSize: 13, fontWeight: 500, color: '#2D6A4F' }}>
                <Check size={12} />{f}
              </span>
            ))}
          </div>

        </div>

        <p style={{ fontSize: 12, color: 'var(--text-4)', fontWeight: 500 }}>Campus High School</p>
      </div>

      {/* ── RIGHT FORM ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[420px] fade-in">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#2D6A4F' }}>
              <BookOpen size={16} className="text-white" />
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Campus Pocket</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 style={{ fontSize: 24, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>
              Welcome back
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-3)', marginTop: 4 }}>
              Enter your email — we'll open the right portal for you.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-lg"
              style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: '#DC2626' }} />
              <p style={{ fontSize: 13, color: '#DC2626', fontWeight: 500 }}>{error}</p>
            </div>
          )}

          {/* Live portal hint */}
          {matched && (
            <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-lg"
              style={{ background: matched.bg, border: `1px solid ${matched.color}30` }}>
              <matched.icon size={15} style={{ color: matched.color, flexShrink: 0 }} />
              <p style={{ fontSize: 13, color: matched.color, fontWeight: 500 }}>
                This email opens the <strong>{matched.portal} Portal</strong>
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-lg"
                placeholder="you@campus.edu"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-lg"
                  style={{ paddingRight: 48 }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-4)' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary-lg w-full">
              {loading
                ? <span className="flex items-center gap-2.5">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                : <span className="flex items-center gap-2">
                    Sign In <ArrowRight size={16} />
                  </span>}
            </button>
          </form>


        </div>
      </div>
    </div>
  )
}
