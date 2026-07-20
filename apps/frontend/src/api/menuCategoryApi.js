import api from "../utils/axios";

export const menuCategoryApi = {
  getAll: async () => {
    const response = await api.get("/menu-categories");
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/menu-categories", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.patch(`/menu-categories/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/menu-categories/${id}`);
    return response.data;
  }
};
