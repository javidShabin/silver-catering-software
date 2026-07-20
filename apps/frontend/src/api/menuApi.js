import api from "../utils/axios";

export const menuApi = {
  getAll: async (params) => {
    const response = await api.get("/menu", { params });
    return response.data;
  },

  getLookup: async () => {
    const response = await api.get("/menu/lookup");
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/menu", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.patch(`/menu/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/menu/${id}`);
    return response.data;
  }
};
