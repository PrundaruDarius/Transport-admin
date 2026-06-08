import { apiClient } from "./apiClient.js";

export const stationsService = {
  async getAll() {
    const response = await apiClient.get("/admin/stations");
    return response.data;
  },

  async create(data) {
    const response = await apiClient.post("/admin/stations", data);
    return response.data;
  },

  async update(id, data) {
    const response = await apiClient.put(`/admin/stations/${id}`, data);
    return response.data;
  },

  async remove(id) {
    const response = await apiClient.delete(`/admin/stations/${id}`);
    return response.data;
  },
};