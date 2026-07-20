import api from "../utils/axios";

export const eventApi = {
  // Get all events with optional query params (status, search, page)
  getAll: async (params) => {
    const response = await api.get("/events", { params });
    return response.data;
  },

  getLookup: async () => {
    const response = await api.get("/events/lookup");
    return response.data;
  },

  getOverdueCount: async () => {
    const response = await api.get("/events/overdue-count");
    return response.data;
  },

  // Get a single event by ID
  getById: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  // Create a new event
  create: async (data) => {
    const response = await api.post("/events", data);
    return response.data;
  },

  // Update an existing event
  update: async (id, data) => {
    const response = await api.patch(`/events/${id}`, data);
    return response.data;
  },

  // Delete an event
  delete: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  // Event Ingredients API
  getIngredients: async (eventId) => {
    const response = await api.get(`/events/${eventId}/ingredients`);
    return response.data;
  },

  addIngredient: async (eventId, data) => {
    const response = await api.post(`/events/${eventId}/ingredients`, data);
    return response.data;
  },

  updateIngredient: async (eventId, ingredientId, data) => {
    const response = await api.patch(`/events/${eventId}/ingredients/${ingredientId}`, data);
    return response.data;
  },

  deleteIngredient: async (eventId, ingredientId) => {
    const response = await api.delete(`/events/${eventId}/ingredients/${ingredientId}`);
    return response.data;
  },

  // Event Logistics API
  getLogistics: async (eventId) => {
    const response = await api.get(`/events/${eventId}/logistics`);
    return response.data;
  },

  processLogisticsReturn: async (eventId, data) => {
    const response = await api.post(`/events/${eventId}/logistics/return`, data);
    return response.data;
  },

  // Extra Bills API
  addExtraBill: async (eventId, data) => {
    const response = await api.post(`/events/${eventId}/extra-bills`, data);
    return response.data;
  },

  deleteExtraBill: async (eventId, billId) => {
    const response = await api.delete(`/events/${eventId}/extra-bills/${billId}`);
    return response.data;
  }
};
