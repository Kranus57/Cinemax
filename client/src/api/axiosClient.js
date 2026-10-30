import axios from 'axios';

export const axiosClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for unified response unwrapping and error handling
axiosClient.interceptors.response.use(
  (response) => {
    // Return inner data payload if available
    return response.data;
  },
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject({
      message,
      statusCode: error.response?.status,
      errors: error.response?.data?.errors,
    });
  }
);
