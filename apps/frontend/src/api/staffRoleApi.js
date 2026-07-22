import api from "../utils/axios";

export const staffRoleApi = {
  getAll: async () => {
    const response = await api.get("/staff-roles");
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/staff-roles/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/staff-roles", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.patch(`/staff-roles/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/staff-roles/${id}`);
    return response.data;
  }
};
