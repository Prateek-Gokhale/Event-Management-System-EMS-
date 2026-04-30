import axios from "axios";

const FALLBACK_API_BASE_URL = "/api";

function getApiBaseUrl() {
  const value = import.meta.env.VITE_API_BASE_URL || "";
  const cleaned = value.replace(/^\uFEFF/, "").replace(/^ï»¿/, "").trim();
  if (cleaned.startsWith("http") || cleaned.startsWith("/")) return cleaned;
  return FALLBACK_API_BASE_URL;
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
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
