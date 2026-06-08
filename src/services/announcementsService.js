import { apiClient } from "./apiClient.js";

export const announcementsService = {
  async getAll() {
    const response = await apiClient.get("/admin/announcements");
    return response.data;
  },

  async create(data) {
    const response = await apiClient.post("/admin/announcements", data);
    return response.data;
  },

  async update(id, data) {
    const response = await apiClient.put(`/admin/announcements/${id}`, data);
    return response.data;
  },

  async remove(id) {
    const response = await apiClient.delete(`/admin/announcements/${id}`);
    return response.data;
  },
};