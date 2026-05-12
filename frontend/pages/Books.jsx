import BooksCards from "../components/Books/BooksCards";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getPublishedBooks } from "../src/api";

export default function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPublishedBooks()
      .then(setBooks)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-dots loading-5xl" />
      </div>
    );
  if (error) return <p className="text-error">{error.message}</p>;

  return (
    <section>
      <h1>All published books here</h1>
      <section>
        <BooksCards books={books} />
      </section>
    </section>
  );
}
