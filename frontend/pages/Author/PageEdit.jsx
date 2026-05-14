import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../src/AuthContext";
import { getPageById, addPage, updatePage, updateBook } from "../../src/api";
import EditorCanvas from "../../components/Books/PageEditor/EditorCanvas";
import PageEditorSidebar from "../../components/Books/PageEditor/PageEditorSidebar";

export default function PageEdit() {
  const { token } = useAuth();
  const [success, setSuccess] = useState(false);
  const [status, setStatus] = useState("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(null);
  const [editForm, setEditForm] = useState({
    layout_data: {
      background: [],
      middle: [],
      foreground: [],
    },
    is_cover: false,
  });

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

  const canvasRef = useRef(null);

  async function uploadCoverSnapshot(pageId) {
    const blob = await new Promise((resolve, reject) => {
      const stage = canvasRef.current;
      if (!stage) return reject(new Error("Stage not ready"));
      stage.toBlob({ mimeType: "image/png", callback: resolve });
    });

    console.log("blob:", blob);

    const res = await fetch(
      `https://character-proxy.anastasiafoth9.workers.dev/upload/pages/covers/${pageId}.png`,
      {
        method: "PUT",
        body: blob,
        headers: {
          "Content-Type": "image/png",
          Authorization: `Bearer ${import.meta.env.VITE_UPLOAD_SECRET}`,
        },
      },
    );

    const { url } = await res.json();
    return url;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setStatus("submitting");

    try {
      let savedPageId;

      if (page) {
        const patch = {};
        if (editForm.layout_data !== page.layout_data)
          patch.layout_data = editForm.layout_data;
        if (editForm.is_cover !== page.is_cover)
          patch.is_cover = editForm.is_cover;

        await updatePage(page.id, patch, token);
        savedPageId = page.id;
      } else {
        const newPage = await addPage(chapterId, editForm, token);
        savedPageId = newPage.id;
      }

      // If this is a cover page → snapshot + update book
      if (editForm.is_cover) {
        const coverUrl = await uploadCoverSnapshot(savedPageId);
        await updateBook(
          id,
          {
            // id = bookId from useParams
            cover_thumbnail_url: coverUrl,
          },
          token,
        );
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
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
          {
            id: Math.random().toString(36).substring(2, 9),
            key: Math.random().toString(36).substring(2, 9),
            type: "text",
            content: text,
            x: 100,
            y: 100,
          },
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
            ref={canvasRef}
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
