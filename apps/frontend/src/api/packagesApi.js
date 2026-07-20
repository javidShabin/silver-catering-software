import api from "../utils/axios";

export const packagesApi = {
  getAll: async () => {
    const response = await api.get("/packages");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/packages/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/packages", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.patch(`/packages/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/packages/${id}`);
    return response.data;
  }
};
