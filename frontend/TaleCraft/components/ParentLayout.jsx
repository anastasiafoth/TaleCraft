import { useAuth } from "../src/AuthContext";
import SidebarLayout from "../components/SidebarLayout";

const links = [
  { to: ".", end: true, label: "All children" },
  { to: "children/new", label: "Add new child" },
  { to: "personalizations", end: true, label: "Browse all personalized books" },
  { to: "personalizations/new", label: "Add new personalized book" },
];

export default function ParentLayout() {
  const { user } = useAuth();
  return <SidebarLayout links={links} username={user.first_name} />;
}
