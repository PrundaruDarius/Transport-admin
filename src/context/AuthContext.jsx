import { createContext, useContext, useMemo, useState } from "react";
import { jwtDecodeSafe } from "../utils/jwt.js";

const AuthContext = createContext(null);

const TOKEN_KEY = "adminToken";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  const user = useMemo(() => {
    if (!token) return null;

    const decoded = jwtDecodeSafe(token);

    if (!decoded) return null;

    const rawRoles =
      decoded.roles ??
      decoded.role ??
      decoded[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ] ??
      [];

    const roles = Array.isArray(rawRoles) ? rawRoles : [rawRoles];

    return {
      ...decoded,
      roles,
    };
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    window.location.href = "/login";
  };

  const hasRole = (roles = []) => {
    if (!user?.roles?.length) return false;

    return roles.some((role) => user.roles.includes(role));
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        hasRole,
        isAuthenticated: Boolean(token && user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext trebuie folosit în AuthProvider.");
  }

  return context;
}