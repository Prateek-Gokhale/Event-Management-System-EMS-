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

function isAuthRequest(config) {
  const requestUrl = `${config.baseURL || ""}${config.url || ""}`;
  return requestUrl.includes("/auth/");
}

function clearStoredAuth() {
  localStorage.removeItem("ems_auth");
  window.dispatchEvent(new Event("ems-auth-cleared"));
}

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(decodeJwtPayload(token));
    return typeof payload.exp === "number" && payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

function decodeJwtPayload(token) {
  const payload = token.split(".")[1] || "";
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return atob(padded);
}

api.interceptors.request.use((config) => {
  if (isAuthRequest(config)) {
    return config;
  }

  const authRaw = localStorage.getItem("ems_auth");
  if (authRaw) {
    try {
      const auth = JSON.parse(authRaw);
      if (auth?.token) {
        if (isTokenExpired(auth.token)) {
          clearStoredAuth();
          return config;
        }
        config.headers.Authorization = `Bearer ${auth.token}`;
      }
    } catch {
      clearStoredAuth();
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearStoredAuth();
    }
    return Promise.reject(error);
  }
);

export default api;
