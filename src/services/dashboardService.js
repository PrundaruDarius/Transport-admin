import { apiClient } from "./apiClient.js";

export const dashboardService = {
  async getDashboard() {
    const response = await apiClient.get("/admin/dashboard");
    return response.data;
  },

  async getMonthlyRevenue() {
    const response = await apiClient.get("/admin/statistics/revenue/monthly");
    return response.data;
  },
};