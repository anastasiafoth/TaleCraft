import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../src/AuthContext";
import {
  getPagesByChapter,
  getPageById,
  addPage,
  updatePage,
  deletePage,
} from "../../src/api";

export default function PageEdit() {
  const { token } = useAuth();
  const [success, setSuccess] = useState(false);
  const [status, setStatus] = useState("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(null);
  const [layoutForm, setLayoutForm] = useState({});
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
          layout_data: fetchedPage?.layout_data ?? "",
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
    layout_data: "",
    cover_page: false,
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
        navigate(`/author/books/${id}/chapters/${chapterId}/pages`);
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
        to={`/author/books/${id}/chapters`}
        className="text-sm mt-2 underline cursor-pointer"
      >
        {" "}
        Go back to all Chapters
      </Link>
      <form
        className="card-body p-4 gap-2 flex flex-col items-start"
        onSubmit={handleSubmit}
      >
        <h1>Page </h1>
        <input
          type="text"
          value={editForm.layout_data || ""}
          onChange={handleChange}
          className="input input-bordered input-sm w-full"
          placeholder="Layout data"
          name="layout_data"
        />
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
