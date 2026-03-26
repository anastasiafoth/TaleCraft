import { NavLink } from "react-router-dom";

export default function Logout() {
  return (
    <div className="logout">
      <h1>Logout message</h1>
      <NavLink to="..">Go back to homepage</NavLink>
    </div>
  );
}
