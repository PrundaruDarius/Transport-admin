import { apiClient } from "./apiClient.js";

export const usersService = {
  async getAll() {
    const response = await apiClient.get("/admin/users");
    return response.data;
  },

  async getById(id) {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data;
  },

  async createController(data) {
    const response = await apiClient.post("/admin/users/create-controller", data);
    return response.data;
  },

  async createAdmin(data) {
    const response = await apiClient.post("/admin/users/create-admin", data);
    return response.data;
  },

  async addRole(id, role) {
    const response = await apiClient.post(`/admin/users/${id}/roles`, {
      role,
    });
    return response.data;
  },

  async removeRole(id, roleName) {
    const response = await apiClient.delete(`/admin/users/${id}/roles/${roleName}`);
    return response.data;
  },

  async disable(id) {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  },
};