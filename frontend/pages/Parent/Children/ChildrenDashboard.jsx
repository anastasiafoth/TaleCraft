import { Link, NavLink, Outlet, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../../src/AuthContext";
import { getChildById } from "../../../src/api";
import PersonalizationsCards from "../../../components/Parents/PersonalizationsCards";

export default function ChildrenDashboard() {
  const { token } = useAuth();
  const [child, setChild] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { childId } = useParams();

  useEffect(() => {
    getChildById(childId, token)
      .then(setChild)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-dots loading-5xl" />
      </div>
    );

  return (
    <>
      <h1 className="text-2xl font-bold pb-4 text-primary">Hello {child.first_name}! </h1>
      <p className="font-bold pb-4">What would you want to read next?</p>
      <section>
        <PersonalizationsCards role="child" />
      </section>
    </>
  );
}
