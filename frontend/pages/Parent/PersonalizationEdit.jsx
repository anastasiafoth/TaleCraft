import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { createPersonalization, getPersonalizationById } from "../../src/api";
import { useAuth } from "../../src/AuthContext";
import CharactersCards from "../../components/CharactersCards";

export default function PersonalizationEdit() {
  const { token } = useAuth();
  const { personalizationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const bookId = location.state?.bookId;

  const [personalization, setPersonalization] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchOrCreatePersonalization() {
      try {
        setLoading(true);

        if (personalizationId) {
          const fetched = await getPersonalizationById(
            personalizationId,
            token,
          );
          setPersonalization(fetched);
        } else {
          const created = await createPersonalization(bookId, token);
          navigate(`/parent/personalizations/${created.id}`, { replace: true });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchOrCreatePersonalization();
  }, [bookId, personalizationId, token]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-dots loading-5xl" />
      </div>
    );
  if (error) return <p>Error: {error}</p>;

  return (
    <section className="flex flex-col gap-4">
      <Link
        to="/parent/personalizations"
        className="text-sm mt-2 underline cursor-pointer"
      >
        {" "}
        Go back to all Personalizations
      </Link>
      <CharactersCards personalizationId={personalizationId} />
    </section>
  );
}
