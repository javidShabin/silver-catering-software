import api from "../utils/axios";

export const inventoryApi = {
  getAll: async (params) => {
    const response = await api.get("/inventory", { params });
    return response.data;
  },

  getLookup: async () => {
    const response = await api.get("/inventory/lookup");
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/inventory", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.patch(`/inventory/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/inventory/${id}`);
    return response.data;
  },

  updateStock: async (id, quantity, type) => {
    const response = await api.patch(`/inventory/${id}/stock`, { quantity, type });
    return response.data;
  }
};
