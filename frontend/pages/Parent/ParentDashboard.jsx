import { useState, useEffect } from "react";
import { useAuth } from "../../src/AuthContext";
import { getAllChildren } from "../../src/api";
import ChildrenCards from "../../components/Parents/ChildrenCards";

export default function ParentDashboard() {
  const { token } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAllChildren(token)
      .then(setChildren)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-dots loading-5xl" />
      </div>
    );
  if (error) return <p className="text-error">{error.message}</p>;

  return <ChildrenCards children={children} setChildren={setChildren} />;
}
