import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../src/AuthContext";
import logo from "../src/assets/images/logo.png";

export default function Header() {
  const { user } = useAuth();

  return (
    <nav className="navbar bg-base-100 shadow-sm flex p-4">
      <div className="flex-1">
        <Link to="/">
          <img src={logo} alt="TaleCraft" className="h-14 w-auto" />
        </Link>
      </div>
      <div className="flex-none ">
        <div className="menu menu-horizontal px-1 text-lg gap-4">
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
