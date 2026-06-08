import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext.jsx";
import { isTokenExpired } from "../utils/jwt.js";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { token, hasRole } = useAuthContext();
  const location = useLocation();

  const invalidToken = !token || isTokenExpired(token);

  if (invalidToken) {
    localStorage.removeItem("adminToken");

    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}