import { Navigate, Route, Routes } from 'react-router-dom';
import AuthenticatedRoute from './components/AuthenticatedRoute';
import PublicAuthRoute from './components/PublicAuthRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import TicketsDashboard from './pages/TicketsDashboard';
import CreateTicket from './pages/CreateTicket';
import TicketDetail from './pages/TicketDetail';

function App() {
  return (
    <Routes>
      
      <Route
        path="/hub"
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
        path="/hub/tickets"
        element={
          <AuthenticatedRoute>
            <TicketsDashboard />
          </AuthenticatedRoute>
        }
      />
      <Route
        path="/hub/tickets/new"
        element={
          <AuthenticatedRoute>
            <CreateTicket />
          </AuthenticatedRoute>
        }
      />
      <Route
        path="/hub/tickets/:id"
        element={
          <AuthenticatedRoute>
            <TicketDetail />
          </AuthenticatedRoute>
        }
      />
      
      <Route path="*" element={<Navigate to="/hub" replace />} />
    </Routes>
  );
}

export default App;