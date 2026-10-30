import { axiosClient } from './axiosClient';

export const cinemaApi = {
  getAllCinemas: (params = {}) => axiosClient.get('/cinemas', { params }),
  getCinemaById: (id) => axiosClient.get(`/cinemas/${id}`),
  getCities: () => axiosClient.get('/cinemas/cities'),
  createCinema: (cinemaData) => axiosClient.post('/cinemas', cinemaData),
  updateCinema: (id, cinemaData) => axiosClient.put(`/cinemas/${id}`, cinemaData),
  getScreens: (cinemaId) => axiosClient.get(`/screens/cinema/${cinemaId}`),
  createScreen: (screenData) => axiosClient.post('/screens', screenData),
  createShow: (showData) => axiosClient.post('/shows', showData),
  getShowById: (showId) => axiosClient.get(`/shows/${showId}`),
};
