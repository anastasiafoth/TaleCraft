import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../src/AuthContext";

export default function Header() {
  const { user } = useAuth();

  return (
    <nav className="navbar bg-base-100 shadow-sm flex p-4">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl">
          TaleCraft
        </Link>
      </div>
      <div className="flex-none">
        <div className="menu menu-horizontal px-1">
          {user?.role === "Author" && <NavLink to="/author">Dashboard</NavLink>}
          {user?.role === "Parent" && <NavLink to="/parent">Dashboard</NavLink>}
          <NavLink to="/books">All Books</NavLink>
          <NavLink to="/about">About</NavLink>
          {!user && <NavLink to="/login">Login</NavLink>}
          {!user && <NavLink to="/register">Register</NavLink>}
          {user && <NavLink to="/logout">Logout</NavLink>}
        </div>
      </div>
    </nav>
  );
}
