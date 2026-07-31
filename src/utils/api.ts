import axios from "axios";
import config from "../config";

export const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    "Content-Type": "application/json"
  }
});

// Request interceptor to attach Bearer Authorization token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle unauthorized access (e.g. token expiration)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and user details to log out user
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("idleTimeoutMs");

      // Redirect to login page if not already there
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
