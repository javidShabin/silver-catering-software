import api from "../utils/axios";

export const customerApi = {
  /**
   * Get all customers with search and pagination
   */
  getAll: async (params) => {
    const response = await api.get("/customers", { params });
    return response.data;
  },

  getLookup: async () => {
    const response = await api.get("/customers/lookup");
    return response.data;
  },

  /**
   * Get a single customer by ID
   */
  getOne: async (id) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  getSummary: async (id) => {
    const response = await api.get(`/customers/${id}/summary`);
    return response.data;
  },

  /**
   * Create a new customer
   */
  create: async (data) => {
    const response = await api.post("/customers", data);
    return response.data;
  },

  /**
   * Update an existing customer
   */
  update: async (id, data) => {
    const response = await api.patch(`/customers/${id}`, data);
    return response.data;
  },

  /**
   * Delete a customer
   */
  delete: async (id) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  }
};
