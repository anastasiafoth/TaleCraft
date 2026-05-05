import Card from "../Card";
import ChapterAccordion from "./ChapterAccordion";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../src/AuthContext";
import { getChaptersByBook, deleteChapter } from "../../src/api";

export default function ChapterCards({ id }) {
  const { user, token } = useAuth();
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id: paramBookId } = useParams();
  const bookId = id ?? paramBookId;
  const navigate = useNavigate();

  useEffect(() => {
    getChaptersByBook(bookId)
      .then(setChapters)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [bookId]);

  if (loading) return <span className="loading loading-dots loading-md" />;
  if (error) return <p className="text-error">{error.message}</p>;

  async function handleDelete(chapter) {
    try {
      await deleteChapter(chapter.id, token);

      setChapters(
        (prev) => prev.filter((c) => c.id !== chapter.id), // ← .map → .filter
      );
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  }

  const ChaptersElements =
    chapters?.length > 0 &&
    chapters.map((chapter, i) => (
      <Card
        key={chapter.id}
        obj={chapter}
        title={
          <ChapterAccordion
            key={chapter.id}
            chapter={chapter}
            index={i}
            bookId={bookId}
          />
        }
        actions={
          user.role === "Author"
            ? {
                "Edit Chapter": {
                  fn: (obj) => navigate(`${obj.id}/edit`),
                  className: "btn-secondary",
                },
                "Edit Pages": {
                  fn: (obj) => navigate(`${obj.id}/pages`),
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
    ));

  return (
    <section className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
      {user.role === "Author" && (
        <Card
          title={
            <Link to="new" aria-label="Add new chapter">
              <h2 className="card-title text-lg font-bold hover:text-primary transition-colors line-clamp-2">
                Add new chapter
              </h2>
            </Link>
          }
        />
      )}
      {ChaptersElements}
    </section>
  );
}
