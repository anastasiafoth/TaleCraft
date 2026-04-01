import { useState, useEffect } from "react";
import { useAuth } from "../../src/AuthContext";
import { getChildren } from "../../src/api";
import ChildrenCards from "../../components/ChildrenCards";

export default function ParentDashboard() {
  const { token } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getChildren(token)
      .then(setChildren)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <span className="loading loading-dots loading-md" />;
  if (error) return <p className="text-error">{error.message}</p>;

  return <ChildrenCards children={children} setChildren={setChildren} />;
}
