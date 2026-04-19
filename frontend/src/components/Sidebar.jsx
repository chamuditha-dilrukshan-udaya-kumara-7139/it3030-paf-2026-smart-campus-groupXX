import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout as logoutRequest } from '../services/api';
import NotificationDropdown from './NotificationDropdown';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logoutRequest();
    } catch (error) {
      console.error(error);
    } finally {
      logout();
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-screen">
      <div className="p-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/hub')}
          className="text-xl font-bold text-blue-500 hover:text-blue-400 transition-colors text-left"
        >
          Smart Campus
        </button>
        <NotificationDropdown />
      </div>

      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          <li>
            <Link to="/hub" className={`block px-4 py-2 rounded ${location.pathname === '/hub' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
              Facilities & Assets
            </Link>
          </li>
          <li>
            <Link to="/hub/tickets" className={`block px-4 py-2 rounded ${location.pathname.startsWith('/hub/tickets') ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
              Maintenance Tickets
            </Link>
          </li>
          <li>
            <Link to="/hub/bookings" className={`block px-4 py-2 rounded ${location.pathname === '/hub/bookings' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
              Bookings
            </Link>
          </li>
          {user?.role === 'ADMIN' && (
            <li>
              <Link to="/hub/users" className={`block px-4 py-2 rounded ${location.pathname.startsWith('/hub/users') ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
              User Management
              </Link>
            </li>
          )}
          {user?.role === 'ADMIN' || user?.role === 'TECHNICIAN' ? (
            <li>
              <Link to="/hub/admin/bookings" className={`block px-4 py-2 rounded ${location.pathname === '/hub/admin/bookings' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
                Manage Bookings
              </Link>
            </li>
          ) : null}
        </ul>
      </nav>

      <div className="p-6 border-t border-slate-800">
        <Link to="/hub/profile" className="block mb-2 hover:bg-slate-800 -mx-4 px-4 py-2 rounded transition-colors group">
          <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">{user?.name}</p>
          <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded uppercase inline-block mt-1">
            {user?.role}
          </span>
        </Link>
        <button onClick={handleLogout} className="mt-2 text-left w-full text-xs text-slate-400 hover:text-white">
          Sign out
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
