import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import http from '../services/http';

const AuthContext = createContext(null);

export function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCurrentUser = useCallback(async () => {
  setLoading(true);
  setError(null);

  try {
    const response = await http.get('/api/auth/me', { withCredentials: true });
    setUser(response.data ?? null);
  } catch (err) {
    if (err.response?.status === 401) {
      // ✅ Normal case: user not logged in
      setUser(null);
      setError(null); // don't treat as error
    } else {
      // ❗ real error (server issue)
      setUser(null);
      setError(err);
    }
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      isAuthenticated: Boolean(user),
      setUser,
      fetchCurrentUser,
    }),
    [user, loading, error, fetchCurrentUser]
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
