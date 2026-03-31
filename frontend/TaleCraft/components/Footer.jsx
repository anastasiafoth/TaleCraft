import { Link, NavLink } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="navbar bg-base-100 shadow-sm flex p-4">
      <NavLink to="/contact" className="flex-1">Contact</NavLink>
      &#169; 2026 TaleCraft
    </footer>
  );
}
