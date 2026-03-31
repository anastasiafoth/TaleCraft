import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../src/AuthContext";

export default function Header() {
  const { user } = useAuth();

  return (
    <nav className="navbar bg-base-100 shadow-sm">
      <Link to="/">TaleCraft</Link>
      <div className="nav-links">
        {user?.role === "Author" && <NavLink to="/author">Dashboard</NavLink>}
        {user?.role === "Parent" && <NavLink to="/parent">Dashboard</NavLink>}
        <NavLink to="/books">All Books</NavLink>
        <NavLink to="/about">About</NavLink>
        {!user && <NavLink to="/login">Login</NavLink>}
        {!user && <NavLink to="/register">Register</NavLink>}
        {user && <NavLink to="/logout">Logout</NavLink>}
      </div>
    </nav>
  );
}
