import { NavLink, Outlet, useParams } from "react-router-dom";

export default function BookEditLayout() {
  const { id } = useParams();
  // if there is an id in the url, we come from the edit path, otherwise from new path
  const mainInfoPath = id ? `/author/books/${id}/edit` : "books/new";
  const activeStyle = "bg-primary text-white";

  return (
    <>
      <ul className="menu menu-vertical lg:menu-horizontal bg-base-200 rounded-box">
        <li>
          <NavLink
            to={mainInfoPath}
            aria-label={`Edit main info`}
            className={({ isActive }) => (isActive ? activeStyle : null)}
          >
            <h2 className="hover:text-primary transition-colors">Main Info</h2>
          </NavLink>
        </li>
        <li>
          <NavLink
            to={id ? `/author/books/${id}/chapters/new` : "#"}
            aria-disabled={!id}
            className={({ isActive }) => (isActive ? activeStyle : null)}
          >
            <h2 className="hover:text-primary transition-colors">Chapters</h2>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="pages/new"
            aria-label={`Edit pages`}
            className={({ isActive }) => (isActive ? activeStyle : null)}
          >
            <h2 className="hover:text-primary transition-colors">Pages</h2>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="character_templates/new"
            aria-label={`Edit character templates`}
            className={({ isActive }) => (isActive ? activeStyle : null)}
          >
            <h2 className="hover:text-primary transition-colors">
              Character Templates
            </h2>
          </NavLink>
        </li>
      </ul>
      <Outlet />
    </>
  );
}
