import { Link, NavLink, Outlet } from "react-router-dom";

export default function AuthorLayout() {
  return (
    <>
      <main>
        <h1>Welcome! Authors Name</h1>
        <nav>
          <div className="nav-links">
            <NavLink to="." end>
              All Books
            </NavLink>
            <NavLink to="new">Add new Book</NavLink>
          </div>
        </nav>
        <Outlet />
      </main>
    </>
  );
}
