import axios from "axios";
import { useAuthStore } from "../store/authStore.js";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true, // Crucial for sending/receiving httpOnly cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercept responses to handle 401 Unauthorized and Network Errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle Network Errors (No response received)
    if (!error.response) {
      toast.error("Network Error: Cannot connect to the server. Please check your internet connection or try again later.", {
        id: "network-error", // Prevents duplicate toasts
        duration: 5000,
      });
    } else if (error.response.status === 401) {
      // Clear Zustand store if session is expired or unauthorized
      useAuthStore.getState().clearAuth();
      console.warn("Unauthorized access detected. Session expired.");
    }
    return Promise.reject(error);
  }
);

export default api;
