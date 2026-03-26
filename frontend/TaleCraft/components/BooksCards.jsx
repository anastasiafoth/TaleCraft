import { Link } from "react-router-dom";

export default function BooksCards({ books, actions = null }) {
  const BooksElements = books.map((book) => (
    <div key={book.id} className="card">
      <Link
        to={`/books/${book.id}`}
        aria-label={`View details for ${book.title}`}
        className="book-card"
      >
        <div>
          <img src={book.cover_url} width="300px" />
          <h2>{book.title}</h2>
          <p>{book.discription}</p>
          <div className="actions">{actions}</div>
        </div>
      </Link>
    </div>
  ));

  return (
    <div className="book-list">
      <section>{BooksElements}</section>
    </div>
  );
}
