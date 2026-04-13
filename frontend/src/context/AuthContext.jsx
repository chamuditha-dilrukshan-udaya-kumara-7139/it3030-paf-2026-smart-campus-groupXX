import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import http from '../services/http';

const AUTH_USER_KEY = 'auth_user'; // localStorage key for the cached user object
const AUTH_TOKEN_KEY = 'token';   // localStorage key for the JWT

const AuthContext = createContext(null);

// ─── helpers ─────────────────────────────────────────────────────────────────
function readUserFromStorage() {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveUserToStorage(user) {
  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_USER_KEY);
  }
}
// ─────────────────────────────────────────────────────────────────────────────

export function AuthContextProvider({ children }) {
  // Initialise directly from localStorage → no flicker on refresh
  const [user, setUser] = useState(() => readUserFromStorage());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    saveUserToStorage(user);
  }, [user]);

  /**
   * Fetches the current user from the backend using the stored JWT.
   * Used on mount (background sync) and after OAuth2 redirect.
   * The user is immediately available from localStorage before this resolves.
   */
  const fetchCurrentUser = useCallback(async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await http.get('/api/auth/me');
      const freshUser = response.data ?? null;
      setUser(freshUser);
    } catch (err) {
      if (err.response?.status === 401) {
        // Token expired or invalid — clear everything
        setUser(null);
        setError(null);
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
      } else {
        // Real server error — keep cached user, surface error
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Background sync on mount to pick up any role changes made server-side
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      isAuthenticated: Boolean(user),
      setUser,
      fetchCurrentUser,
      logout,
    }),
    [user, loading, error, fetchCurrentUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthContextProvider');
  }
  return context;
}

export default AuthContext;
