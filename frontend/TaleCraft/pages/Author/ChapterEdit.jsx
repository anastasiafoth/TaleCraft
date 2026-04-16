import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../src/AuthContext";
import { getChapterById, addChapter, updateChapter } from "../../src/api";

export default function ChapterEdit() {
  const { token } = useAuth();
  const [success, setSuccess] = useState(false);
  const [status, setStatus] = useState("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chapter, setChapter] = useState(null);
  const navigate = useNavigate();

  const { id, chapterId } = useParams();

  useEffect(() => {
    if (!chapterId) return;

    async function fetchChapter() {
      try {
        setLoading(true);
        const fetchedChapter = await getChapterById(chapterId);
        console.log(fetchedChapter);
        setChapter(fetchedChapter);
        setEditForm({
          title: fetchedChapter?.title ?? "",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchChapter();
  }, [chapterId, token]);

  const [editForm, setEditForm] = useState({
    title: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);
    setStatus("submitting");
    try {
      if (chapter) {
        // chapter patched
        const patch = {};
        if (editForm.title !== chapter.title) patch.title = editForm.title;

        await updateChapter(chapter.id, patch, token);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
        navigate(`/author/books/${id}/chapters`);
      } else {
        // create new chapter
        const newChapter = await addChapter(id, editForm, token);
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
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
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
          <h2 className="text-xl">Loading chapter info...</h2>
        </div>
      )}
      <Link
        to={`/author/books/${id}/chapters`}
        className="text-sm mt-2 underline cursor-pointer"
      >
        {" "}
        Go back to all Chapters
      </Link>
      <form className="card-body p-4 gap-2" onSubmit={handleSubmit}>
        <h1>Title:</h1>
        <input
          type="text"
          value={editForm.title || ""}
          onChange={handleChange}
          className="input input-bordered input-sm w-full"
          placeholder="Title"
          name="title"
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
