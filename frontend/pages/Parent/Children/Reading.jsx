import { useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  createReadingProgress,
  updateReadingProgress,
  getPageById,
} from "../../../src/api";
import { useAuth } from "../../../src/AuthContext";
import PageObject from "../../../components/Books/PageObject";
import ChapterCards from "../../../components/Books/ChapterCards";

export default function Reading() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);
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
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token, childId, personalizationId, pageId]);

  async function handleNextPage() {

    await updateReadingProgress(
      progress.id,
      { current_page_id: nextPage.id },
      token,
    );
    const fetchedPage = await getPageById(nextPageId, token);
    setCurrentPage(fetchedPage);
    setProgress((prev) => ({ ...prev, current_page_id: nextPageId }));
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const layout = currentPage?.layout_data;

  return (
    <>
      <ChapterCards id={bookId} />
      <div className="relative w-[800px] h-[600px]">
        {["background", "middle", "foreground"].map((layerName) =>
          layout?.[layerName]?.map((obj) => (
            <PageObject key={obj.id} obj={obj} />
          )),
        )}
      </div>

      <div className="flex gap-4 mt-4">
        <button
          className="btn"
          disabled={!currentPage?.is_first_page}
        >
          ← Prev
        </button>
        <button
          className="btn btn-primary"
          onClick={() => handleNextPage()}
        >
          Next →
        </button>
      </div>
    </>
  );
}
