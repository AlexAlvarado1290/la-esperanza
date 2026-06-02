import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../../lib/auth';
import type { LegacyRole } from '../../lib/types';
import { backendRoleToLegacy } from '../../lib/auth';

interface Props {
  /** Si se omite, basta con estar autenticado. */
  allow?: LegacyRole[];
  /** Si es true, también permite usuarios `guest` (catálogo público). */
  allowGuest?: boolean;
}

export function ProtectedRoute({ allow, allowGuest = false }: Props) {
  const { token, user } = useAuth();
  const location = useLocation();
  const isGuest = !token && localStorage.getItem('userRole') === 'guest';

  if (!token && !(allowGuest && isGuest)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (allow && user && !allow.includes(backendRoleToLegacy(user.rol))) {
    return <Navigate to="/dashboard" replace />;
  }
  if (allow && isGuest && !allow.includes('guest')) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
