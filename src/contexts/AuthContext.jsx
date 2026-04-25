import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

// ─────────────────────────────────────────────────────────────────────────
// MOCK USER ACCOUNTS  — email + password → role → portal
// 2 accounts per portal, all backed by mock data only (no Supabase auth)
// ─────────────────────────────────────────────────────────────────────────
const MOCK_USERS = [
  // ── STUDENT (2) ──────────────────────────────────────────────────────
  { id: 'user-student-1', email: 'alex@campus.edu',   password: 'student123', role: 'student', school_id: 'school-demo-001' },
  { id: 'user-student-2', email: 'priya@campus.edu',  password: 'student123', role: 'student', school_id: 'school-demo-001' },

  // ── PARENT (2) ───────────────────────────────────────────────────────
  { id: 'user-parent-1',  email: 'robert@campus.edu', password: 'parent123',  role: 'parent',  school_id: 'school-demo-001' },
  { id: 'user-parent-2',  email: 'meena@campus.edu',  password: 'parent123',  role: 'parent',  school_id: 'school-demo-001' },

  // ── TEACHER (2) ──────────────────────────────────────────────────────
  { id: 'user-teacher-1', email: 'sarah@campus.edu',  password: 'teacher123', role: 'teacher', school_id: 'school-demo-001' },
  { id: 'user-teacher-2', email: 'james@campus.edu',  password: 'teacher123', role: 'teacher', school_id: 'school-demo-001' },

  // ── ADMIN (2) ────────────────────────────────────────────────────────
  { id: 'user-admin-1',   email: 'admin@campus.edu',  password: 'admin123',   role: 'admin',   school_id: 'school-demo-001' },
  { id: 'user-admin-2',   email: 'super@campus.edu',  password: 'admin123',   role: 'admin',   school_id: 'school-demo-001' },
]

// ── Mock profiles keyed by user id ───────────────────────────────────────
const MOCK_PROFILES = {
  'user-student-1': {
    id: 'student-1', user_id: 'user-student-1', name: 'Alex Johnson',
    class: '10', section: 'A', attendance_percentage: 82,
    school_id: 'school-demo-001', admission_number: 'ADM-2021-001',
    date_of_birth: '2008-04-15', gender: 'Male', joining_date: '2021-06-01',
    guardian_name: 'Robert Johnson', contact: '+1 (555) 012-3456',
    email: 'alex@campus.edu', blood_group: 'O+',
    address: '42 Maple Street, Springfield',
  },
  'user-student-2': {
    id: 'student-2', user_id: 'user-student-2', name: 'Priya Sharma',
    class: '10', section: 'B', attendance_percentage: 68,
    school_id: 'school-demo-001', admission_number: 'ADM-2021-002',
    date_of_birth: '2008-09-22', gender: 'Female', joining_date: '2021-06-01',
    guardian_name: 'Meena Sharma', contact: '+1 (555) 098-7654',
    email: 'priya@campus.edu', blood_group: 'B+',
    address: '18 Oak Avenue, Springfield',
  },
  'user-parent-1': {
    id: 'parent-1', user_id: 'user-parent-1',
    name: 'Robert Johnson', school_id: 'school-demo-001',
  },
  'user-parent-2': {
    id: 'parent-2', user_id: 'user-parent-2',
    name: 'Meena Sharma', school_id: 'school-demo-001',
  },
  'user-teacher-1': {
    id: 'user-teacher-1', name: 'Sarah Williams',
    subject: 'Mathematics', school_id: 'school-demo-001',
  },
  'user-teacher-2': {
    id: 'user-teacher-2', name: 'James Carter',
    subject: 'Science', school_id: 'school-demo-001',
  },
  'user-admin-1': {
    id: 'user-admin-1', name: 'Admin', school_id: 'school-demo-001',
  },
  'user-admin-2': {
    id: 'user-admin-2', name: 'Super Admin', school_id: 'school-demo-001',
  },
}

// ─────────────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session from localStorage on boot
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cp-session')
      if (saved) {
        const { user: u, profile: p } = JSON.parse(saved)
        const knownRoles = ['student', 'teacher', 'parent', 'admin']
        if (u && knownRoles.includes(u.role)) {
          setUser(u)
          setProfile(p)
        }
      }
    } catch { /* corrupt storage — ignore */ }
    setLoading(false)
  }, [])

  // ── login: email + password → role → portal ───────────────────────────
  const login = async (email, password) => {
    const normalised = email.trim().toLowerCase()
    const found = MOCK_USERS.find(
      u => u.email === normalised && u.password === password
    )
    if (!found) throw new Error('Invalid email or password')

    const p = MOCK_PROFILES[found.id] ?? null
    const userData = {
      id:        found.id,
      username:  found.email,
      role:      found.role,
      school_id: found.school_id,
    }

    setUser(userData)
    setProfile(p)
    localStorage.setItem('cp-session', JSON.stringify({ user: userData, profile: p }))
    return { user: userData, profile: p }
  }

  // ── logout ────────────────────────────────────────────────────────────
  const logout = () => {
    setUser(null)
    setProfile(null)
    localStorage.removeItem('cp-session')
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
