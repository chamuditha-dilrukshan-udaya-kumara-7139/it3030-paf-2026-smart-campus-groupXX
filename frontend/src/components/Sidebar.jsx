import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout } from '../services/api';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(error);
    } finally {
      setUser(null);
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-screen">
      <div className="p-6">
        <h1 className="text-xl font-bold text-blue-500">🎓 Smart Campus</h1>
      </div>

      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {/* Dashboard - Visible only to Admin */}
          {user?.role === 'ADMIN' && (
            <li>
              <Link to="/admin" className={`block px-4 py-2 rounded ${location.pathname === '/admin' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
                ▦ Dashboard
              </Link>
            </li>
          )}

          {/* Facilities & Assets - Visible to Everyone */}
          <li>
            <Link to="/" className={`block px-4 py-2 rounded ${location.pathname === '/' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
              ⬡ Facilities & Assets
            </Link>
          </li>
        </ul>
      </nav>

      <div className="p-6 border-t border-slate-800">
        <p className="text-sm font-medium">{user?.name}</p>
        <button onClick={handleLogout} className="mt-2 w-full text-left text-xs text-slate-400 hover:text-white">
          Sign out
        </button>
      </div>
    </div>
  );
}

export default Sidebar;