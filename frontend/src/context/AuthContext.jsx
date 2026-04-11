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

  const token = localStorage.getItem('token');
  if (!token) {
    setUser(null);
    setLoading(false);
    return;
  }

  try {
    const response = await http.get('/api/auth/me');
    setUser(response.data ?? null);
  } catch (err) {
    if (err.response?.status === 401) {
      // ✅ Normal case: user not logged in or token expired
      setUser(null);
      setError(null); 
      localStorage.removeItem('token'); // Clear invalid token
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

  const logout = useCallback(() => {
    localStorage.removeItem('token');
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
