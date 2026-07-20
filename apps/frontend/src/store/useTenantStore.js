import { create } from "zustand";
import api from "../utils/axios";

const extractErrorMessage = (error) => {
  if (error.response) {
    return error.response.data?.message || error.response.data?.error || "Server error occurred";
  }
  if (error.request) {
    return "Network error. Please check if the backend server is running.";
  }
  return error.message || "An unexpected error occurred";
};

export const useTenantStore = create((set) => ({
  tenant: null,
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/settings");
      set({ tenant: response.data.data, isLoading: false });
      return { success: true, tenant: response.data.data };
    } catch (error) {
      const message = extractErrorMessage(error);
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  updateSettings: async (settings) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put("/settings", settings);
      set({ tenant: response.data.data, isLoading: false });
      return { success: true, tenant: response.data.data };
    } catch (error) {
      const message = extractErrorMessage(error);
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  uploadLogo: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/settings/logo", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const logoUrl = response.data.data.logoUrl;
      set((state) => ({
        tenant: { ...(state.tenant || {}), logoUrl },
        isLoading: false
      }));
      return { success: true, logoUrl };
    } catch (error) {
      const message = extractErrorMessage(error);
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  }
}));
