import { Link, NavLink, Outlet } from "react-router-dom";
import Personalizations from "../Personalizations/Personalizations";

export default function ChildrenDashboard() {
  return (
    <>
      <h1>Children Dashboard</h1>
      <section>
        <Personalizations role="child" />
      </section>
    </>
  );
}
