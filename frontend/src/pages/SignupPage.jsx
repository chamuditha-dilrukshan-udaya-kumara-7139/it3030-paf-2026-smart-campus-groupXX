import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signupWithEmail } from '../services/api';

function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleGoogleSignup = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  const handleInputChange = (event) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await signupWithEmail({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      navigate('/login', {
        replace: true,
        state: { registered: true },
      });
    } catch (error) {
      const data = error.response?.data;
      const fallback = 'Sign up failed. Please review your details and try again.';
      setErrorMessage(data?.message || Object.values(data || {})[0] || fallback);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-sm p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-400">Smart Campus</p>
        <h1 className="text-3xl font-bold mt-2">Create your account</h1>
        <p className="text-slate-400 mt-2">Register to start managing campus operations.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            required
            name="name"
            type="text"
            placeholder="Full name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
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
            placeholder="Password (min 8 chars)"
            minLength={8}
            value={formData.password}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            required
            name="confirmPassword"
            type="password"
            placeholder="Confirm password"
            minLength={8}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />

          {errorMessage && <p className="text-sm text-rose-400">{errorMessage}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed py-3 font-medium transition-colors"
          >
            {submitting ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-700" />
          <span className="text-xs text-slate-400">OR</span>
          <div className="h-px flex-1 bg-slate-700" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignup}
          className="w-full rounded-lg border border-slate-600 bg-slate-800/70 hover:bg-slate-800 py-3 font-medium transition-colors"
        >
          Continue with Google
        </button>

        <p className="text-sm text-slate-400 mt-6 text-center">
          Already registered?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
