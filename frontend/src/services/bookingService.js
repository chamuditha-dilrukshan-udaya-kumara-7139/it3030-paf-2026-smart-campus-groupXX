import http from './http';

const API_BASE_URL = '/api/bookings';

// Create a new booking
export const createBooking = async (bookingData) => {
  try {
    const response = await http.post(API_BASE_URL, bookingData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all bookings (own bookings for USER, all bookings for ADMIN)
export const getAllBookings = async (status = null, resourceId = null, date = null) => {
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (resourceId) params.append('resourceId', resourceId);
    if (date) params.append('date', date);

    const queryString = params.toString();
    const url = queryString ? `${API_BASE_URL}?${queryString}` : API_BASE_URL;

    const response = await http.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get a specific booking by ID
export const getBookingById = async (bookingId) => {
  try {
    const response = await http.get(`${API_BASE_URL}/${bookingId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update booking status (approve or reject)
export const updateBookingStatus = async (bookingId, statusData) => {
  try {
    const response = await http.patch(`${API_BASE_URL}/${bookingId}/status`, statusData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Cancel a booking
export const cancelBooking = async (bookingId) => {
  try {
    const response = await http.patch(`${API_BASE_URL}/${bookingId}/cancel`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete a booking (admin only)
export const deleteBooking = async (bookingId) => {
  try {
    const response = await http.delete(`${API_BASE_URL}/${bookingId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  deleteBooking,
};
