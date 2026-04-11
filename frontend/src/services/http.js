import axios from 'axios';

const http = axios.create({
  baseURL: 'http://localhost:8080',
  // withCredentials: true, // Not strictly needed for JWT, but can keep if dual-mode
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default http;
