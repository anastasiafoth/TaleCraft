import { Link, NavLink, Outlet } from "react-router-dom";

export default function AuthorDashboard() {
  return (
    <>
      <h1>Welcome!</h1>
      <nav>
        <div className="nav-links">
          <NavLink to="." end>
            All Books
          </NavLink>
          <NavLink to="new">Add new Book</NavLink>
        </div>
      </nav>
      <Outlet />
    </>
  );
}
