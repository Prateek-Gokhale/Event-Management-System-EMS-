import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);
const STORAGE_KEY = "ems_auth";

function getInitialAuthState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [authData, setAuthData] = useState(getInitialAuthState);

  const login = (payload) => {
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
