import Card from "../Card";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../src/AuthContext";
import { getPagesByChapter, deletePage } from "../../src/api";

export default function PageCards() {
  const { user, token } = useAuth();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id, chapterId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    getPagesByChapter(chapterId)
      .then(setPages)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [chapterId]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-dots loading-5xl" />
      </div>
    );
  if (error) return <p className="text-error">{error.message}</p>;

  async function handleDelete(page) {
    try {
      await deletePage(page.id, token);

      setPages(
        (prev) => prev.filter((c) => c.id !== page.id), // ← .map → .filter
      );
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  }

  const PagesElements =
    pages?.length > 0 &&
    pages.map((page, i) => (
      <Card
        key={page.id}
        obj={page}
        title={
          <Link to={`/pages/${page.id}`}>
            <h2 className="card-title text-lg font-bold hover:text-primary line-clamp-2">
              {`Page ${i + 1}`}
            </h2>
          </Link>
        }
        actions={
          user.role === "Author"
            ? {
                Edit: {
                  fn: (obj) => navigate(`${obj.id}/edit`),
                  className: "btn-secondary",
                },
                Delete: {
                  fn: (obj) => handleDelete(obj, token),
                  className: "btn-error",
                },
              }
            : null
        }
      />
    ));

  return (
    <>
      <Link
        to={`/author/books/${id}/chapters`}
        className="text-sm mt-2 underline cursor-pointer"
      >
        {" "}
        Go back to all Chapters
      </Link>
      <section className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-8 lg:grid-cols-3 mt-4">
        <Card
          title={
            <Link to="new" aria-label="Add new page">
              <h2 className="card-title text-lg font-bold hover:text-primary transition-colors line-clamp-2">
                Add new Page
              </h2>
            </Link>
          }
        />
        {PagesElements}
      </section>
    </>
  );
}
