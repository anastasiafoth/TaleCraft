import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../src/AuthContext";

export default function AuthRequired({ allowedRoles = [] }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}
