import BooksCards from "../components/BooksCards";
import { useState, useEffect } from "react";
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

  if (loading) return <span className="loading loading-dots loading-md" />;
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
