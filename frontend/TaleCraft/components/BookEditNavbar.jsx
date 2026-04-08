import { NavLink } from "react-router-dom";
import { useState } from "react";

export default function BookEditNavbar({ newBook }) {
  return (
    <>
      <ul className="menu menu-vertical lg:menu-horizontal bg-base-200 rounded-box">
        <li>
          <NavLink to="." aria-label={`Edit main info`}>
            <h2 className="hover:text-primary transition-colors">Main Info</h2>
          </NavLink>
        </li>
        <li>
          <NavLink
            to={newBook ? `/author/books/${newBook.id}/chapters/new` : "#"}
            aria-disabled={!newBook}
          >
            <h2 className="hover:text-primary transition-colors">Chapters</h2>
          </NavLink>
        </li>
        <li>
          <NavLink to="pages/new" aria-label={`Edit pages`}>
            <h2 className="hover:text-primary transition-colors">Pages</h2>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="character_templates/new"
            aria-label={`Edit character templates`}
          >
            <h2 className="hover:text-primary transition-colors">
              Character Templates
            </h2>
          </NavLink>
        </li>
      </ul>
    </>
  );
}
