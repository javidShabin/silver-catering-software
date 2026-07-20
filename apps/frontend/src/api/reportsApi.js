import api from "../utils/axios";

export const reportsApi = {
  getSummary: async (params) => {
    const response = await api.get("/reports/summary", { params });
    return response.data;
  },

  getTrends: async (params) => {
    const response = await api.get("/reports/trends", { params });
    return response.data;
  },

  getTopItems: async (params) => {
    const response = await api.get("/reports/top-items", { params });
    return response.data;
  },

  getDashboardSummary: async (params) => {
    const response = await api.get("/reports/dashboard-summary", { params });
    return response.data;
  },

  getFinancialAnalytics: async (params) => {
    const response = await api.get("/reports/financial-analytics", { params });
    return response.data;
  }
};
