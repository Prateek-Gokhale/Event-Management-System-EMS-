import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);
const STORAGE_KEY = "ems_auth";

function getInitialAuthState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : null;
    if (!isUsableAuthState(parsed)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
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

function isUsableAuthState(value) {
  return Boolean(value?.token && value?.email && value?.role && !isTokenExpired(value.token));
}

export function AuthProvider({ children }) {
  const [authData, setAuthData] = useState(getInitialAuthState);

  useEffect(() => {
    const handleAuthCleared = () => setAuthData(null);
    window.addEventListener("ems-auth-cleared", handleAuthCleared);
    return () => window.removeEventListener("ems-auth-cleared", handleAuthCleared);
  }, []);

  const login = (payload) => {
    if (!isUsableAuthState(payload)) {
      setAuthData(null);
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    setAuthData(payload);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  };

  const logout = () => {
    setAuthData(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      authData,
      token: authData?.token || null,
      user: authData
        ? {
            userId: authData.userId,
            name: authData.name,
            email: authData.email,
            role: authData.role,
          }
        : null,
      isAuthenticated: Boolean(authData?.token),
      isAdmin: authData?.role === "ADMIN",
      login,
      logout,
    }),
    [authData]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
