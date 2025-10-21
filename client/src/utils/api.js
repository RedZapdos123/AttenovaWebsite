//This program configures a centralized Axios client with base URL and JWT token injection via interceptor.

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
});

//Attach token from localStorage if present.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = token;
  }
  return config;
});

export default api;

