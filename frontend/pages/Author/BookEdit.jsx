import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { addBook, updateBook } from "../../src/api";
import { useAuth } from "../../src/AuthContext";
import { getBookById } from "../../src/api";

export default function BookEdit() {
  const { token } = useAuth();
  const [success, setSuccess] = useState(false);
  const [status, setStatus] = useState("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [book, setBook] = useState(null);
  const navigate = useNavigate();

  const { id } = useParams();

  useEffect(() => {
    if (id) {
      try {
        setLoading(true);
        getBookById(id, token).then((fetchedBook) => {
          setBook(fetchedBook);
          setEditForm({
            title: fetchedBook?.title ?? "",
            description: fetchedBook?.description ?? "",
            recommended_age: fetchedBook?.recommended_age ?? "",
          });
          setLoading(false);
        });
      } catch (err) {
        setError(err.message);
      }
    }
  }, [id]);

  const [editForm, setEditForm] = useState({
    title: book?.title ?? "",
    description: book?.description ?? "",
    recommended_age: book?.recommended_age ?? "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);
    setStatus("submitting");
    try {
      if (book) {
        // book patched
        const patch = {};
        if (editForm.title !== book.title) patch.title = editForm.title;
        if (editForm.description !== book.description)
          patch.description = editForm.description;
        if (editForm.recommended_age !== book.recommended_age)
          patch.recommended_age = editForm.recommended_age;

        await updateBook(book.id, patch, token);
        setSuccess(true);
      } else {
        // create new book
        console.log("sending:", editForm);
        const newBook = await addBook(editForm, token);
        navigate(`/author/books/${newBook.id}/edit`);
        setSuccess(true);
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
          <h2 className="text-xl">Loading book info...</h2>
        </div>
      )}
      <form className="card-body p-4 gap-2" onSubmit={handleSubmit}>
        <h1>Title:</h1>
        <input
          type="text"
          value={editForm.title}
          onChange={handleChange}
          className="input input-bordered input-sm w-full"
          placeholder="Title"
          name="title"
        />
        <h1>Description:</h1>
        <input
          type="text"
          value={editForm.description}
          onChange={handleChange}
          className="input input-bordered input-sm w-full"
          placeholder="Description"
          name="description"
        />
        <h1>Recommended age:</h1>
        <input
          type="text"
          value={editForm.recommended_age}
          onChange={handleChange}
          className="input input-bordered input-sm w-full"
          placeholder="0"
          name="recommended_age"
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
