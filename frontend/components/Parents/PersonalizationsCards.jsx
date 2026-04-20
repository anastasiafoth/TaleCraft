import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../src/AuthContext";
import { getAllPersonalizations, deletePersonalization } from "../../src/api";
import Card from "../Card";

export default function PersonalizationsCards({ role = "parent" }) {
  const { token } = useAuth();
  const [personalizations, setPersonalizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    getAllPersonalizations(token)
      .then(setPersonalizations)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [token]);

  const handleDelete = async (id) => {
    await deletePersonalization(token, id);
    setPersonalizations((prev) => prev.filter((p) => p.id !== id));
  };

  if (loading) return <span className="loading loading-dots loading-md" />;
  if (error) return <p className="text-error">{error.message}</p>;

  return (
    <section>
      <section>
        {personalizations.map((p, i) => {
          const actions =
            role === "parent"
              ? {
                  Edit: {
                    fn: () => navigate(`${p.id}`),
                    className: "btn-primary",
                  },
                  Delete: {
                    fn: () => handleDelete(p.id),
                    className: "btn-error",
                  },
                }
              : {
                  Read: {
                    fn: () => navigate(`personalizations/${p.id}/reading`),
                    className: "btn-primary",
                  },
                };

          return (
            <Card
              key={p.id}
              obj={p}
              title={`Personalization ${i + 1}`}
              actions={actions}
            />
          );
        })}
      </section>
    </section>
  );
}
