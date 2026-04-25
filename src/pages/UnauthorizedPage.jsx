import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ShieldOff } from 'lucide-react'
import { ROLE_HOME } from '../services/rbac'

export default function UnauthorizedPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleBack = () => {
    if (user?.role) navigate(ROLE_HOME[user.role], { replace: true })
    else navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--bg)' }}>
      <div className="card text-center" style={{ maxWidth: 400, width: '100%' }}>
        <div className="flex items-center justify-center mx-auto mb-4"
          style={{ width: 56, height: 56, borderRadius: 16, background: '#FEE2E2' }}>
          <ShieldOff size={24} style={{ color: '#DC2626' }} />
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
          Access Denied
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 24, lineHeight: 1.6 }}>
          You don't have permission to view this page.
          {user?.role && ` Your role is "${user.role}".`}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={handleBack} className="btn-primary">
            Go to my portal
          </button>
          <button onClick={() => { logout(); navigate('/login', { replace: true }) }}
            className="btn-secondary">
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
