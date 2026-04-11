import { Navigate, Route, Routes } from 'react-router-dom';
import AuthenticatedRoute from './components/AuthenticatedRoute';
import ProtectedRoute from './components/ProtectedRoute';
import PublicAuthRoute from './components/PublicAuthRoute';
import AdminPage from './pages/AdminPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import TechnicianPage from './pages/TechnicianPage';

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AuthenticatedRoute>
            <HomePage />
          </AuthenticatedRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicAuthRoute>
            <LoginPage />
          </PublicAuthRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicAuthRoute>
            <SignupPage />
          </PublicAuthRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/technician"
        element={
          <ProtectedRoute allowedRoles={['TECHNICIAN', 'ADMIN']}>
            <TechnicianPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;