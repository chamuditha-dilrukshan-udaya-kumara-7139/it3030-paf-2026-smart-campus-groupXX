import React from 'react';

function Sidebar() {
  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col justify-between h-screen">
      {/* Top Section: Logo and Navigation */}
      <div>
        <div className="p-6">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="text-blue-500">🎓</span> Smart Campus
          </h1>
          <p className="text-xs text-slate-400 mt-1">Management System</p>
        </div>

        <div className="px-6 py-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Menu</p>
          <ul className="space-y-2">
            <li className="px-4 py-3 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors text-slate-300 flex items-center gap-3">
              <span>▦</span> Dashboard
            </li>
            
            {/* Active Item for your module */}
            <li className="px-4 py-3 bg-blue-600 text-white rounded-lg cursor-pointer flex items-center gap-3">
              <span>⬡</span> Facilities & Assets
            </li>
            
            <li className="px-4 py-3 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors text-slate-300 flex items-center gap-3">
              <span>🕒</span> Bookings
            </li>
            
            <li className="px-4 py-3 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors text-slate-300 flex items-center gap-3">
              <span>⚙️</span> Maintenance
            </li>
            
            <li className="px-4 py-3 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors text-slate-300 flex items-center gap-3">
              <span>📄</span> Reports
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Section: User Profile */}
      <div className="p-6 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm">
            AD
          </div>
          <div>
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-slate-400">admin@campus.edu</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;