import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getAllUsers, updateUserRole } from '../services/api';

const MANAGEABLE_ROLES = ['USER', 'TECHNICIAN'];

function UserManagementPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getAllUsers();
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to load users', err);
      setError(err.response?.data?.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, nextRole) => {
    try {
      setSavingUserId(userId);
      setError('');
      const response = await updateUserRole(userId, nextRole);
      setUsers((currentUsers) =>
        currentUsers.map((user) => (user.id === userId ? response.data : user))
      );
    } catch (err) {
      console.error('Failed to update role', err);
      setError(err.response?.data?.message || 'Failed to update user role.');
    } finally {
      setSavingUserId(null);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="flex justify-between items-center mb-2">
            <div
              onClick={() => navigate('/hub')}
              className="cursor-pointer text-xl font-bold text-blue-600 flex items-center gap-2 hover:text-indigo-800 transition-colors"
            >
              <span>🎓</span> Smart Campus
            </div>
          </div>

          <div className="flex justify-between items-center pb-6 border-b border-gray-200">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">User Management</h1>
              <p className="mt-2 text-sm text-gray-500">
                Review every account in the system and switch roles between user and technician.
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-medium border-b">Name</th>
                    <th className="px-6 py-4 font-medium border-b">Email</th>
                    <th className="px-6 py-4 font-medium border-b">Current Role</th>
                    <th className="px-6 py-4 font-medium border-b">Manage Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.map((user) => {
                    const isAdmin = user.role === 'ADMIN';
                    const isSaving = savingUserId === user.id;

                    return (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-800">{user.name || 'Unnamed User'}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {isAdmin ? (
                            <span className="text-sm text-slate-500">Admin role is locked</span>
                          ) : (
                            <select
                              value={user.role}
                              disabled={isSaving}
                              onChange={(event) => handleRoleChange(user.id, event.target.value)}
                              className="block min-w-[160px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                            >
                              {MANAGEABLE_ROLES.map((role) => (
                                <option key={role} value={role}>
                                  {role}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserManagementPage;
