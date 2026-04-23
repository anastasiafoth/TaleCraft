import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../src/AuthContext";
import { getPagesByChapter } from "../../src/api";

export default function ChapterAccordion({ chapter, index, bookId }) {
  const [open, setOpen] = useState(false);
  const [pages, setPages] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { childId, personalizationId } = useParams();
  const navigate = useNavigate();

  async function handleToggle() {
    if (!open && pages === null) {
      // Lazy load – when open first time
      setLoading(true);
      try {
        const data = await getPagesByChapter(chapter.id);
        setPages(data);
      } finally {
        setLoading(false);
      }
    }
    setOpen((prev) => !prev);
  }

  return (
    <div className="border border-base-300 rounded-xl overflow-hidden mb-2">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-base-200"
        onClick={handleToggle}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs text-base-content/50">▶</span>
          <span className="text-xs bg-base-200 px-2 py-0.5 rounded">
            Chapter {index + 1}:
          </span>
          <span className="font-medium">{chapter.title}</span>
        </div>
        <span className="text-sm text-base-content/50">
          {chapter.page_count} pages
        </span>
      </div>

      {open && (
        <div className="border-t border-base-300">
          {loading && (
            <span className="loading loading-dots loading-sm ml-9 my-2" />
          )}

          {pages?.map((page, i) => (
            <div
              key={page.id}
              className="flex items-center justify-between pl-9 pr-4 py-2 border-b border-base-300 last:border-0 hover:bg-base-200 cursor-pointer"
              onClick={
                user.role === "Author"
                  ? () =>
                      navigate(
                        `/author/books/${bookId}/chapters/${chapter.id}/pages/${page.id}/edit`,
                      )
                  : () =>
                      navigate(
                        `/parent/children/${childId}/personalizations/${personalizationId}/reading`,
                        { state: { pageId: page.id } },
                      )
              }
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-base-content/30" />
                <span className="text-sm text-base-content/70">
                  Page {i + 1}
                </span>
                {page.is_cover && (
                  <span className="text-xs bg-info/10 text-info px-2 py-0.5 rounded">
                    Cover
                  </span>
                )}
              </div>
              <button className="text-xs border border-base-300 px-2 py-1 rounded hover:bg-base-300">
                Edit
              </button>
            </div>
          ))}

          {pages & (user.role === "Author") ? (
            <div
              className="flex items-center gap-2 pl-9 py-2 cursor-pointer hover:bg-base-200 text-base-content/50 text-sm"
              onClick={() =>
                navigate(
                  `/author/books/${bookId}/chapters/${chapter.id}/pages/new`,
                )
              }
            >
              <span>+</span>
              <span>Add page</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
