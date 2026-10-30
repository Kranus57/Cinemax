import { axiosClient } from './axiosClient';

export const movieApi = {
  getAllMovies: (params = {}) => axiosClient.get('/movies', { params }),
  getMovieByIdOrSlug: (identifier) => axiosClient.get(`/movies/${identifier}`),
  getMovieShows: (movieId, params = {}) =>
    axiosClient.get(`/movies/${movieId}/shows`, { params }),
  createMovie: (movieData) => axiosClient.post('/movies', movieData),
  updateMovie: (id, movieData) => axiosClient.put(`/movies/${id}`, movieData),
  deleteMovie: (id) => axiosClient.delete(`/movies/${id}`),
};
