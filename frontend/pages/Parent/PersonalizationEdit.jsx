import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  createPersonalization,
  getPersonalizationById,
} from "../../src/api";
import { useAuth } from "../../src/AuthContext";
import CharactersCards from "../../components/CharactersCards";

export default function PersonalizationEdit() {
  const { token } = useAuth();
  const { personalizationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const bookId = location.state?.bookId;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function Personalization() {
      try {
        setLoading(true);
        let fetchedPersonalization;

        if (personalizationId) {
          // already exists → just fetch it
          fetchedPersonalization = await getPersonalizationById(
            personalizationId,
            token,
          );
        } else {
          // create new one
          fetchedPersonalization = await createPersonalization(bookId, token);
          navigate(`/parent/personalizations/${fetchedPersonalization.id}`);
          return;
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    Personalization();
  }, [bookId, personalizationId, token]);

  return (
    <section>
      <section className="flex flex-col gap-4">
        <h1>View Personalization no:{personalizationId} </h1>
        <CharactersCards />
      </section>
    </section>
  );
}
