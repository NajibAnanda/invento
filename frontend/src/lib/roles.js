export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  KASIR: 'kasir',
  GUDANG: 'gudang',
}

export const ALL_ROLES = Object.values(ROLES)
export const ADMIN_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN]
export const POS_ROLES = [...ADMIN_ROLES, ROLES.KASIR]
export const STOCK_ROLES = [...ADMIN_ROLES, ROLES.GUDANG]

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.ADMIN]: 'Admin',
  [ROLES.KASIR]: 'Kasir',
  [ROLES.GUDANG]: 'Gudang',
}

const defaultPaths = {
  [ROLES.SUPER_ADMIN]: '/dashboard',
  [ROLES.ADMIN]: '/dashboard',
  [ROLES.KASIR]: '/pos',
  [ROLES.GUDANG]: '/stock',
}

export function getDefaultPathForRole(role) {
  return defaultPaths[role] || '/login'
}
