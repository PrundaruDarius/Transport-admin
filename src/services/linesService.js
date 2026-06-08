import { apiClient } from "./apiClient.js";

export const linesService = {
  async getAll() {
    const response = await apiClient.get("/admin/lines");
    return response.data;
  },

  async create(data) {
    const response = await apiClient.post("/admin/lines", data);
    return response.data;
  },

  async update(id, data) {
    const response = await apiClient.put(`/admin/lines/${id}`, data);
    return response.data;
  },

  async activate(id) {
    const response = await apiClient.put(`/admin/lines/activate/${id}`);
    return response.data;
  },

  async deactivate(id) {
    const response = await apiClient.put(`/admin/lines/deactivate/${id}`);
    return response.data;
  },

  async remove(id) {
    const response = await apiClient.delete(`/admin/lines/${id}`);
    return response.data;
  },
};