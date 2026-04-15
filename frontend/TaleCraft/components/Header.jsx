import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../src/AuthContext";
import logo from "../src/assets/images/logo.png";
import { useState } from "react";

export default function Header() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    user?.role === "Author" && { to: "/author", label: "Dashboard" },
    user?.role === "Parent" && { to: "/parent", label: "Dashboard" },
    { to: "/books", label: "All Books" },
    { to: "/about", label: "About" },
    !user && { to: "/login", label: "Login" },
    !user && { to: "/register", label: "Register" },
    user && { to: "/logout", label: "Logout" },
  ].filter(Boolean);

  return (
    <>
      <nav className="navbar bg-base-100 shadow-sm flex p-4">
        <div className="flex-1">
          <Link to="/">
            <img src={logo} alt="TaleCraft" className="h-6 w-auto md:h-10" />
          </Link>
        </div>
        {/* Desktop menu */}
        <div className="hidden md:flex menu menu-horizontal px-1 text-lg gap-4">
          {links.map(({ to, label }) => (
            <NavLink key={to} to={to}>
              {label}
            </NavLink>
          ))}
        </div>

        {/* Burger button – only mobil */}
        <button
          className="btn btn-ghost md:hidden"
          onClick={() => setMobileOpen(true)}
        >
          ☰
        </button>
      </nav>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer – von rechts */}
      <aside
        className={`fixed top-0 right-0 h-full w-64 bg-base-100 z-30 p-6 flex flex-col gap-6 shadow-xl transition-transform duration-300 md:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">Menu</span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setMobileOpen(false)}
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4 text-lg">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                isActive ? "text-primary font-semibold" : ""
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </aside>
    </>
  );
}
