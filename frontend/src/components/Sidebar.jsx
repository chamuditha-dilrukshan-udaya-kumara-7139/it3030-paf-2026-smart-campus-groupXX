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
          <li>
            <Link to="/hub" className={`block px-4 py-2 rounded ${location.pathname === '/hub' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
              ⬡ Facilities & Assets
            </Link>
          </li>
          <li>
            <Link to="/hub/tickets" className={`block px-4 py-2 rounded ${location.pathname.startsWith('/hub/tickets') ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
              ⬡ Maintenance Tickets
            </Link>
          </li>
          <li>
            <Link to="/hub/bookings" className={`block px-4 py-2 rounded ${location.pathname === '/hub/bookings' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
              ⬡ Bookings
            </Link>
          </li>
          {user?.role === 'ADMIN' && (
            <li>
              <Link to="/hub/admin/bookings" className={`block px-4 py-2 rounded ${location.pathname === '/hub/admin/bookings' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
                ⬡ Manage Bookings
              </Link>
            </li>
          )}
        </ul>
      </nav>

      <div className="p-6 border-t border-slate-800">
        <div className="mb-2">
          <p className="text-sm font-medium">{user?.name}</p>
          <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded uppercase">
            {user?.role}
          </span>
        </div>
        <button onClick={handleLogout} className="mt-2 w-full text-left text-xs text-slate-400 hover:text-white">
          Sign out
        </button>
      </div>
    </div>
  );
}

export default Sidebar;