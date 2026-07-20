import api from "../utils/axios";

export const categoryApi = {
  getAll: () => api.get("/inventory-categories"),
  create: (data) => api.post("/inventory-categories", data),
  update: (id, data) => api.patch(`/inventory-categories/${id}`, data),
  delete: (id) => api.delete(`/inventory-categories/${id}`),
};
