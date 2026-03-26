import PersonalizationsCards from "../../../components/PersonalizationsCards";
import { Link, NavLink, Outlet } from "react-router-dom";

export default function Personalizations({ role="parent" }) {
  const personalizations = [
    {
      id: "1",
      parent_id: "1",
      book_id: "2",
      created_at: "26-03-2026",
      updated_at: "26-03-2026",
    },
    {
      id: "2",
      parent_id: "1",
      book_id: "3",
      created_at: "26-03-2026",
      updated_at: "28-03-2026",
    },
  ];

  return (
    <section>
      <h1>All personalization from this parent here</h1>
      <section>
        <PersonalizationsCards personalizations={personalizations} role={role} />
      </section>
    </section>
  );
}
