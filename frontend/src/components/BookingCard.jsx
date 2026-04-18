import { useState } from 'react';
import BookingStatusBadge from './BookingStatusBadge';
import * as bookingService from '../services/bookingService';

export default function BookingCard({ booking, isAdmin = false, onBookingUpdate, onEditBooking, viewMode = 'tiles' }) {
  const [showApprovalPanel, setShowApprovalPanel] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const formattedDate = new Date(booking.date).toLocaleDateString();
  const timeRange = `${booking.startTime} - ${booking.endTime}`;
  const cardClassName = {
    tiles: 'bg-white border border-gray-200 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow',
    list: 'bg-white border border-gray-200 rounded-lg shadow-sm p-4',
    details: 'bg-white border border-gray-200 rounded-lg shadow-md p-6',
    content: 'bg-white border border-gray-200 rounded-lg shadow-md p-6'
  }[viewMode] || 'bg-white border border-gray-200 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow';

  const renderSummary = () => {
    if (viewMode === 'list') {
      return (
        <div className="grid gap-3 text-sm md:grid-cols-[1.4fr_1fr_1fr_1.1fr] md:items-center">
          <div>
            <p className="font-semibold text-gray-800">{booking.venue}</p>
            <p className="text-gray-500">{booking.purpose}</p>
          </div>
          <div>
            <p className="text-gray-600">Date</p>
            <p className="font-medium">{formattedDate}</p>
          </div>
          <div>
            <p className="text-gray-600">Time</p>
            <p className="font-medium">{timeRange}</p>
          </div>
          <div>
            <p className="text-gray-600">Attendees</p>
            <p className="font-medium">{booking.expectedAttendees}</p>
          </div>
        </div>
      );
    }

    if (viewMode === 'details') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div>
              <p className="text-gray-600">Date</p>
              <p className="font-medium">{formattedDate}</p>
            </div>
            <div>
              <p className="text-gray-600">Time</p>
              <p className="font-medium">{timeRange}</p>
            </div>
            <div>
              <p className="text-gray-600">Attendees</p>
              <p className="font-medium">{booking.expectedAttendees}</p>
            </div>
            <div>
              <p className="text-gray-600">Booking ID</p>
              <p className="font-medium text-gray-700">{booking.id}</p>
            </div>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
            <p className="text-gray-600 text-sm mb-1">Purpose</p>
            <p className="text-gray-800">{booking.purpose}</p>
          </div>
        </div>
      );
    }

    if (viewMode === 'content') {
      return (
        <div className="space-y-3 text-sm">
          <p className="text-gray-700 leading-6">
            <span className="font-semibold text-gray-900">{booking.venue}</span> has been requested for{' '}
            <span className="font-medium">{formattedDate}</span> from{' '}
            <span className="font-medium">{timeRange}</span> for{' '}
            <span className="font-medium">{booking.expectedAttendees}</span> attendee{booking.expectedAttendees === 1 ? '' : 's'}.
          </p>
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
            <p className="text-gray-600 mb-1">Purpose</p>
            <p className="text-gray-800 leading-6">{booking.purpose}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-gray-600">Date</p>
          <p className="font-medium">{formattedDate}</p>
        </div>
        <div>
          <p className="text-gray-600">Time</p>
          <p className="font-medium">{timeRange}</p>
        </div>
        <div>
          <p className="text-gray-600">Purpose</p>
          <p className="font-medium">{booking.purpose}</p>
        </div>
        <div>
          <p className="text-gray-600">Attendees</p>
          <p className="font-medium">{booking.expectedAttendees}</p>
        </div>
      </div>
    );
  };

  const handleApprove = async () => {
    setLoading(true);
    setError('');
    try {
      await bookingService.updateBookingStatus(booking.id, {
        status: 'APPROVED'
      });
      setShowApprovalPanel(false);
      onBookingUpdate?.();
    } catch (err) {
      setError(err.message || 'Failed to approve booking');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await bookingService.updateBookingStatus(booking.id, {
        status: 'REJECTED',
        reason: rejectionReason
      });
      setShowApprovalPanel(false);
      setRejectionReason('');
      onBookingUpdate?.();
    } catch (err) {
      setError(err.message || 'Failed to reject booking');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      setLoading(true);
      setError('');
      try {
        await bookingService.cancelBooking(booking.id);
        onBookingUpdate?.();
      } catch (err) {
        setError(err.message || 'Failed to cancel booking');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = () => {
    onEditBooking?.(booking);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      setLoading(true);
      setError('');
      try {
        await bookingService.deleteBooking(booking.id);
        onBookingUpdate?.();
      } catch (err) {
        setError(err.message || 'Failed to delete booking');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className={cardClassName}>
      <div className={`flex justify-between items-start ${viewMode === 'list' ? 'mb-3 gap-4' : 'mb-4'}`}>
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{booking.venue}</h3>
          {(viewMode === 'tiles' || viewMode === 'details') && (
            <p className="text-sm text-gray-500">ID: {booking.id}</p>
          )}
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <div className="mb-4">
        {renderSummary()}
      </div>

      {isAdmin && (
        <div className="mb-4 text-sm">
          <p className="text-gray-600">Requested By</p>
          <p className="font-medium">{booking.requestedByName} ({booking.requestedByEmail})</p>
        </div>
      )}

      {booking.rejectionReason && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-gray-600">Rejection Reason</p>
          <p className="text-red-700 font-medium">{booking.rejectionReason}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {/* Admin Approval Panel */}
      {isAdmin && booking.status === 'PENDING' && (
        <>
          {!showApprovalPanel ? (
            <button
              onClick={() => setShowApprovalPanel(true)}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
            >
              Review Booking
            </button>
          ) : (
            <div className="bg-blue-50 p-4 rounded border border-blue-200">
              <p className="text-sm font-semibold text-gray-700 mb-3">Admin Action</p>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason (if rejecting)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide reason for rejection (optional if approving)"
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="flex-1 bg-green-500 text-white py-2 px-3 rounded hover:bg-green-600 transition disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Approve'}
                </button>
                <button
                  onClick={handleReject}
                  disabled={loading}
                  className="flex-1 bg-red-500 text-white py-2 px-3 rounded hover:bg-red-600 transition disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Reject'}
                </button>
                <button
                  onClick={() => setShowApprovalPanel(false)}
                  disabled={loading}
                  className="flex-1 bg-gray-400 text-white py-2 px-3 rounded hover:bg-gray-500 transition disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* User Actions for PENDING bookings */}
      {!isAdmin && booking.status === 'PENDING' && (
        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            disabled={loading}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition disabled:opacity-50"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      )}

      {/* User Cancel Button */}
      {!isAdmin && booking.status === 'APPROVED' && (
        <button
          onClick={handleCancel}
          disabled={loading}
          className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Cancel Booking'}
        </button>
      )}
    </div>
  );
}
