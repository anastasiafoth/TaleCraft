import BooksCards from "../Books/BooksCards";
import { getMyBooks } from "../../src/api";
import { useAuth } from "../../src/AuthContext";
import { useState, useEffect } from "react";

export default function AuthorBooks() {
  const { token } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMyBooks(token)
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
      <h1>All of your books here.</h1>
      <BooksCards
        books={books}
        role="Author"
        setBooks={setBooks}
      />
    </section>
  );
}
