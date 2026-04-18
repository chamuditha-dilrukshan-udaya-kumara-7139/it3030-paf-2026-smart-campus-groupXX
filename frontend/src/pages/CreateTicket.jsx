import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketService } from '../services/ticketService';

function CreateTicket() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'LOW',
    contactDetails: '',
  });
  
  const [images, setImages] = useState([]);

  const [validationErrors, setValidationErrors] = useState({});

  const validateField = (name, value) => {
    const errors = {};
    
    switch (name) {
      case 'title':
        if (value.length < 3) errors.title = 'Title must be at least 3 characters';
        if (value.length > 100) errors.title = 'Title must not exceed 100 characters';
        break;
      case 'description':
        if (value.length < 10) errors.description = 'Description must be at least 10 characters';
        if (value.length > 500) errors.description = 'Description must not exceed 500 characters';
        break;
      case 'contactDetails':
        if (!/^\+?\d{7,15}$/.test(value.replace(/\s/g, ''))) {
          errors.contactDetails = 'Invalid phone number format (7-15 digits)';
        }
        break;
      case 'category':
        if (!['IT_EQUIPMENT', 'FURNITURE', 'HVAC', 'PLUMBING', 'OTHER'].includes(value)) {
          errors.category = 'Please select a valid category';
        }
        break;
      default:
        break;
    }
    
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    const fieldErrors = validateField(name, value);
    setValidationErrors(prev => ({
      ...prev,
      [name]: fieldErrors[name]
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 3) {
      setError('Maximum 3 images allowed');
      return;
    }
    setError('');
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const allErrors = {};
    allErrors.title = validateField('title', formData.title).title;
    allErrors.description = validateField('description', formData.description).description;
    allErrors.contactDetails = validateField('contactDetails', formData.contactDetails).contactDetails;
    allErrors.category = validateField('category', formData.category).category;
    
    if (allErrors.title || allErrors.description || allErrors.contactDetails || allErrors.category) {
      setValidationErrors(allErrors);
      setError('Please fix all validation errors before submitting.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      const dataToSubmit = {
        ...formData,
        attachments: images
      };
      await ticketService.createTicket(dataToSubmit);
      alert('Ticket created successfully!');
      navigate('/hub/tickets');
    } catch (err) {
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'object' && !err.response.data.message) {
          // Spring Boot validation errors return an object map
          const errorVars = Object.values(err.response.data).join(', ');
          setError('Validation Error: ' + errorVars);
        } else {
          setError(err.response.data.message || 'Failed to create ticket. Please check your inputs.');
        }
      } else {
        setError('Failed to create ticket. Network Error.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div onClick={() => navigate('/hub')} className="cursor-pointer text-xl font-bold text-blue-600 flex items-center gap-2 hover:text-indigo-800 transition-colors">
          <span>🎓</span> Smart Campus
        </div>
        <button onClick={() => navigate('/hub/tickets')} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center px-4 py-2 bg-indigo-50 rounded-lg transition-colors">
          ← Back to Dashboard
        </button>
      </div>

      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 sm:p-10 text-white">
          <h2 className="text-3xl font-extrabold tracking-tight">Report an Issue</h2>
          <p className="mt-2 text-indigo-100 font-medium">Create a new maintenance ticket for campus resources.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-8 sm:p-10 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700">Ticket Title</label>
              <div className="mt-1">
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-3 px-4 border ${
                    validationErrors.title ? 'border-red-500 bg-red-50' : ''
                  }`}
                  placeholder="e.g. Broken projector in Room 4A"
                />
                {validationErrors.title && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">{formData.title.length}/100 characters</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Category</label>
              <div className="mt-1">
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-3 px-4 border ${
                    validationErrors.category ? 'border-red-500 bg-red-50' : ''
                  }`}
                >
                  <option value="">Select a category</option>
                  <option value="IT_EQUIPMENT">IT Equipment</option>
                  <option value="FURNITURE">Furniture</option>
                  <option value="HVAC">AC/Heating</option>
                  <option value="PLUMBING">Plumbing</option>
                  <option value="OTHER">Other</option>
                </select>
                {validationErrors.category && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.category}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Priority</label>
              <div className="mt-1">
                <select
                  name="priority"
                  required
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-3 px-4 border"
                >
                  <option value="LOW">Low - No immediate impact</option>
                  <option value="MEDIUM">Medium - Normal maintenance</option>
                  <option value="HIGH">High - Urgent, stopping work</option>
                </select>
              </div>
            </div>



            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700">Description</label>
              <div className="mt-1">
                <textarea
                  name="description"
                  required
                  rows="4"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-3 px-4 border ${
                    validationErrors.description ? 'border-red-500 bg-red-50' : ''
                  }`}
                  placeholder="Provide detailed information about the issue..."
                />
                {validationErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">{formData.description.length}/500 characters</p>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700">Contact Number</label>
              <div className="mt-1">
                <input
                  type="text"
                  name="contactDetails"
                  required
                  value={formData.contactDetails}
                  onChange={handleInputChange}
                  className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-3 px-4 border ${
                    validationErrors.contactDetails ? 'border-red-500 bg-red-50' : ''
                  }`}
                  placeholder="+94 77 XXXXXXX"
                />
                {validationErrors.contactDetails && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.contactDetails}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Format: 7-15 digits (e.g., +94771234567 or 0771234567)</p>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Image Attachments (Max 3)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      <span>Upload files</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleImageChange} disabled={images.length >= 3} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                </div>
              </div>

              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative rounded-lg overflow-hidden border border-gray-200">
                      <img src={img} alt={`Upload ${index}`} className="h-24 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 focus:outline-none"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-5 flex justify-end gap-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/hub/tickets')}
              className="bg-white py-3 px-6 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-150"
            >
              Cancel & Back
            </button>
            <button
              type="submit"
              disabled={loading || validationErrors.title || validationErrors.description || validationErrors.contactDetails || validationErrors.category || !formData.title || !formData.description || !formData.category || !formData.contactDetails}
              className="inline-flex justify-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTicket;
