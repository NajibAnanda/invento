import { Navigate, Outlet } from 'react-router-dom'
import { getDefaultPathForRole } from '../../lib/roles'
import useAuthStore from '../../store/useAuthStore'

export default function RoleRoute({ allowedRoles = [] }) {
  const role = useAuthStore((state) => state.role)

  if (!role) {
    return <Navigate replace to="/login" />
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate replace to={getDefaultPathForRole(role)} />
  }

  return <Outlet />
}
