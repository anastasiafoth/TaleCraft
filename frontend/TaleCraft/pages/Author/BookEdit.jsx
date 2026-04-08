import { useLocation } from "react-router-dom";
import { useState } from "react";
import { addBook, updateBook } from "../../src/api";
import { useAuth } from "../../src/AuthContext";
import BookEditNavbar from "../../components/BookEditNavbar";

export default function BookEdit() {
  const { token } = useAuth();
  const { state } = useLocation();
  const [success, setSuccess] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [newBook, setNewBook] = useState(null);

  const book = state?.book;

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
        setNewBook?.(newBook);
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
      <BookEditNavbar newBook={newBook} />
      <form className="card-body p-4 gap-2" onSubmit={handleSubmit}>
        <h1>Title:</h1>
        <input
          type="text"
          value={book ? book.title : editForm.title}
          onChange={handleChange}
          className="input input-bordered input-sm w-full"
          placeholder="Title"
          name="title"
        />
        <h1>Description:</h1>
        <input
          type="text"
          value={book ? book.description : editForm.description}
          onChange={handleChange}
          className="input input-bordered input-sm w-full"
          placeholder="Description"
          name="description"
        />
        <h1>Recommended age:</h1>
        <input
          type="text"
          value={book ? book.recommended_age : editForm.recommended_age}
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
          <h2 className="text-xl font-bold">Saved successfully!</h2>
        </div>
      )}
    </>
  );
}
