import { useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  createReadingProgress,
  updateReadingProgress,
  getPageById,
  getPagesByBook,
} from "../../../src/api";
import { useAuth } from "../../../src/AuthContext";
import PageObject from "../../../components/Books/PageObject";
import ChapterCards from "../../../components/Books/ChapterCards";

export default function Reading() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);
  const [pages, setPages] = useState([]);
  const bookId = progress?.book_id;
  const location = useLocation();
  const pageId = location.state?.pageId;

  const { token } = useAuth();
  const { childId, personalizationId } = useParams();

  useEffect(() => {
    async function load() {
      try {
        const fetchedProgress = await createReadingProgress(
          { child_id: childId, personalization_id: personalizationId },
          token,
        );

        // if pageId from state, update progress
        if (pageId && pageId !== fetchedProgress.current_page_id) {
          await updateReadingProgress(
            fetchedProgress.id,
            { current_page_id: pageId },
            token,
          );
          setProgress({ ...fetchedProgress, current_page_id: pageId });
        } else {
          setProgress(fetchedProgress);
        }

        const fetchedPage = await getPageById(
          pageId ?? fetchedProgress.current_page_id,
          token,
        );
        setCurrentPage(fetchedPage);

        const fetchedPages = await getPagesByBook(fetchedProgress.book_id);
        setPages(fetchedPages);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token, childId, personalizationId, pageId]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-dots loading-5xl" />
      </div>
    );
  if (error) return <p>Error: {error.message}</p>;

  const layout = currentPage?.layout_data;

  const currentIndex = pages.findIndex((p) => p.id === currentPage?.id);

  const handleNavigate = async (page) => {
    await updateReadingProgress(
      progress.id,
      { current_page_id: page.id },
      token,
    );
    setCurrentPage(page);
    setProgress((prev) => ({ ...prev, current_page_id: page.id }));
  };

  return (
    <>
      <section className="flex">
        <ChapterCards id={bookId} mode="reading" />
        <div className="relative w-200 h-150 overflow-hidden bg-white">
          {["background", "middle", "foreground"].map((layerName) =>
            layout?.[layerName]?.map((obj) => (
              <PageObject key={obj.id} obj={obj} />
            )),
          )}
        </div>
      </section>

      <div className="flex gap-4 mt-4">
        <button
          className="btn"
          disabled={currentIndex <= 0}
          onClick={() => handleNavigate(pages[currentIndex - 1])}
        >
          ← Prev
        </button>
        <button
          className="btn btn-primary"
          disabled={currentIndex >= pages.length - 1}
          onClick={() => handleNavigate(pages[currentIndex + 1])}
        >
          Next →
        </button>
      </div>
    </>
  );
}
