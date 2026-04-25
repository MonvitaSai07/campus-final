/**
 * rbac.js — Role-Based Access Control helpers
 *
 * All role validation that touches real data goes through Supabase here.
 * The frontend NEVER trusts a locally-stored role for security decisions —
 * it always re-fetches from the DB via auth.uid() so RLS enforces the truth.
 */

export const ROLES = /** @type {const} */ (['student', 'teacher', 'parent', 'admin'])

export const ROLE_HOME = {
  student: '/student',
  teacher: '/teacher',
  parent:  '/parent',
  admin:   '/admin',
}

// ─────────────────────────────────────────────
// 1. GET CURRENT USER ROLE  (server-validated)
// ─────────────────────────────────────────────
/**
 * Fetches the role from the `users` table using the authenticated user's
 * auth.uid(). RLS on the table ensures a user can only read their own row.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @returns {Promise<string|null>} role string or null if unauthenticated
 */
export async function getCurrentUserRole(supabase) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) return null

  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('auth_id', user.id)
    .single()

  if (error) {
    console.error('[RBAC] role fetch error:', error.message)
    return null
  }

  // Validate the value is a known role — never trust raw DB strings blindly
  if (!ROLES.includes(data.role)) {
    console.error('[RBAC] unknown role returned from DB:', data.role)
    return null
  }

  return data.role
}

// ─────────────────────────────────────────────
// 2. ROLE-BASED ROUTING
// ─────────────────────────────────────────────
/**
 * Fetches the user's role and navigates to their home portal.
 * Redirects to /login if unauthenticated.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {Function} navigate  — react-router navigate()
 */
export async function handleRouting(supabase, navigate) {
  const role = await getCurrentUserRole(supabase)

  if (!role) {
    navigate('/login', { replace: true })
    return
  }

  navigate(ROLE_HOME[role] ?? '/login', { replace: true })
}

// ─────────────────────────────────────────────
// 3. FRONTEND ROUTE GUARD  (synchronous)
// ─────────────────────────────────────────────
/**
 * Call at the top of any page/component that requires a specific role.
 * Redirects immediately if the role is not allowed.
 *
 * NOTE: This is a UX guard only. Real security lives in Supabase RLS.
 *
 * @param {string[]}  allowedRoles
 * @param {string|null} userRole   — role from AuthContext
 * @param {Function}  navigate
 */
export function protectRoute(allowedRoles, userRole, navigate) {
  if (!userRole) {
    navigate('/login', { replace: true })
    return false
  }
  if (!allowedRoles.includes(userRole)) {
    navigate('/unauthorized', { replace: true })
    return false
  }
  return true
}

// ─────────────────────────────────────────────
// 4. ASYNC MIDDLEWARE  (server-validated guard)
// ─────────────────────────────────────────────
/**
 * Use before any sensitive Supabase query to ensure the caller has the
 * required role. Throws on failure so callers can catch and redirect.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string[]} allowedRoles
 * @returns {Promise<string>} the validated role
 * @throws {Error} "Unauthorized access" if role check fails
 */
export async function requireRole(supabase, allowedRoles) {
  const role = await getCurrentUserRole(supabase)

  if (!role || !allowedRoles.includes(role)) {
    throw new Error('Unauthorized access')
  }

  return role
}

// ─────────────────────────────────────────────
// 5. CONVENIENCE CHECKERS
// ─────────────────────────────────────────────
export const isAdmin   = (role) => role === 'admin'
export const isTeacher = (role) => role === 'teacher'
export const isParent  = (role) => role === 'parent'
export const isStudent = (role) => role === 'student'
