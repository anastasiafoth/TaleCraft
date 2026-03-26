import { Link, NavLink, Outlet } from "react-router-dom";

export default function ParentLayout() {
  return (
    <>
      <main>
        <h1>Welcome! Parent´s name</h1>
        <nav>
          <div className="nav-links">
            <NavLink to="." end>
              All Children
            </NavLink>
            <NavLink to="children/new">Add new child</NavLink>
            <NavLink to="personalizations" end>
              Browse all personalized books
            </NavLink>
            <NavLink to="personalizations/new">
              Add new personalized book
            </NavLink>
          </div>
        </nav>
        <Outlet />
      </main>
    </>
  );
}
