/**
 * ProtectedRoute — wraps any route that requires authentication + a specific role.
 *
 * Security model (defence in depth):
 *   Layer 1 — AuthContext: checks localStorage session (fast, UX only)
 *   Layer 2 — role match:  redirects wrong-role users to their own portal
 *   Layer 3 — Supabase RLS: even if layers 1-2 are bypassed, the DB will
 *             reject queries that don't match auth.uid() / role policies
 *
 * Usage:
 *   <ProtectedRoute role="admin">
 *     <AdminLayout />
 *   </ProtectedRoute>
 */
import { useEffect, useRef } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import { getCurrentUserRole, ROLE_HOME } from '../services/rbac'
import LoadingSpinner from './LoadingSpinner'

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const verified = useRef(false)   // prevent double-fire in StrictMode

  // ── Layer 3: background server-side role verification ──────────────────
  // After the component mounts we silently re-check the role against
  // Supabase. If it doesn't match (e.g. someone edited localStorage),
  // we kick them out. This runs async so it doesn't block the initial render.
  useEffect(() => {
    if (loading || !user || verified.current) return
    verified.current = true

    // Only run when Supabase auth is explicitly enabled
    if (import.meta.env.VITE_USE_SUPABASE_AUTH !== 'true') return

    getCurrentUserRole(supabase).then((serverRole) => {
      if (!serverRole) {
        // Session expired or user deleted — force logout
        navigate('/login', { replace: true })
        return
      }
      if (serverRole !== role) {
        // Role mismatch — send to their actual portal
        navigate(ROLE_HOME[serverRole] ?? '/login', { replace: true })
      }
    })
  }, [loading, user, role, navigate])

  // ── Layer 1: loading state ──────────────────────────────────────────────
  if (loading) return <LoadingSpinner fullScreen />

  // ── Layer 1: not authenticated ──────────────────────────────────────────
  if (!user) return <Navigate to="/login" replace />

  // ── Layer 2: wrong role — redirect to their own portal ─────────────────
  if (user.role !== role) return <Navigate to={ROLE_HOME[user.role] ?? '/login'} replace />

  return children
}
