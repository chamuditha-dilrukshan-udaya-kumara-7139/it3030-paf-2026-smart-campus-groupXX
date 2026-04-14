import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import http from '../services/http';
import {
  createResource,
  deleteResource,
  updateResource,
} from '../services/api';

function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';

  const [resources, setResources] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    capacity: '',
    location: '',
    status: 'ACTIVE',
  });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [filterType, setFilterType] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterMinCapacity, setFilterMinCapacity] = useState('');

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async (type, location, minCapacity) => {
    try {
      const params = {};
      if (type && type.trim()) params.type = type.trim();
      if (location && location.trim()) params.location = location.trim();
      if (minCapacity) params.minCapacity = minCapacity;

      const response = await http.get('/api/resources', { params });
      setResources(response.data);
    } catch (error) {
      console.error('Error loading resources:', error);
    }
  };

  const handleSearch = () => {
    loadResources(filterType, filterLocation, filterMinCapacity || undefined);
  };

  const handleClearFilters = () => {
    setFilterType('');
    setFilterLocation('');
    setFilterMinCapacity('');
    loadResources();
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name: formData.name,
      type: formData.type,
      location: formData.location,
      capacity: parseInt(formData.capacity, 10) || 1,
      status: formData.status,
      availabilityWindows: ["Mon-Fri: 8AM - 5PM"],
    };

    try {
      if (editingId) {
        await updateResource(editingId, payload);
        setEditingId(null);
      } else {
        await createResource(payload);
      }
      setFormData({ name: '', type: '', capacity: '', location: '', status: 'ACTIVE' });
      setShowForm(false);
      loadResources();
    } catch (err) {
      console.error("Save Error:", err.response?.data || err.message);
      alert('Failed to save resource! Please check the console for validation details.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (resource) => {
    setFormData({
      name: resource.name,
      type: resource.type,
      capacity: resource.capacity,
      location: resource.location,
      status: resource.status || 'ACTIVE',
    });
    setEditingId(resource.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await deleteResource(id);
        loadResources();
      } catch (error) {
        console.error('Error deleting resource:', error);
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center p-8 bg-white border-b">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Facilities & Assets</h2>
            <p className="text-sm text-slate-500">Manage campus resources and infrastructure</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => {
                setFormData({ name: '', type: '', capacity: '', location: '', status: 'ACTIVE' });
                setEditingId(null);
                setShowForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-md"
            >
              + Add Resource
            </button>
          )}
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-8">
          
          <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Filter Resources</p>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500">Type</label>
                <select
                  className="px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm min-w-[140px]"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="Hall">Lecture Hall</option>
                  <option value="Lab">Laboratory</option>
                  <option value="Equipment">Equipment</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Block A"
                  className="px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-[160px]"
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500">Min Capacity</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 30"
                  className="px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm w-[120px]"
                  value={filterMinCapacity}
                  onChange={(e) => setFilterMinCapacity(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              <div className="flex gap-2 ml-auto">
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm hover:bg-slate-50 transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={handleSearch}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium border-b">Resource Name</th>
                  <th className="px-6 py-4 font-medium border-b">Type</th>
                  <th className="px-6 py-4 font-medium border-b">Capacity</th>
                  <th className="px-6 py-4 font-medium border-b">Location</th>
                  <th className="px-6 py-4 font-medium border-b">Status</th>
                  {isAdmin && (
                    <th className="px-6 py-4 font-medium border-b text-center">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {resources.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{res.name}</td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">
                        {res.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{res.capacity}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{res.location}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          res.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {res.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(res)}
                          className="text-amber-600 hover:text-amber-700 font-medium text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(res.id)}
                          className="text-red-600 hover:text-red-700 font-medium text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[500px] p-8">
            <h2 className="text-xl font-bold mb-6">{editingId ? 'Edit Resource' : 'Add New Resource'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Name"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="">Select Type</option>
                  <option value="Hall">Hall</option>
                  <option value="Lab">Lab</option>
                  <option value="Equipment">Equipment</option>
                </select>
                <input
                  required
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  placeholder="Capacity"
                  className="px-4 py-2 border rounded-lg"
                />
              </div>
              <input
                required
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Location"
                className="w-full px-4 py-2 border rounded-lg"
              />

              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="OUT_OF_SERVICE">OUT OF SERVICE</option>
                <option value="UNDER_MAINTENANCE">UNDER MAINTENANCE</option>
              </select>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg">
                  {saving ? 'Saving...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;