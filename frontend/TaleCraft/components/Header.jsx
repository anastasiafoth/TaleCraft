import { Link, NavLink } from "react-router-dom";

export default function Header() {

  return (
    <nav>
      <Link to="/">TaleCraft</Link>
      <div className="nav-links">
        <NavLink to="/about">About</NavLink>
        <NavLink to="/contact">Contact</NavLink>
        <NavLink to="/login">Login</NavLink>
        <NavLink to="/register">Register</NavLink>
        <button>Logout</button>
      </div>
    </nav>
  );
}
