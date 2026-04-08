import { NavLink } from "react-router-dom";
import { useAuth } from "../src/AuthContext";

export default function Logout() {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
  }, []);

  return (
    <div className="logout">
      <h1>You have successfully logged out.</h1>
      <NavLink to="/">Go back to homepage</NavLink>
    </div>
  );
}
