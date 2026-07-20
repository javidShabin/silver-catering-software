import api from "../utils/axios";

export const purchaseApi = {
  // Suppliers
  getAllSuppliers: async (params) => {
    const response = await api.get("/purchases/suppliers", { params });
    return response.data;
  },
  createSupplier: async (data) => {
    const response = await api.post("/purchases/suppliers", data);
    return response.data;
  },
  updateSupplier: async (id, data) => {
    const response = await api.patch(`/purchases/suppliers/${id}`, data);
    return response.data;
  },

  // Purchases
  getAllPurchases: async (params) => {
    const response = await api.get("/purchases", { params });
    return response.data;
  },
  createPurchase: async (data) => {
    const response = await api.post("/purchases", data);
    return response.data;
  },
  updatePaymentStatus: async (id, paymentStatus) => {
    const response = await api.patch(`/purchases/${id}/payment`, { paymentStatus });
    return response.data;
  },
  getPurchaseById: async (id) => {
    const response = await api.get(`/purchases/${id}`);
    return response.data;
  },
  updatePurchase: async (id, data) => {
    const response = await api.patch(`/purchases/${id}`, data);
    return response.data;
  },
  deletePurchase: async (id) => {
    const response = await api.delete(`/purchases/${id}`);
    return response.data;
  }
};
