import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../src/AuthContext";
import { getPageById, addPage, updatePage } from "../../src/api";
import EditorCanvas from "../../components/Books/PageEditor/EditorCanvas";
import PageEditorSidebar from "../../components/Books/PageEditor/PageEditorSidebar";

export default function PageEdit() {
  const { token } = useAuth();
  const [success, setSuccess] = useState(false);
  const [status, setStatus] = useState("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(null);
  const navigate = useNavigate();

  const { id, chapterId, pageId } = useParams();

  useEffect(() => {
    if (!pageId) return;

    async function fetchPage() {
      try {
        setLoading(true);
        const fetchedPage = await getPageById(pageId);
        setPage(fetchedPage);
        setEditForm({
          layout_data: fetchedPage?.layout_data ?? {
            background: [],
            middle: [],
            foreground: [],
          },
          is_cover: fetchedPage?.is_cover ?? false,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPage();
  }, [pageId, token]);

  const [editForm, setEditForm] = useState({
    layout_data: {
      background: [],
      middle: [],
      foreground: [],
    },
    is_cover: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);
    setStatus("submitting");
    try {
      if (page) {
        // page patched
        const patch = {};
        if (editForm.layout_data !== page.layout_data)
          patch.layout_data = editForm.layout_data;
        if (editForm.is_cover !== page.is_cover)
          patch.is_cover = editForm.is_cover;

        await updatePage(page.id, patch, token);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      } else {
        // create new page
        const newPage = await addPage(chapterId, editForm, token);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setStatus("idle");
    }
  };

  function handleChange(e) {
    const { name, value, checked, type } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function onAddText(text) {
    setEditForm((prev) => ({
      ...prev,
      layout_data: {
        ...prev.layout_data,
        foreground: [
          ...(prev.layout_data?.foreground || []),
          { type: "text", content: text, x: 100, y: 100 },
        ],
      },
    }));
  }

  function onDragAsset(e, asset) {
    console.log("Dragging asset:", asset);
  }

  function onDragCharacter(e, char) {}

  return (
    <>
      {error && (
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-xl">Error: {error}</h2>
        </div>
      )}
      {loading && (
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-xl">Loading page info...</h2>
        </div>
      )}
      <Link
        to={`/author/books/${id}/chapters/${chapterId}/pages`}
        className="text-sm mt-2 underline cursor-pointer"
      >
        {" "}
        Go back to all Pages of this Chapter
      </Link>
      <form
        className="card-body p-4 gap-2 flex flex-col items-start"
        onSubmit={handleSubmit}
      >
        <h1>Page Editor:</h1>
        <section className="flex w-full h-150">
          <EditorCanvas
            page={{
              ...page,
              layout_data: editForm.layout_data || page?.layout_data,
            }}
            onLayoutChange={(newLayout) => {
              setEditForm((prev) => ({ ...prev, layout_data: newLayout }));
            }}
          />
          <PageEditorSidebar
            token={token}
            id={id}
            onAddText={onAddText}
            onDragAsset={onDragAsset}
            onDragCharacter={onDragCharacter}
          />
        </section>

        <h1>Cover Page</h1>
        <input
          type="checkbox"
          checked={editForm.is_cover || false}
          onChange={handleChange}
          name="is_cover"
        />

        <button disabled={status === "submitting"} className="btn btn-primary">
          {status === "submitting" ? "Saving..." : "Save"}
        </button>
      </form>

      {success && (
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-xl">Saved successfully!</h2>
        </div>
      )}
    </>
  );
}
