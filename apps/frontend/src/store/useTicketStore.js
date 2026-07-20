import { create } from "zustand";
import api from "../utils/axios";

export const useTicketStore = create((set, get) => ({
  tickets: [],
  selectedTicket: null,
  messages: [],
  isLoading: false,
  error: null,

  // Super Admin state
  adminTickets: [],
  adminSelectedTicket: null,
  adminMessages: [],
  isLoadingAdmin: false,
  pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },

  // ─── Tenant Actions ─────────────────────────────────────────────────────────

  fetchMyTickets: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get("/tickets/my-tickets");
      set({ tickets: res.data.data, isLoading: false });
    } catch (err) {
      set({ 
        error: err.response?.data?.message || "Failed to fetch support tickets", 
        isLoading: false 
      });
    }
  },

  createTicket: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post("/tickets", data);
      set((state) => ({
        tickets: [res.data.data, ...state.tickets],
        isLoading: false
      }));
      return { success: true, data: res.data.data };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to create support ticket";
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  fetchTicketDetails: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/tickets/${id}`);
      set({ 
        selectedTicket: res.data.data, 
        messages: res.data.data.messages || [],
        isLoading: false 
      });
    } catch (err) {
      set({ 
        error: err.response?.data?.message || "Failed to fetch ticket details", 
        isLoading: false 
      });
    }
  },

  sendReply: async (id, message) => {
    try {
      const res = await api.post(`/tickets/${id}/messages`, { message });
      const newMessage = res.data.data;
      
      set((state) => ({
        messages: [...state.messages, newMessage],
        selectedTicket: state.selectedTicket 
          ? { ...state.selectedTicket, status: newMessage.isAdmin ? "in_progress" : "open" }
          : null,
        tickets: state.tickets.map(t => 
          t.id === id 
            ? { ...t, status: newMessage.isAdmin ? "in_progress" : "open" } 
            : t
        )
      }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to send reply" };
    }
  },

  closeTicket: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.patch(`/tickets/${id}/close`);
      const updatedTicket = res.data.data;
      
      set((state) => ({
        selectedTicket: state.selectedTicket?.id === id ? updatedTicket : state.selectedTicket,
        tickets: state.tickets.map(t => t.id === id ? updatedTicket : t),
        isLoading: false
      }));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to close ticket";
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  // ─── Super Admin Actions ────────────────────────────────────────────────────

  adminFetchTickets: async (params = {}) => {
    set({ isLoadingAdmin: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append("status", params.status);
      if (params.priority) queryParams.append("priority", params.priority);
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);

      const res = await api.get(`/tickets/admin/all?${queryParams.toString()}`);
      set({ 
        adminTickets: res.data.data,
        pagination: res.data.pagination,
        isLoadingAdmin: false 
      });
    } catch (err) {
      set({ 
        error: err.response?.data?.message || "Failed to fetch platform tickets", 
        isLoadingAdmin: false 
      });
    }
  },

  adminFetchTicketDetails: async (id) => {
    set({ isLoadingAdmin: true, error: null });
    try {
      const res = await api.get(`/tickets/${id}`); // Super Admin can access via same endpoint
      set({ 
        adminSelectedTicket: res.data.data, 
        adminMessages: res.data.data.messages || [],
        isLoadingAdmin: false 
      });
    } catch (err) {
      set({ 
        error: err.response?.data?.message || "Failed to fetch ticket details", 
        isLoadingAdmin: false 
      });
    }
  },

  adminSendReply: async (id, message) => {
    try {
      const res = await api.post(`/tickets/${id}/messages`, { message }); // Automatically sets isAdmin: true in backend
      const newMessage = res.data.data;
      
      set((state) => ({
        adminMessages: [...state.adminMessages, newMessage],
        adminSelectedTicket: state.adminSelectedTicket 
          ? { ...state.adminSelectedTicket, status: "in_progress" }
          : null,
        adminTickets: state.adminTickets.map(t => 
          t.id === id ? { ...t, status: "in_progress" } : t
        )
      }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to send admin reply" };
    }
  },

  adminUpdateTicket: async (id, data) => {
    try {
      const res = await api.patch(`/tickets/admin/${id}`, data);
      const updatedTicket = res.data.data;
      
      set((state) => ({
        adminSelectedTicket: state.adminSelectedTicket?.id === id ? updatedTicket : state.adminSelectedTicket,
        adminTickets: state.adminTickets.map(t => t.id === id ? updatedTicket : t)
      }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to update ticket" };
    }
  }
}));
