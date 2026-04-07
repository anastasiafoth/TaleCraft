import { Link, NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../src/AuthContext";
import { addBook, deleteBook, updateBook } from "../../src/api";

export default function NewBook() {
  const { token } = useAuth();
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    recommended_age: "",
  });

  async function handleSave(form) {
    try {
      await addBook(form, token);
    } catch (err) {
      console.error("Failed to save:", err);
    }
  }

  return (
    <>
      <h1>New book</h1>
      <div className="card-body p-4 gap-2">
        <>
          <input
            type="text"
            value={editForm.title}
            onChange={(e) =>
              setEditForm({ ...editForm, title: e.target.value })
            }
            className="input input-bordered input-sm w-full"
            placeholder="Title"
          />
          <input
            type="text"
            value={editForm.description}
            onChange={(e) =>
              setEditForm({ ...editForm, description: e.target.value })
            }
            className="input input-bordered input-sm w-full"
            placeholder="Description"
          />
          <input
            type="text"
            value={editForm.recommended_age}
            onChange={(e) =>
              setEditForm({ ...editForm, recommended_age: e.target.value })
            }
            className="input input-bordered input-sm w-full"
            placeholder="0"
          />
          <button
            onClick={() => handleSave(editForm)}
            className="btn btn-sm btn-outline btn-primary"
          >
            Save
          </button>
        </>
      </div>
    </>
  );
}
