import api from "../utils/axios";

export const supplierApi = {
  getAll: async () => {
    const response = await api.get("/suppliers");
    return response.data;
  },

  getLookup: async () => {
    const response = await api.get("/suppliers/lookup");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/suppliers", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.patch(`/suppliers/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/suppliers/${id}`);
    return response.data;
  }
};
