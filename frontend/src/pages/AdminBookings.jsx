import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import BookingCard from '../components/BookingCard';
import * as bookingService from '../services/bookingService';

export default function AdminBookings() {
  const viewModes = ['tiles', 'list', 'details', 'content'];
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('tiles');

  const [filters, setFilters] = useState({
    status: '',
    venue: '',
    date: ''
  });

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await bookingService.getAllBookings();
      const normalized = Array.isArray(data) ? data : [];
      setBookings(normalized);
      applyFilters(normalized, filters);
    } catch (err) {
      setError('Failed to load bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (bookingList, filterOptions) => {
    let filtered = bookingList;

    if (filterOptions.status) {
      filtered = filtered.filter((b) => b.status === filterOptions.status);
    }

    if (filterOptions.venue) {
      filtered = filtered.filter((b) =>
        (b.venue || '').toLowerCase().includes(filterOptions.venue.toLowerCase())
      );
    }

    if (filterOptions.date) {
      filtered = filtered.filter((b) => b.date === filterOptions.date);
    }

    setFilteredBookings(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    applyFilters(bookings, newFilters);
  };

  const handleReset = () => {
    setFilters({ status: '', venue: '', date: '' });
    setFilteredBookings(bookings);
  };

  const handleBookingUpdate = () => {
    loadBookings();
  };

  const getStatusDistribution = () => {
    const distribution = {
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
      CANCELLED: 0
    };

    bookings.forEach((booking) => {
      distribution[booking.status] = (distribution[booking.status] || 0) + 1;
    });

    return distribution;
  };

  const distribution = getStatusDistribution();

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100 font-sans">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="p-8 bg-white border-b shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Booking Management</h2>
            <p className="text-sm text-slate-500">Review, filter, approve, and reject campus booking requests</p>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-8">
          <div className="mb-8">
            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
              <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                <p className="text-yellow-700 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{distribution.PENDING}</p>
              </div>
              <div className="bg-green-50 p-4 rounded border border-green-200">
                <p className="text-green-700 text-sm font-medium">Approved</p>
                <p className="text-3xl font-bold text-green-600">{distribution.APPROVED}</p>
              </div>
              <div className="bg-red-50 p-4 rounded border border-red-200">
                <p className="text-red-700 text-sm font-medium">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{distribution.REJECTED}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <p className="text-gray-700 text-sm font-medium">Total</p>
                <p className="text-3xl font-bold text-gray-600">{bookings.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Venue</label>
                <input
                  type="text"
                  name="venue"
                  value={filters.venue}
                  onChange={handleFilterChange}
                  placeholder="Filter by venue name"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  name="date"
                  value={filters.date}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleReset}
                  className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          <div className="mb-6 flex flex-col gap-3 rounded-lg bg-white border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">View</p>
              <p className="text-xs text-slate-500">Choose how bookings should be displayed.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {viewModes.map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 rounded text-sm font-medium capitalize transition ${
                    viewMode === mode
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {filteredBookings.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded border border-gray-200">
              <p className="text-gray-600">
                {bookings.length === 0 ? 'No bookings found.' : 'No bookings match the selected filters.'}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Showing {filteredBookings.length} of {bookings.length} bookings
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    isAdmin={true}
                    onBookingUpdate={handleBookingUpdate}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
