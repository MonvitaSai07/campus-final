-- ============================================================
-- RBAC Row Level Security — Campus Pocket
-- Run this in the Supabase SQL editor (or via supabase db push)
-- ============================================================

-- 1. Enable RLS on the users table
alter table users enable row level security;

-- Drop existing policies if re-running
drop policy if exists "student access own data"       on users;
drop policy if exists "parent access own data"        on users;
drop policy if exists "teacher access own data"       on users;
drop policy if exists "admin full access"             on users;
drop policy if exists "users can read own row"        on users;

-- ── 2. Universal: every authenticated user can read their own row ─────────
-- This covers all roles for self-reads (profile page, role hydration, etc.)
create policy "users can read own row"
  on users
  for select
  using (auth.uid() = auth_id);

-- ── 3. Student: can only read their own row ───────────────────────────────
create policy "student access own data"
  on users
  for select
  using (
    auth.uid() = auth_id
    and role = 'student'
  );

-- ── 4. Parent: can read their own row ────────────────────────────────────
-- (linked-student access is handled via a separate `parent_students` table)
create policy "parent access own data"
  on users
  for select
  using (
    auth.uid() = auth_id
    and role = 'parent'
  );

-- ── 5. Teacher: can read their own row ───────────────────────────────────
create policy "teacher access own data"
  on users
  for select
  using (
    auth.uid() = auth_id
    and role = 'teacher'
  );

-- ── 6. Admin: full access to all rows ────────────────────────────────────
-- Uses a helper function so we don't expose the admin check to the client
create policy "admin full access"
  on users
  for all
  using (
    exists (
      select 1 from users u
      where u.auth_id = auth.uid()
        and u.role = 'admin'
    )
  );

-- ============================================================
-- IMPORTANT: Never grant anon role SELECT on the users table.
-- Only the authenticated role should be able to query it.
-- ============================================================
revoke select on users from anon;
grant  select on users to authenticated;
