import http from './http';

const API_BASE_URL = '/api/bookings';

const getErrorMessage = (error, fallbackMessage) => {
  const responseData = error.response?.data;

  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData;
  }

  if (responseData?.message) {
    return responseData.message;
  }

  return error.message || fallbackMessage;
};

// Create a new booking
export const createBooking = async (bookingData) => {
  try {
    const response = await http.post(API_BASE_URL, bookingData);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to create booking'));
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
    throw new Error(getErrorMessage(error, 'Failed to load bookings'));
  }
};

// Get a specific booking by ID
export const getBookingById = async (bookingId) => {
  try {
    const response = await http.get(`${API_BASE_URL}/${bookingId}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load booking'));
  }
};

// Update booking status (approve or reject)
export const updateBookingStatus = async (bookingId, statusData) => {
  try {
    const response = await http.patch(`${API_BASE_URL}/${bookingId}/status`, statusData);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to update booking status'));
  }
};

// Cancel a booking
export const cancelBooking = async (bookingId) => {
  try {
    const response = await http.patch(`${API_BASE_URL}/${bookingId}/cancel`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to cancel booking'));
  }
};

// Update a booking (edit details)
export const updateBooking = async (bookingId, bookingData) => {
  try {
    const response = await http.put(`${API_BASE_URL}/${bookingId}`, bookingData);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to update booking'));
  }
};

// Delete a booking (admin only)
export const deleteBooking = async (bookingId) => {
  try {
    const response = await http.delete(`${API_BASE_URL}/${bookingId}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to delete booking'));
  }
};

export default {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  updateBooking,
  cancelBooking,
  deleteBooking,
};
