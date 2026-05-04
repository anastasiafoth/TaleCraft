import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { getBookById } from "../src/api";
import { useAuth } from "../src/AuthContext";
import BookPreview from "../components/Books/BookPreview";

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
    <>
      <BookPreview book={book} />

      {/* Personalize button */}
      {user.role === "Parent" && (
        <div className="flex justify-center py-6 bg-base-100">
          <button
            className="btn btn-outline btn-wide"
            onClick={() =>
              navigate(`/parent/personalizations/new`, {
                state: { bookId: id },
              })
            }
          >
            Personalize this book
          </button>
        </div>
      )}

      <section>
        <div className="bg-base-100 px-8 pb-10 max-w-2xl mx-auto w-full">
          <div className="divider" />
          <h2 className="text-2xl font-bold mb-4">{book.title}</h2>
          <div className="space-y-2 text-base-content/80">
            <p>
              <span className="font-semibold">Author:</span> {book.author}
            </p>
            <p>
              <span className="font-semibold">Description:</span>{" "}
              {book.description}
            </p>
            <p>
              <span className="font-semibold">Recommended age:</span>{" "}
              {book.recommended_age}
            </p>
            <p>
              <span className="font-semibold">Total pages:</span>{" "}
              {book.total_pages}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
