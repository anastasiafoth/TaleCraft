import { Outlet, Navigate, useLocation } from "react-router-dom";

export default function AuthRequired() {
  return (
    <>
      <h1>Are you logged in?</h1>
      <Outlet />;
    </>
  );
}
