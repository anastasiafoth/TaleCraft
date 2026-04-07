import { Outlet } from "react-router-dom";
import { useAuth } from "../src/AuthContext";
import SidebarLayout from "../components/SidebarLayout";

const links = [
  { to: ".", end: true, label: "All Books" },
  { to: "books/new", label: "Add new books" },
];

export default function AuthorLayout() {
  const { user } = useAuth();

  return (
    <>
      <main>
        
        <SidebarLayout links={links} username={user.first_name} />
      </main>
    </>
  );
}
