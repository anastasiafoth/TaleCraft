import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { getBookById } from "../src/api";
import { useAuth } from "../src/AuthContext";

export default function BookDetail() {
  const { user, token } = useAuth();
  const { id } = useParams();
  const [book, setBook] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) navigate("/login", { state: { from: location.pathname } });
  }, [user]);

  useEffect(() => {
    getBookById(id, token)
      .then(setBook)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <span className="loading loading-dots loading-md" />;
  if (error) return <p className="text-error">{error.message}</p>;

  return (
    <section>
      <h1>Book PREVIEW</h1>
      {/* only cover picture for now, later a few pages of the book  */}
      <img src={book.cover_page_thumbnail} alt={`Cover of ${book.title}`} />
      <section>
        <h2>Book Details:</h2>
        <h1>{book.title}</h1>
        <h4>
          <span>Author: </span>
          {book.author}
        </h4>
        <h3>
          <span>Description:</span> {book.description}
        </h3>
        <h3>
          <span>Recommended age:</span> {book.recommended_age}
        </h3>
        <h3>
          <span>Total pages:</span> {book.total_pages}
        </h3>
      </section>
    </section>
  );
}
