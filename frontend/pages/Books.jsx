import BooksCards from "../components/Books/BooksCards";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getPublishedBooks } from "../src/api";

const heroBg =
  "https://pub-5c6211fe5e5e407fa14819f4ac3be544.r2.dev/main%20page/background.jpg";

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
      <div
        className="h-96 flex items-center justify-center hero-content flex-col lg:flex-row gap-10 bg-no-repeat bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <h1 className="text-3xl font-bold md:text-5xl">
          Choose the next adventure.
        </h1>
      </div>

      <section>
        <BooksCards books={books} />
      </section>
    </section>
  );
}
