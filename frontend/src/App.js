import React, { useEffect, useState } from 'react';
import { getAllResources, createResource, deleteResource, updateResource } from './services/api';

function App() {
  const [resources, setResources] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', type: '', capacity: '', location: '', status: 'ACTIVE'
  });

  useEffect(() => { loadResources(); }, []);

  const loadResources = async () => {
    const result = await getAllResources();
    setResources(result.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateResource(currentId, formData);
        setIsEditing(false);
        setCurrentId(null);
      } else {
        await createResource(formData);
      }
      setFormData({ name: '', type: '', capacity: '', location: '', status: 'ACTIVE' });
      loadResources();
      alert(isEditing ? "Updated!" : "Added!");
    } catch (error) {
      alert("Error saving data");
    }
  };

  const handleEdit = (res) => {
    setIsEditing(true);
    setCurrentId(res.id);
    setFormData({ name: res.name, type: res.type, capacity: res.capacity, location: res.location, status: res.status });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this?")) {
      await deleteResource(id);
      loadResources();
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial', maxWidth: '900px', margin: 'auto' }}>
      <h1>Smart Campus - Resource Management</h1>
      
      <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>{isEditing ? "Edit Resource" : "Add New Resource"}</h3>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          <input type="text" placeholder="Type" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} required />
          <input type="number" placeholder="Capacity" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} required />
          <input type="text" placeholder="Location" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} required />
          <button type="submit" style={{ background: isEditing ? '#ffc107' : '#28a745', color: 'black', border: 'none', padding: '8px 15px', cursor: 'pointer', marginLeft: '10px' }}>
            {isEditing ? "Update Resource" : "Add Resource"}
          </button>
          {isEditing && <button onClick={() => {setIsEditing(false); setFormData({name:'',type:'',capacity:'',location:'',status:'ACTIVE'})}} style={{marginLeft:'5px'}}>Cancel</button>}
        </form>
      </div>

      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: '#333', color: 'white' }}>
          <tr>
            <th>Name</th><th>Type</th><th>Capacity</th><th>Location</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {resources.map((res) => (
            <tr key={res.id}>
              <td>{res.name}</td><td>{res.type}</td><td>{res.capacity}</td><td>{res.location}</td>
              <td>
                <button onClick={() => handleEdit(res)} style={{ background: '#007bff', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', marginRight: '5px' }}>Edit</button>
                <button onClick={() => handleDelete(res.id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;