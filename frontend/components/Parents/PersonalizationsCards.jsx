import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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

  const PersonalizationsElements =
    personalizations?.length > 0 ? (
      personalizations.map((p, i) => (
        <Card
          key={p.id}
          obj={p}
          img={{
            src: p.book.cover_thumbnail_url,
            alt: `Cover of ${p.book.title}`,
          }}
          title={`Personalization of "${p.book.title}"`}
          actions={
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
                }
          }
        />
      ))
    ) : (
      <>
        <h1 className="text-lg font-bold">No Personalization found.</h1>
        <Card
          title={
            <Link
              to="/books"
              aria-label="Add new personalization"
            >
              <h2 className="card-title text-lg font-bold hover:text-primary transition-colors line-clamp-2">
                Add new Personalization
              </h2>
            </Link>
          }
        />
      </>
    );

  return (
    <section>
      <section className="flex flex-col gap-4">
        <Card
          title={
            <Link
              to="/books"
              aria-label="Add new personalization"
            >
              <h2 className="card-title text-lg font-bold hover:text-primary transition-colors line-clamp-2">
                Add new Personalization
              </h2>
            </Link>
          }
        />
        {PersonalizationsElements}
      </section>
    </section>
  );
}
