import { Link } from "react-router-dom";

export default function PersonalizationsCards({ personalizations, role }) {
  const actions =
    role === "parent" ? (
      <div className="actions">
        <>
          <button>Edit</button>
          <button>Delete</button>
        </>
      </div>
    ) : null;

    
  const PersonalizationsElements = personalizations.map((personalization) => (
    <div key={personalization.id} className="card">
      <Link
        to={
          role === "parent"
            ? `personalizations/${personalization.id}`
            : `reading_progress/${personalization.id}`
        }
        aria-label={`View details for Personalization for the Book:${personalization.id}`}
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
