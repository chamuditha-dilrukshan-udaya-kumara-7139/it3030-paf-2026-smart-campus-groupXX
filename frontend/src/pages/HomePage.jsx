import React, { useEffect, useState } from 'react';
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
  const isAdmin = user?.role === 'ADMIN';

  const [resources, setResources] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null); // For Details Modal
  
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    capacity: '',
    location: '',
    status: 'ACTIVE',
    availability: '', 
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
      availabilityWindows: formData.availability ? [formData.availability] : [],
    };

    try {
      if (editingId) {
        await updateResource(editingId, payload);
        setEditingId(null);
      } else {
        await createResource(payload);
      }
      setFormData({ name: '', type: '', capacity: '', location: '', status: 'ACTIVE', availability: '' });
      setShowForm(false);
      loadResources();
    } catch (err) {
      console.error("Save Error:", err.response?.data || err.message);
      alert('Failed to save resource!');
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
      availability: resource.availabilityWindows ? resource.availabilityWindows[0] : '',
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
        <header className="flex justify-between items-center p-8 bg-white border-b shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Facilities & Assets</h2>
            <p className="text-sm text-slate-500">Manage campus resources and infrastructure</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => {
                setFormData({ name: '', type: '', capacity: '', location: '', status: 'ACTIVE', availability: '' });
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
                  <th className="px-6 py-4 font-medium border-b">Resource Details</th>
                  <th className="px-6 py-4 font-medium border-b">Type</th>
                  <th className="px-6 py-4 font-medium border-b">Capacity</th>
                  <th className="px-6 py-4 font-medium border-b">Status</th>
                  <th className="px-6 py-4 font-medium border-b text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {resources.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedResource(res)}>
                    <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{res.name}</div>
                        <div className="text-[11px] text-slate-400 uppercase tracking-tight">{res.location}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">
                        {res.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{res.capacity}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          res.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-700'
                            : res.status === 'UNDER_MAINTENANCE'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {res.status === 'ACTIVE' ? '● Available' : 
                         res.status === 'UNDER_MAINTENANCE' ? '⚠ Maintenance' : '✖ Out of Service'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      {isAdmin ? (
                        <div className="flex justify-center gap-3">
                            <button onClick={() => handleEdit(res)} className="text-blue-600 hover:text-blue-800 text-sm font-semibold">Edit</button>
                            <button onClick={() => handleDelete(res.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold">Delete</button>
                        </div>
                      ) : (
                        <button onClick={() => setSelectedResource(res)} className="text-slate-500 hover:text-blue-600 text-sm font-semibold">View Info</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* ADMIN FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">{editingId ? 'Update Resource' : 'Create New Resource'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Resource Name</label>
                <input required name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Main Auditorium" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                    <select name="type" value={formData.type} onChange={handleInputChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                        <option value="">Select Type</option>
                        <option value="Hall">Hall</option>
                        <option value="Lab">Lab</option>
                        <option value="Equipment">Equipment</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Capacity</label>
                    <input required type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} placeholder="Capacity" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Location</label>
                <input required name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g. Building 05, Floor 02" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Availability Hours</label>
                <input name="availability" value={formData.availability} onChange={handleInputChange} placeholder="e.g. Mon-Fri: 8AM-5PM" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Operating Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="ACTIVE">ACTIVE (Available)</option>
                    <option value="OUT_OF_SERVICE">OUT OF SERVICE</option>
                    <option value="UNDER_MAINTENANCE">UNDER MAINTENANCE</option>
                </select>
              </div>

              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all font-semibold">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all font-semibold">
                  {saving ? 'Processing...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESOURCE DETAILS MODAL (View Mode) */}
      {selectedResource && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="bg-slate-800 p-6 text-white relative">
                    <button onClick={() => setSelectedResource(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl">×</button>
                    <div className="text-xs font-bold text-blue-400 uppercase mb-1">{selectedResource.type}</div>
                    <h2 className="text-2xl font-bold">{selectedResource.name}</h2>
                </div>
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase block">Location</label>
                            <p className="text-slate-700 font-medium">{selectedResource.location}</p>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase block">Capacity</label>
                            <p className="text-slate-700 font-medium">{selectedResource.capacity} Seats</p>
                        </div>
                    </div>
                    
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Operating Hours</label>
                        <div className="flex flex-wrap gap-2">
                            {selectedResource.availabilityWindows && selectedResource.availabilityWindows.length > 0 ? (
                                selectedResource.availabilityWindows.map((win, i) => (
                                    <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md border border-blue-100">{win}</span>
                                ))
                            ) : <span className="text-slate-400 text-xs italic">Flexible hours</span>}
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Status</label>
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${selectedResource.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="font-bold text-slate-700 text-sm">{selectedResource.status}</span>
                        </div>
                    </div>

                    <button onClick={() => setSelectedResource(null)} className="w-full mt-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all">Close Details</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;