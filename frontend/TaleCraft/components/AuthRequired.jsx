import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../src/AuthContext";

export default function AuthRequired({ allowedRoles = [] }) {
  const { user } = useAuth();

  if (!user) {
    // user not logged in
    return (
      <Navigate
        to="/login"
        replace
        state={{
          message: "You need to be logged in, to see this page.",
        }}
      />
    );
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Role is not allowed
    return (
      <Navigate
        to="/login"
        replace
        state={{ message: "You have no permission ." }}
      />
    ); 
  }

  return <Outlet />; 
}
