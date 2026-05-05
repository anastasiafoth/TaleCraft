import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../src/AuthContext";
import { editChild, deleteChild } from "../../src/api";
import Card from "../Card";

export default function ChildrenCards({ children, setChildren }) {
  const { token } = useAuth();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    first_name: "",
    birthdate: "",
    profile_img: "",
  });

  function getAge(birthdate) {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    if (age < 0) {
      return null;
    }
    return age;
  }

  function handleEditClick(child) {
    setEditingId(child.child_id);
    setEditForm({
      first_name: child.first_name,
      birthdate: new Date(child.birthdate).toISOString().split("T")[0],
    });
  }

  async function handleSave(id) {
    try {
      await editChild(id, editForm, token);

      setChildren((prev) =>
        prev.map((child) =>
          child.child_id === id ? { ...child, ...editForm } : child,
        ),
      );

      setEditingId(null);
    } catch (err) {
      console.error("Failed to save:", err);
    }
  }

  async function handleDelete(child) {
    try {
      await deleteChild(child.child_id, token);

      setChildren(
        (prev) => prev.filter((c) => c.child_id !== child.child_id), // ← .map → .filter
      );
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  }

  const ChildrenElements =
    children?.length > 0 &&
    children.map((child) => {
      const isEditing = editingId === child.child_id;

      return (
        <div
          key={child.child_id}
          className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow duration-300 rounded-2xl overflow-hidden w-full"
        >
          <figure className="relative">
            <img
              src={child.profile_img || null}
              alt={`Profile picture of ${child.first_name}`}
              className="w-full h-48 object-cover"
            />
          </figure>

          <div className="card-body p-4 gap-2">
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={editForm.first_name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, first_name: e.target.value })
                  }
                  className="input input-bordered input-sm w-full"
                  placeholder="Name"
                />
                <input
                  type="date"
                  value={editForm.birthdate}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    setEditForm({ ...editForm, birthdate: e.target.value })
                  }
                  className="input input-bordered input-sm w-full"
                />
              </>
            ) : (
              <>
                <Link
                  to={`children/${child.child_id}`}
                  aria-label={`Show ${child.first_name} dashboard`}
                >
                  <h2 className="card-title text-lg font-bold hover:text-primary transition-colors">
                    {child.first_name}
                  </h2>
                </Link>
                <p className="text-sm text-base-content/60">
                  Age: {getAge(child.birthdate)}
                </p>
              </>
            )}

            <div className="card-actions justify-end mt-3 gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => handleSave(child.child_id)}
                    className="btn btn-sm btn-primary"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="btn btn-sm btn-ghost"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleEditClick(child)}
                    className="btn btn-sm btn-primary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(child)}
                    className="btn btn-sm btn-error"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      );
    });

  return (
    <section className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
      <Card
        title={
          <Link to="children/new" aria-label="Add new book">
            <h2 className="card-title text-lg font-bold hover:text-primary transition-colors line-clamp-2">
              Add new child profile
            </h2>
          </Link>
        }
      />
      {ChildrenElements}
    </section>
  );
}
