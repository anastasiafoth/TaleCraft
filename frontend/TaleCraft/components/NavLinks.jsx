import { NavLink } from "react-router-dom";

export default function NavLinks({ links, onNavigate }) {
  return (
    <nav className="flex flex-col gap-1">
      {links.map(({ to, end, label }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              isActive ? "bg-primary text-white" : "hover:bg-base-200"
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
