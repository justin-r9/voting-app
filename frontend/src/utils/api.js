import axios from 'axios';

// Create an instance of axios
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/*
  NOTE: interceptors are a powerful feature of axios.
  They allow you to intercept requests or responses before they are handled by `then` or `catch`.
  The following code sets up a request interceptor that will automatically
  add the authentication token to every outgoing request.
*/
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;