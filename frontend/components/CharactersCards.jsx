import Card from "./Card";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../src/AuthContext";
import { getCharacterTemplates, deleteCharacterTemplate } from "../src/api";

export default function CharactersCards() {
  const { user, token } = useAuth();
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id: bookId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    getCharacterTemplates(bookId, token)
      .then(setCharacters)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [bookId, token]);

  if (loading) return <span className="loading loading-dots loading-md" />;
  if (error) return <p className="text-error">{error.message}</p>;

  async function handleDelete(character) {
    try {
      await deleteCharacterTemplate(character.id, token);
      setCharacters((prev) => prev.filter((c) => c.id !== character.id));
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  }

  const CharacterElements =
    characters?.length > 0 &&
    characters.map((character, i) => (
      <Card
        key={character.id}
        obj={character}
        title={
          <h2 className="card-title text-lg font-bold line-clamp-2">
            {character.default_name || `Character ${i + 1}`}
          </h2>
        }
        actions={
          user.role === "Author"
            ? {
                Edit: {
                  fn: (obj) => navigate(`${obj.id}`),
                  className: "btn-secondary",
                },
                Delete: {
                  fn: (obj) => handleDelete(obj),
                  className: "btn-warning",
                },
              }
            : null
        }
      />
    ));

  return (
    <section className="flex flex-col gap-4">
      <Card
        title={
          <Link to="new" aria-label="Add new character template">
            <h2 className="card-title text-lg font-bold hover:text-primary transition-colors line-clamp-2">
              Add new character template
            </h2>
          </Link>
        }
      />
      <section className="flex flex-col gap-4">{CharacterElements}</section>
    </section>
  );
}
