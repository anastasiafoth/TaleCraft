import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

export default function PersonalizationsCards({ personalizations, role }) {
  const location = useLocation();
  

  const actions =
    role === "parent" ? (
      <div className="actions">
        <>
          <button>Edit</button>
          <button>Delete</button>
        </>
      </div>
    ) : null;

    // wenn noch kein reading progress, dann anzeigen "start reading" sonst "continue reading"

  const PersonalizationsElements = personalizations.map((personalization) => (
    <div key={personalization.id} className="card">
      <Link
        to={
          role === "parent"
            ? `${personalization.id}`
            : `${location.pathname}/personalizations/${personalization.id}/reading`
        }
        aria-label={`View details for Personalization for the Book:${personalization.book_id}`}
        className="personalization-card"
      >
        {
          <div>
            <h2>Book ID:{personalization.book_id}</h2>
            <p>Updated at: {personalization.updated_at}</p>
            {actions}
          </div>
        }
      </Link>
    </div>
  ));

  return (
    <div className="book-list">
      <section>{PersonalizationsElements}</section>
    </div>
  );
}

// <CharacterCards
//  characters={characters}
//   setCharacters={setCharacters}
//   mode="personalization"
//   onSave={(char) =>
//     updatePersonalizationCharacter(char.id, char, token)
//   }
//   onReset={(char) =>
//     resetPersonalizationCharacter(char.id, token)
//   }
// />