import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { updateProfile, deleteAccount } from '../services/api';
import { useNavigate } from 'react-router-dom';

function ProfilePage() {
  const { user, fetchCurrentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updateProfile({ name: name.trim() });
      await fetchCurrentUser(); // Refresh the user object from the backend
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    setSaving(true);
    try {
      await deleteAccount();
      logout();
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account');
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center p-8 bg-white border-b shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">My Profile</h2>
            <p className="text-sm text-slate-500">Manage your account information</p>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-8 flex justify-center items-start">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="p-8 space-y-6">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 truncate">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100">
                  {success}
                </div>
              )}

              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 outline-none cursor-not-allowed"
                  />
                  <p className="text-[10px] text-slate-400">Email addresses cannot be changed.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">System Role</label>
                  <input
                    type="text"
                    value={user?.role || ''}
                    disabled
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 outline-none cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                  <input
                    required
                    type="text"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all font-semibold disabled:opacity-70 mt-4"
                >
                  {saving ? 'Saving...' : 'Update Profile'}
                </button>
              </form>
              
              <hr className="border-slate-100" />
              
              <div className="pt-2">
                 <h3 className="text-sm font-bold text-red-600 mb-2">Danger Zone</h3>
                 <p className="text-xs text-slate-500 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                 <button
                    onClick={handleDelete}
                    disabled={user?.role === 'ADMIN' || saving}
                    title={user?.role === 'ADMIN' ? 'Admin accounts cannot be deleted here.' : ''}
                    className="w-full py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete Account
                 </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ProfilePage;
