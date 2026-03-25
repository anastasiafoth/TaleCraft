import { Outlet } from "react-router-dom";

export default function AuthorLayout() {
  return (
    <>
      <main>
        <Outlet />
      </main>
    </>
  );
}
