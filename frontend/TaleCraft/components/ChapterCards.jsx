import Card from "./Card";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../src/AuthContext";
import {
  getChaptersByBook,
  deleteChapter,
} from "../src/api";

export default function ChapterCards() {
  const { user, token } = useAuth();
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id: bookId } = useParams();
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
    chapters?.length > 0 ? (
      chapters.map((chapter, i) => (
        <Card
          key={chapter.id}
          obj={chapter}
          title={
            <Link to={`/chapters/${chapter.id}`}>
              <h2 className="card-title text-lg font-bold hover:text-primary line-clamp-2">
                {`${i + 1}. ${chapter.title}`}
              </h2>
            </Link>
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
      ))
    ) : (
      <>
        <h1 className="text-lg font-bold">No chapters found.</h1>
        <Card
          title={
            <Link to="new" aria-label="Add new chapter">
              <h2 className="card-title text-lg font-bold hover:text-primary transition-colors line-clamp-2">
                Add new chapter
              </h2>
            </Link>
          }
        />
      </>
    );

  return (
    <section className="flex flex-col gap-4">
      <Card
        title={
          <Link to="new" aria-label="Add new chapter">
            <h2 className="card-title text-lg font-bold hover:text-primary transition-colors line-clamp-2">
              Add new chapter
            </h2>
          </Link>
        }
      />
      <section className="flex flex-col gap-4">{ChaptersElements}</section>
    </section>
  );
}
