import { Link, useNavigate, useLocation } from "react-router-dom";
import { deleteBook, updateBook } from "../../src/api";
import { useAuth } from "../../src/AuthContext";
import Card from "../Card";

export default function BooksCards({ books, role = null, setBooks }) {
  const { token } = useAuth();
  const navigate = useNavigate();

  async function handlePublish(book, token) {
    try {
      const patch = { is_published: !book.is_published };
      await updateBook(book.id, patch, token);

      setBooks((prev) =>
        prev.map((b) => (b.id === book.id ? { ...b, ...patch } : b)),
      );
    } catch (err) {
      console.error("Failed to publish:", err);
    }
  }

  async function handleDelete(book, token) {
    try {
      await deleteBook(book.id, token);

      setBooks(
        (prev) => prev.filter((b) => b.id !== book.id), // ← .map → .filter
      );
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  }

  const BooksElements =
    books?.length > 0 ? (
      books.map((book) => (
        <Card
          key={book.id}
          obj={book}
          img={{ src: book.cover_thumbnail_url, alt: `Cover of ${book.title}` }}
          title={
            <Link to={`/books/${book.id}`}>
              <h2 className="card-title text-lg font-bold hover:text-primary line-clamp-2">
                {book.title}
              </h2>
            </Link>
          }
          info={[book.description, `Recommended Age: ${book.recommended_age}`]}
          actions={
            role === "Author"
              ? {
                  [book.is_published ? "Unpublish" : "Publish"]: {
                    fn: (obj) => handlePublish(obj, token),
                    className: book.is_published ? "btn-ghost" : "btn-primary",
                  },
                  Edit: {
                    fn: (obj) => navigate(`books/${obj.id}/edit`),
                    className: "btn-secondary",
                  },
                  Delete: {
                    fn: (obj) => handleDelete(obj, token),
                    className: "btn-warning",
                  },
                }
              : role === "Parent"
                ? {
                    "Personalize this book ": {
                      fn: (obj) => navigate(`books/${obj.id}/edit`),
                      className: "btn-secondary",
                    },
                  }
                : null
          }
        />
      ))
    ) : (
      <h1 className="text-lg font-bold">No books found.</h1>
    );

  return (
    <div className="p-6">
      <section className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        {role !== null && (
          <Card
            title={
              <Link to="books/new" aria-label="Add new book">
                <h2 className="card-title text-lg font-bold hover:text-primary transition-colors line-clamp-2">
                  Add new book
                </h2>
              </Link>
            }
          />
        )}
        {BooksElements}
      </section>
    </div>
  );
}
