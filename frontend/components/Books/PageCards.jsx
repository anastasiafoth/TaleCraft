import Card from "../Card";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../src/AuthContext";
import {
  getPagesByChapter,
  deletePage,
} from "../../src/api";

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

  if (loading) return <span className="loading loading-dots loading-md" />;
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
    pages?.length > 0 ? (
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
                    className: "btn-warning",
                  },
                }
              : null
          }
        />
      ))
    ) : (
      <>
        <h1 className="text-lg font-bold">No Pages found.</h1>
        <Card
          title={
            <Link to="new" aria-label="Add new page">
              <h2 className="card-title text-lg font-bold hover:text-primary transition-colors line-clamp-2">
                Add new Page
              </h2>
            </Link>
          }
        />
      </>
    );

  return (
    <section className="flex flex-col gap-4">
      <Link
        to={`/author/books/${id}/chapters`}
        className="text-sm mt-2 underline cursor-pointer"
      >
        {" "}
        Go back to all Chapters
      </Link>
      <section className="flex flex-col gap-4">{PagesElements}</section>
    </section>
  );
}
