import { apiClient } from "./apiClient.js";

export const timetableService = {
  async getAll() {
    const response = await apiClient.get("/admin/timetable");
    return response.data;
  },

  async create(data) {
    const response = await apiClient.post("/admin/timetable", data);
    return response.data;
  },

  async update(stationId, lineCode, hour, data) {
    const response = await apiClient.put(
      `/admin/timetable/${stationId}/${lineCode}/${hour}`,
      data
    );
    return response.data;
  },

  async activate(stationId, lineCode, hour) {
    const response = await apiClient.put(
      `/admin/timetable/activate/${stationId}/${lineCode}/${hour}`
    );
    return response.data;
  },

  async deactivate(stationId, lineCode, hour) {
    const response = await apiClient.put(
      `/admin/timetable/deactivate/${stationId}/${lineCode}/${hour}`
    );
    return response.data;
  },

  async remove(stationId, lineCode, hour) {
    const response = await apiClient.delete(
      `/admin/timetable/${stationId}/${lineCode}/${hour}`
    );
    return response.data;
  },
};