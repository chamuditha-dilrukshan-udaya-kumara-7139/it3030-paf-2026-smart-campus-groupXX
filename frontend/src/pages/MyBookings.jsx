import { useState, useEffect } from 'react';
import BookingCard from '../components/BookingCard';
import BookingForm from '../components/BookingForm';
import * as bookingService from '../services/bookingService';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await bookingService.getAllBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingCreated = () => {
    setShowForm(false);
    loadBookings();
  };

  const handleBookingUpdate = () => {
    loadBookings();
  };

  const getStatusCounts = () => {
    const counts = {
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
      CANCELLED: 0
    };

    bookings.forEach(booking => {
      counts[booking.status] = (counts[booking.status] || 0) + 1;
    });

    return counts;
  };

  const counts = getStatusCounts();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">My Bookings</h1>
        
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
            <p className="text-yellow-700 text-sm font-medium">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">{counts.PENDING}</p>
          </div>
          <div className="bg-green-50 p-4 rounded border border-green-200">
            <p className="text-green-700 text-sm font-medium">Approved</p>
            <p className="text-3xl font-bold text-green-600">{counts.APPROVED}</p>
          </div>
          <div className="bg-red-50 p-4 rounded border border-red-200">
            <p className="text-red-700 text-sm font-medium">Rejected</p>
            <p className="text-3xl font-bold text-red-600">{counts.REJECTED}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded border border-gray-200">
            <p className="text-gray-700 text-sm font-medium">Cancelled</p>
            <p className="text-3xl font-bold text-gray-600">{counts.CANCELLED}</p>
          </div>
        </div>

        {/* Button to Show Form */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 transition"
        >
          {showForm ? 'Hide Form' : 'Create New Booking'}
        </button>
      </div>

      {/* Booking Form */}
      {showForm && (
        <div className="mb-8">
          <BookingForm onBookingCreated={handleBookingCreated} />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded border border-gray-200">
          <p className="text-gray-600 mb-4">You have no bookings yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 transition"
          >
            Create Your First Booking
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              isAdmin={false}
              onBookingUpdate={handleBookingUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
