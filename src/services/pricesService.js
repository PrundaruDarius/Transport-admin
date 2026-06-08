import { apiClient } from "./apiClient.js";

export const pricesService = {
  async getAll() {
    const response = await apiClient.get("/admin/prices");
    return response.data;
  },

  async update(id, data) {
    const response = await apiClient.put(`/admin/prices/${id}`, data);
    return response.data;
  },
};