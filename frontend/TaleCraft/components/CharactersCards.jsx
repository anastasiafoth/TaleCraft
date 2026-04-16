import CharactersAll from "./CharactersAll";
import Card from "./Card";
import { Link, useParams} from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../src/AuthContext";
import {
  getCharacterTemplates,
  deleteCharacterTemplate,
  updateCharacterTemplate,
} from "../src/api";

export default function CharactersCards() {
  const {  token } = useAuth();
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id: bookId } = useParams();

  useEffect(() => {
    getCharacterTemplates(bookId, token)
      .then(setCharacters)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [bookId]);

  if (loading) return <span className="loading loading-dots loading-md" />;
  if (error) return <p className="text-error">{error.message}</p>;

  async function handleDelete(char) {
    try {
      await deleteCharacterTemplate(char.id, token);

      setCharacters(
        (prev) => prev.filter((c) => c.id !== char.id), // ← .map → .filter
      );
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  }

  return (
    <>
      {characters && characters.length > 0 ? (
        <CharactersAll
          characters={characters}
          setCharacters={setCharacters}
          mode="template"
          onSave={(char) => updateCharacterTemplate(char.id, char, token)}
          onDelete={(char) => handleDelete(char.id, token)}
        />
      ) : (
        <>
          <h1 className="text-lg font-bold">No Characters found.</h1>
          <Card
            title={
              <Link to="new" aria-label="Add new chapter">
                <h2 className="card-title text-lg font-bold hover:text-primary transition-colors line-clamp-2">
                  Add new character template.
                </h2>
              </Link>
            }
          />
        </>
      )}
    </>
  );
}
