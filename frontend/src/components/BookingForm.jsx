import { useState, useEffect } from 'react';
import * as bookingService from '../services/bookingService';

export default function BookingForm({ onBookingCreated, resources = [] }) {
  const [formData, setFormData] = useState({
    resourceId: '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: 1
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(value, 10) || 0
    }));
  };

  const validateForm = () => {
    if (!formData.resourceId.trim()) {
      setError('Please select a resource');
      return false;
    }
    if (!formData.date) {
      setError('Please select a date');
      return false;
    }
    if (!formData.startTime) {
      setError('Please enter start time');
      return false;
    }
    if (!formData.endTime) {
      setError('Please enter end time');
      return false;
    }
    if (formData.startTime >= formData.endTime) {
      setError('Start time must be before end time');
      return false;
    }
    if (!formData.purpose.trim()) {
      setError('Please enter the purpose of booking');
      return false;
    }
    if (formData.expectedAttendees < 1) {
      setError('Expected attendees must be at least 1');
      return false;
    }

    // Validate date is not in the past
    const bookingDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (bookingDate < today) {
      setError('Cannot book for past dates');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await bookingService.createBooking(formData);
      setSuccess('Booking request submitted successfully! Waiting for admin approval.');
      setFormData({
        resourceId: '',
        date: '',
        startTime: '',
        endTime: '',
        purpose: '',
        expectedAttendees: 1
      });
      onBookingCreated?.();
    } catch (err) {
      // Check if the error is a conflict
      if (err.message && err.message.includes('conflict') || err.message.includes('Conflict')) {
        setError('⚠️ ' + err.message);
      } else if (typeof err === 'object' && err.message) {
        setError('Error: ' + err.message);
      } else {
        setError('Failed to create booking: ' + (err || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Booking Request</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Resource Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Resource *
          </label>
          <select
            name="resourceId"
            value={formData.resourceId}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">-- Choose a resource --</option>
            {resources.map(resource => (
              <option key={resource.id} value={resource.id}>
                {resource.name} ({resource.type}) - Capacity: {resource.capacity}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Time Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time *
            </label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time *
            </label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Purpose */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Purpose of Booking *
          </label>
          <textarea
            name="purpose"
            value={formData.purpose}
            onChange={handleInputChange}
            placeholder="Describe why you need this resource..."
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            required
          />
        </div>

        {/* Expected Attendees */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expected Attendees *
          </label>
          <input
            type="number"
            name="expectedAttendees"
            value={formData.expectedAttendees}
            onChange={handleNumberChange}
            min="1"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Booking Request'}
        </button>
      </form>
    </div>
  );
}
