import api from "../utils/axios";

export const staffApi = {
  getAll: async (params) => {
    const response = await api.get("/staff", { params });
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/staff", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.patch(`/staff/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/staff/${id}`);
    return response.data;
  },

  getRoles: async () => {
    const response = await api.get("/staff/roles");
    return response.data;
  },

  createRole: async (data) => {
    const response = await api.post("/staff/roles", data);
    return response.data;
  },

  updateRole: async (id, data) => {
    const response = await api.patch(`/staff/roles/${id}`, data);
    return response.data;
  },

  deleteRole: async (id) => {
    const response = await api.delete(`/staff/roles/${id}`);
    return response.data;
  }
};
