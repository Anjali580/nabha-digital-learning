/**
 * Role helpers shared by the router, shell and auth screens. Keeping the
 * landing pages in one place means every role always opens its own panel.
 */

export const ROLE_HOME = {
  STUDENT: '/app/dashboard',
  TEACHER: '/app/teacher/dashboard',
  ADMIN: '/app/admin/dashboard'
};

export const ROLE_LABEL = {
  STUDENT: 'Student',
  TEACHER: 'Teacher',
  ADMIN: 'Administrator'
};

export function homeForRole(user, fallback = '/app/dashboard') {
  if (!user) return '/login';
  return ROLE_HOME[user.role] || fallback;
}

export function isAdmin(user = null) {
  return user?.role === 'ADMIN';
}

export function isStaff(user = null) {
  return user?.role === 'TEACHER' || user?.role === 'ADMIN';
}

export function roleLabel(role) {
  return ROLE_LABEL[role] || 'Student';
}
