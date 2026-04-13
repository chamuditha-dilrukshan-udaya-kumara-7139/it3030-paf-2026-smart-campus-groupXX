import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginWithEmail } from '../services/api';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser, fetchCurrentUser } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const registrationSuccess = Boolean(location.state?.registered);

  const destination = location.state?.from?.pathname || '/';

  // Handle OAuth2 redirect token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (error) {
      setErrorMessage(error === 'email_not_provided' ? 'Google login failed: Email not provided.' : 'Google login failed.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (token) {
      localStorage.setItem('token', token);
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchCurrentUser();
    }
  }, [fetchCurrentUser]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (location.state?.from) {
        navigate(destination, { replace: true });
      } else {
        if (user.role === 'ADMIN') {
          navigate('/admin', { replace: true });
        } else if (user.role === 'TECHNICIAN') {
          navigate('/technician', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }
    }
  }, [user, navigate, location.state, destination]);

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  const handleInputChange = (event) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      const response = await loginWithEmail(formData);
      // Backend returns { id, name, email, role, token }
      const { token, ...userProfile } = response.data;

      // 1. Persist the JWT so axios attaches it to every future request
      if (token) {
        localStorage.setItem('token', token);
      }

      // 2. Set the user immediately — AuthContext will persist it to localStorage
      //    via the saveUserToStorage effect. No second network call needed.
      setUser(userProfile);
      // Redirect is handled by the useEffect watching `user`
    } catch (error) {
      const fallback = 'Login failed. Please check your credentials and try again.';
      setErrorMessage(error.response?.data?.message || fallback);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-sm p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-400">Smart Campus</p>
        <h1 className="text-3xl font-bold mt-2">Welcome back</h1>
        <p className="text-slate-400 mt-2">Sign in to access your campus workspace.</p>
        {registrationSuccess && (
          <p className="mt-4 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-3 py-2 text-sm text-emerald-300">
            Account created successfully. Please sign in.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            required
            name="email"
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            required
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />

          {errorMessage && <p className="text-sm text-rose-400">{errorMessage}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed py-3 font-medium transition-colors"
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-700" />
          <span className="text-xs text-slate-400">OR</span>
          <div className="h-px flex-1 bg-slate-700" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full rounded-lg border border-slate-600 bg-slate-800/70 hover:bg-slate-800 py-3 font-medium transition-colors"
        >
          Continue with Google
        </button>

        <p className="text-sm text-slate-400 mt-6 text-center">
          No account yet?{' '}
          <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
