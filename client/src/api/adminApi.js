import { axiosClient } from './axiosClient';

export const adminApi = {
  getStats: () => axiosClient.get('/admin/stats'),
  getAllBookings: (params = {}) => axiosClient.get('/admin/bookings', { params }),
};
