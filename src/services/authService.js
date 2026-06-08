import { apiClient } from "./apiClient.js";

export const authService = {
  async login(credentials) {
    const { data } = await apiClient.post("/Auth/login", credentials);
    return data;
  }
};