import { create } from "zustand";
import api from "../utils/axios.js";

// Helper function to extract a precise, robust error message from Axios
const extractErrorMessage = (error) => {
  if (error.response) {
    // The server responded with a status code outside the 2xx range
    return error.response.data?.message || error.response.data?.error || "Server error occurred";
  } else if (error.request) {
    // The request was made but no response was received (e.g. server offline or CORS block)
    return "Network error. Please check if the backend server is running.";
  } else {
    // Something happened in setting up the request
    return error.message || "An unexpected error occurred";
  }
};

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isCheckingAuth: true,
  isLoading: false,
  error: null,
  hasAdmin: false,
  isCheckingSetup: true,

  checkSetupStatus: async () => {
    set({ isCheckingSetup: true });
    try {
      const response = await api.get("/auth/setup-status");
      set({
        hasAdmin: response.data.data.hasAdmin,
        isCheckingSetup: false
      });
    } catch (error) {
      set({ hasAdmin: true, isCheckingSetup: false }); // secure fallback
    }
  },

  // Action to check if user is already logged in (on app boot)
  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null });
    try {
      const response = await api.get("/auth/me");
      set({
        user: response.data.user,
        isAuthenticated: true,
        isCheckingAuth: false,
      });
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isCheckingAuth: false,
      });
    }
  },

  // Action to handle login
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/auth/login", { email, password });
      set({
        user: response.data.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return true; // Return true on success so components can navigate
    } catch (error) {
      set({
        error: extractErrorMessage(error),
        isLoading: false,
      });
      return false;
    }
  },

  // Action to handle Google Login via Firebase ID Token
  googleLogin: async (idToken) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/auth/google", { idToken });
      set({
        user: response.data.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (error) {
      set({
        error: extractErrorMessage(error),
        isLoading: false,
      });
      return false;
    }
  },

  // Action to request OTP for signup
  requestSignupOtp: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/auth/request-signup-otp", { name, email, password });
      set({ isLoading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({
        error: extractErrorMessage(error),
        isLoading: false,
      });
      return { success: false, message: extractErrorMessage(error) };
    }
  },

  // Action to handle signup (now requires OTP)
  register: async (name, email, password, otp) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/auth/register", { name, email, password, otp });
      set({
        user: response.data.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (error) {
      set({
        error: extractErrorMessage(error),
        isLoading: false,
      });
      return false;
    }
  },

  // Action to handle logout
  logout: async () => {
    set({ isLoading: true });
    try {
      await api.post("/auth/logout");
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: extractErrorMessage(error),
        isLoading: false,
      });
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/auth/forgot-password", { email });
      set({ isLoading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({
        error: extractErrorMessage(error),
        isLoading: false,
      });
      return { success: false, message: extractErrorMessage(error) };
    }
  },

  resetPassword: async (email, otp, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/auth/reset-password", { email, otp, newPassword });
      set({ isLoading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({
        error: extractErrorMessage(error),
        isLoading: false,
      });
      return { success: false, message: extractErrorMessage(error) };
    }
  },

  // Action to quickly clear state without API call (used by Axios interceptors)
  clearAuth: () => {
    set({
      user: null,
      isAuthenticated: false,
    });
  },

  // Action to clear any authentication errors
  clearError: () => set({ error: null }),

  updateUser: (userData) => set({ user: { ...get().user, ...userData } }),

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put("/auth/profile", data);
      set((state) => ({ 
        user: { ...state.user, ...response.data.user }, 
        isLoading: false 
      }));
      return { success: true };
    } catch (error) {
      const msg = extractErrorMessage(error);
      set({ error: msg, isLoading: false });
      return { success: false, message: msg };
    }
  },

  uploadProfilePic: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/auth/profile-pic", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      set((state) => ({ 
        user: { ...state.user, profilePic: response.data.data.profilePic }, 
        isLoading: false 
      }));
      return { success: true, profilePic: response.data.data.profilePic };
    } catch (error) {
      set({ error: extractErrorMessage(error), isLoading: false });
      return { success: false, message: extractErrorMessage(error) };
    }
  },
}));
