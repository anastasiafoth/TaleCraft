import { Link } from "react-router-dom";
import { deleteBook, updateBook } from "../src/api";
import { useState, useEffect } from "react";

export default function BooksCards({ books, role = null, setBooks, token }) {
  const [published, setPublished] = useState(false);
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
        <div
          key={book.id}
          className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow duration-300 rounded-2xl overflow-hidden w-64"
        >
          <figure>
            <img
              src={book.cover_thumbnail_url}
              alt={`Cover of ${book.title}`}
              className="w-full h-48 object-cover"
            />
          </figure>

          <div className="card-body p-4 gap-2">
            <Link
              to={`/books/${book.id}`}
              aria-label={`View details for ${book.title}`}
            >
              <h2 className="card-title text-lg font-bold hover:text-primary transition-colors line-clamp-2">
                {book.title}
              </h2>
            </Link>
            <p className="text-sm text-base-content/60 line-clamp-3">
              {book.discription}
            </p>
            <p className="text-sm text-base-content/60">
              Recommended Age: {book.recommended_age}
            </p>
            {role === "Author" && (
              <div className="card-actions justify-end mt-3 gap-2">
                <button>{book.is_published ? "Unpublish" : "Publish"}</button>
                <button>Edit</button>
                <button onClick={() => handleDelete(book, token)}>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      ))
    ) : (
      <h1 className="text-lg font-bold">No books found.</h1>
    );

  return (
    <div className="p-6">
      <section className="flex flex-wrap gap-6 justify-start">
        {BooksElements}
      </section>
    </div>
  );
}
