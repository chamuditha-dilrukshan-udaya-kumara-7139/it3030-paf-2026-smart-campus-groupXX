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

function ProtectedRoute({ children, allowedRoles = ['ADMIN'] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role;
  const isAuthorized = allowedRoles.includes(userRole);

  if (!isAuthorized) {
    // Redirect to home if they don't have the required role
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
