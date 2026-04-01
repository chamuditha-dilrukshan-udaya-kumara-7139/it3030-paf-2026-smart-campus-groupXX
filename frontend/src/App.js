import React, { useState, useEffect } from 'react';
// API functions වල නම් හරියටම api.js එකේ තියෙන විදිහටම හැදුවා
import { getAllResources, createResource, updateResource, deleteResource } from './services/api';

function App() {
  const [resources, setResources] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: '', capacity: '', location: '' });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      // getResources වෙනුවට getAllResources දැම්මා
      const response = await getAllResources();
      setResources(response.data);
    } catch (error) {
      console.error("Error loading resources:", error);
    }
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
      capacity: parseInt(formData.capacity, 10) || 1, 
      location: formData.location,
      status: "ACTIVE",  
      availabilityWindows: "Mon-Fri: 8AM - 5PM" 
    };

    try {
      if (editingId) {
        await updateResource(editingId, payload);
        setEditingId(null);
      } else {
        // addResource වෙනුවට createResource දැම්මා
        await createResource(payload);
      }
      
      setFormData({ name: '', type: '', capacity: '', location: '' });
      setShowForm(false);
      loadResources();
      
    } catch (err) { 
      console.error('Error saving resource:', err); 
      alert("Failed to save resource! Please check the Backend terminal for errors.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (resource) => {
    setFormData({
      name: resource.name,
      type: resource.type,
      capacity: resource.capacity,
      location: resource.location
    });
    setEditingId(resource.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this resource?")) {
      try {
        await deleteResource(id);
        loadResources();
      } catch (error) {
        console.error("Error deleting resource:", error);
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="text-blue-500">🎓</span> Smart Campus
          </h1>
          <p className="text-xs text-slate-400 mt-1">Management System</p>
        </div>
        <nav className="flex-1 mt-6">
          <ul className="space-y-2 px-4">
            <li className="px-4 py-3 bg-blue-600 rounded-lg cursor-pointer">
              Facilities & Assets
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center p-8 bg-white border-b">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Facilities & Assets</h2>
            <p className="text-sm text-slate-500">Manage campus resources and infrastructure</p>
          </div>
          <button 
            onClick={() => {
              setFormData({ name: '', type: '', capacity: '', location: '' });
              setEditingId(null);
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            + Add Resource
          </button>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-8">
          
          {/* Table Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">All Resources <span className="ml-2 bg-blue-100 text-blue-700 py-0.5 px-2 rounded-full text-xs">{resources.length}</span></h3>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium border-b">#</th>
                  <th className="px-6 py-4 font-medium border-b">Resource Name</th>
                  <th className="px-6 py-4 font-medium border-b">Type</th>
                  <th className="px-6 py-4 font-medium border-b">Capacity</th>
                  <th className="px-6 py-4 font-medium border-b">Location</th>
                  <th className="px-6 py-4 font-medium border-b text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {resources.length > 0 ? (
                  resources.map((res, index) => (
                    <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-500">{index + 1}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{res.name}</td>
                      <td className="px-6 py-4"><span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">{res.type}</span></td>
                      <td className="px-6 py-4 font-medium text-green-600">{res.capacity}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{res.location}</td>
                      <td className="px-6 py-4 flex justify-center gap-2">
                        <button onClick={() => handleEdit(res)} className="px-3 py-1 bg-amber-50 text-amber-600 rounded-md text-sm font-medium hover:bg-amber-100">Edit</button>
                        <button onClick={() => handleDelete(res.id)} className="px-3 py-1 bg-red-50 text-red-600 rounded-md text-sm font-medium hover:bg-red-100">Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">No resources found. Add a new one!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Popup Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[450px] p-6 relative">
            <button 
              onClick={() => setShowForm(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="text-blue-600">✦</span> {editingId ? 'Edit Resource' : 'New Resource'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Resource Name (e.g. Lecture Hall 01)" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" />
              </div>
              <div>
                <input required type="text" name="type" value={formData.type} onChange={handleInputChange} placeholder="Type (e.g. Hall, Lab)" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" />
              </div>
              <div>
                <input required type="number" name="capacity" min="1" value={formData.capacity} onChange={handleInputChange} placeholder="Capacity (e.g. 100)" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" />
              </div>
              <div>
                <input required type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="Location (e.g. Main Building)" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:bg-blue-400">
                  {saving ? 'Saving...' : (editingId ? 'Update Resource' : 'Add Resource')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;