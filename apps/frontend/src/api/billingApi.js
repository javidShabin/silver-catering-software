import api from "../utils/axios";

export const billingApi = {
  getAll: async (params) => {
    const response = await api.get("/billing", { params });
    return response.data;
  },

  getStats: async (params) => {
    const response = await api.get("/billing/stats", { params });
    return response.data;
  },

  getOverdueCount: async () => {
    const response = await api.get("/billing/overdue-count");
    return response.data;
  },

  getOne: async (id) => {
    const response = await api.get(`/billing/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/billing", data);
    return response.data;
  },

  downloadAsync: async (id) => {
    const response = await api.get(`/billing/${id}/public-download`);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/billing/${id}/status`, { status });
    return response.data;
  },

  recordPayment: async (id, paymentData) => {
    const response = await api.post(`/billing/${id}/payments`, paymentData);
    return response.data;
  },

  setPromisedDate: async (id, promisedPaymentDate) => {
    const response = await api.patch(`/billing/${id}/promised-date`, { promisedPaymentDate });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/billing/${id}`);
    return response.data;
  }
};
