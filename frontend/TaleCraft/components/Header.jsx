import { Link, NavLink } from "react-router-dom";

export default function Header() {
  return (
    <nav>
      <Link to="/">TaleCraft</Link>
      <div className="nav-links">
        <NavLink to="/books">All Books</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/login">Login</NavLink>
        <NavLink to="/register">Register</NavLink>
        <NavLink to="/logout">Logout</NavLink>
      </div>
    </nav>
  );
}
