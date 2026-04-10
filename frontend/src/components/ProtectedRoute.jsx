import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function hasAdminAccess(user) {
  if (!user) {
    return false;
  }

  if (user.role === 'ADMIN') {
    return true;
  }

  if (Array.isArray(user.roles)) {
    return user.roles.includes('ADMIN');
  }

  return false;
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasAdminAccess(user)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
