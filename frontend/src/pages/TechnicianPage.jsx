import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function TechnicianPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };
  return (
    <main className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto bg-slate-800 rounded-xl shadow-xl border border-slate-700 p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-blue-400">Smart Campus</p>
            <h1 className="text-3xl font-bold mt-2">Technician Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-slate-700 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white font-medium transition-colors"
          >
            Sign Out
          </button>
        </div>
        <p className="mt-4 text-slate-400">
          Welcome to the technician workspace. Here you can manage campus resources and maintenance tasks.
        </p>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700">
            <h3 className="font-semibold text-lg">Active Tasks</h3>
            <p className="text-slate-500 text-sm mt-1">Check your current maintenance assignments.</p>
            <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm transition-colors">
              View Tasks
            </button>
          </div>
          <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700">
            <h3 className="font-semibold text-lg">Resource Inventory</h3>
            <p className="text-slate-500 text-sm mt-1">Monitor and update equipment status.</p>
            <button className="mt-4 px-4 py-2 border border-slate-600 hover:bg-slate-700 rounded-md text-sm transition-colors">
              Check Inventory
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default TechnicianPage;
