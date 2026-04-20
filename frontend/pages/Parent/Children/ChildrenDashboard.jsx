import { Link, NavLink, Outlet } from "react-router-dom";
import PersonalizationsCards from "../../../components/Parents/PersonalizationsCards";

export default function ChildrenDashboard() {
  return (
    <>
      <h1>Children Dashboard</h1>
      <section>
        <PersonalizationsCards role="child" />
      </section>
    </>
  );
}
