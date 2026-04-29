import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api",
  timeout: 8000,
});

api.interceptors.request.use((config) => {
  const authRaw = localStorage.getItem("ems_auth");
  if (authRaw) {
    try {
      const auth = JSON.parse(authRaw);
      if (auth?.token) {
        config.headers.Authorization = `Bearer ${auth.token}`;
      }
    } catch {
      localStorage.removeItem("ems_auth");
    }
  }
  return config;
});

export default api;
