import { axiosClient } from './axiosClient';

export const bookingApi = {
  lockSeats: (showId, seatNumbers) =>
    axiosClient.post('/bookings/lock', { showId, seatNumbers }),
  releaseSeats: (showId, seatNumbers) =>
    axiosClient.post('/bookings/release', { showId, seatNumbers }),
  createReservation: (showId, seatNumbers) =>
    axiosClient.post('/bookings/reserve', { showId, seatNumbers }),
  confirmBooking: (bookingId, paymentDetails) =>
    axiosClient.post('/bookings/confirm', { bookingId, paymentDetails }),
  getMyBookings: (params = {}) =>
    axiosClient.get('/bookings/my-bookings', { params }),
  getBookingById: (id) => axiosClient.get(`/bookings/${id}`),
  cancelBooking: (id, reason) =>
    axiosClient.post(`/bookings/${id}/cancel`, { reason }),
};
