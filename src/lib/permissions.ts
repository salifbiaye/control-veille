export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT' | 'READ_ONLY' | 'USER'

export const ADMIN_PERMISSIONS = {
  // Dashboard
  'VIEW_DASHBOARD': ['READ_ONLY', 'SUPPORT', 'ADMIN', 'SUPER_ADMIN'],

  // Users
  'VIEW_USERS': ['READ_ONLY', 'SUPPORT', 'ADMIN', 'SUPER_ADMIN'],
  'EDIT_USERS': ['ADMIN', 'SUPER_ADMIN'],
  'DELETE_USERS': ['SUPER_ADMIN'],

  // Pricing
  'VIEW_PLANS': ['READ_ONLY', 'SUPPORT', 'ADMIN', 'SUPER_ADMIN'],
  'EDIT_PLANS': ['ADMIN', 'SUPER_ADMIN'],
  'DELETE_PLANS': ['SUPER_ADMIN'],

  // Promotions
  'VIEW_PROMOTIONS': ['READ_ONLY', 'SUPPORT', 'ADMIN', 'SUPER_ADMIN'],
  'EDIT_PROMOTIONS': ['ADMIN', 'SUPER_ADMIN'],
  'DELETE_PROMOTIONS': ['SUPER_ADMIN'],

  // TechWatch
  'VIEW_TECHWATCHES': ['READ_ONLY', 'SUPPORT', 'ADMIN', 'SUPER_ADMIN'],
  'EDIT_TECHWATCHES': ['ADMIN', 'SUPER_ADMIN'],
  'DELETE_TECHWATCHES': ['SUPER_ADMIN'],

  // Analytics
  'VIEW_ANALYTICS': ['SUPPORT', 'ADMIN', 'SUPER_ADMIN'],

  // Settings
  'VIEW_SETTINGS': ['ADMIN', 'SUPER_ADMIN'],
  'EDIT_SETTINGS': ['SUPER_ADMIN'],
}

export function hasPermission(userRole: AdminRole, permission: keyof typeof ADMIN_PERMISSIONS): boolean {
  const allowedRoles = ADMIN_PERMISSIONS[permission] || []
  return allowedRoles.includes(userRole) || userRole === 'SUPER_ADMIN'
}

export function requirePermission(permission: keyof typeof ADMIN_PERMISSIONS) {
  return (userRole: AdminRole) => {
    if (!hasPermission(userRole, permission)) {
      throw new Error(`Permission denied: ${permission}`)
    }
  }
}
