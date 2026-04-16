import { NavLink, Outlet, useParams } from "react-router-dom";

export default function BookEditLayout() {
  const { id, chapterId } = useParams();
  // if there is an id in the url, we come from the edit path, otherwise from new path
  const mainInfoPath = id ? `/author/books/${id}/edit` : "books/new";
  const activeStyle = "bg-primary text-white";

  return (
    <>
      <ul className="menu menu-vertical lg:menu-horizontal bg-base-200 rounded-box w-full">
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
            to={id ? `/author/books/${id}/chapters` : "#"}
            aria-disabled={!id}
            aria-label={`show chapters for the book with id:${id}`}
            onClick={(e) => {
              if (!id) e.preventDefault();
            }}
            className={({ isActive }) =>
              `${isActive && id ? activeStyle : ""} 
            ${!id ? "opacity-50 pointer-events-none cursor-not-allowed" : ""}`
            }
          >
            <h2 className="transition-colors">Chapters</h2>
          </NavLink>
        </li>
        <li>
          <NavLink
            to={id ? `/author/books/${id}/pages` : "#"}
            aria-disabled={!id}
            aria-label={`show pages for the book with id:${id}`}
            onClick={(e) => {
              if (!id) e.preventDefault();
            }}
            className={({ isActive }) =>
              `${isActive && id ? activeStyle : ""} 
            ${!id ? "opacity-50 pointer-events-none cursor-not-allowed" : ""}`
            }
          >
            <h2 className="hover:text-primary transition-colors">Pages</h2>
          </NavLink>
        </li>
        <li>
          <NavLink
            to={id ? `/author/books/${id}/character_templates` : "#"}
            aria-disabled={!id}
            aria-label={`show character templates for the book with id:${id}`}
            onClick={(e) => {
              if (!id) e.preventDefault();
            }}
            className={({ isActive }) =>
              `${isActive && id ? activeStyle : ""} 
            ${!id ? "opacity-50 pointer-events-none cursor-not-allowed" : ""}`
            }
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
