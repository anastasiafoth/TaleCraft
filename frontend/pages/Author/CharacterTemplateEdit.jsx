import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../src/AuthContext";
import {
  getCharacterTemplateById,
  addCharacterTemplate,
  updateCharacterTemplate,
} from "../../src/api";

export default function CharacterTemplateEdit() {
  const { token } = useAuth();
  const [success, setSuccess] = useState(false);
  const [status, setStatus] = useState("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [character, setCharacter] = useState(null);
  const navigate = useNavigate();

  const [editForm, setEditForm] = useState({
    role: "",
    default_name: "",
    default_gender: "",
    default_main_color: "",
    default_hair_color: "",
    default_clothing: "",
    default_glasses: false,
    extra_attributes: "",
    customizable: false,
  });

  const { id: bookId, templateId } = useParams();

  useEffect(() => {
    if (!templateId) return;

    async function fetchTemplate() {
      try {
        setLoading(true);
        const fetchedTemplate = await getCharacterTemplateById(
          templateId,
          token,
        );
        setCharacter(fetchedTemplate);
        setEditForm({
          role: fetchedTemplate?.role ?? "",
          default_name: fetchedTemplate?.default_name ?? "",
          default_gender: fetchedTemplate?.default_gender ?? "",
          default_main_color: fetchedTemplate?.default_main_color ?? "",
          default_hair_color: fetchedTemplate?.default_hair_color ?? "",
          default_clothing: fetchedTemplate?.default_clothing ?? "",
          default_glasses: fetchedTemplate?.default_glasses ?? false,
          extra_attributes: fetchedTemplate?.extra_attributes ?? "",
          customizable: fetchedTemplate?.customizable ?? false,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTemplate();
  }, [bookId, templateId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);
    setStatus("submitting");
    try {
      if (character) {
        // template patched
        const patch = {};
        if (editForm.role !== character.role) patch.role = editForm.role;
        if (editForm.default_name !== character.default_name)
          patch.default_name = editForm.default_name;
        if (editForm.default_gender !== character.default_gender)
          patch.default_gender = editForm.default_gender;
        if (editForm.default_main_color !== character.default_main_color)
          patch.default_main_color = editForm.default_main_color;
        if (editForm.default_hair_color !== character.default_hair_color)
          patch.default_hair_color = editForm.default_hair_color;
        if (editForm.default_clothing !== character.default_clothing)
          patch.default_clothing = editForm.default_clothing;
        if (editForm.default_glasses !== character.default_glasses)
          patch.default_glasses = editForm.default_glasses;
        if (editForm.extra_attributes !== character.extra_attributes)
          patch.extra_attributes = editForm.extra_attributes;
        if (editForm.customizable !== character.customizable)
          patch.customizable = editForm.customizable;

        await updateCharacterTemplate(character.id, patch, token);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
        navigate(`/author/books/${bookId}/character_templates`);
      } else {
        // create new template
        const newTemplate = await addCharacterTemplate(bookId, editForm, token);
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
    const { name, value, type, checked } = e.target;
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
          <h2 className="text-xl">Loading character info...</h2>
        </div>
      )}

      <Link
        to={`/author/books/${bookId}/character_templates`}
        className="text-sm mt-2 underline cursor-pointer"
      >
        Go back to all Characters
      </Link>

      <form className="card-body p-4 gap-2" onSubmit={handleSubmit}>
        <h1>Role:</h1>
        <input
          type="text"
          name="role"
          value={editForm.role}
          onChange={handleChange}
          className="input input-bordered input-sm w-full"
          placeholder="e.g. protagonist"
        />

        <h1>Name:</h1>
        <input
          type="text"
          name="default_name"
          value={editForm.default_name}
          onChange={handleChange}
          className="input input-bordered input-sm w-full"
          placeholder="Default name"
        />

        <h1>Gender:</h1>
        <div className="flex gap-4">
          <label>
            <input
              type="radio"
              name="default_gender"
              value="girl"
              checked={editForm.default_gender === "girl"}
              onChange={handleChange}
            />{" "}
            Girl
          </label>
          <label>
            <input
              type="radio"
              name="default_gender"
              value="boy"
              checked={editForm.default_gender === "boy"}
              onChange={handleChange}
            />{" "}
            Boy
          </label>
        </div>

        <h1>Main Color:</h1>
        <input
          type="color"
          name="main_color"
          value={editForm.main_color || "#000000"}
          onChange={handleChange}
          className="input input-bordered input-sm"
        />

        <h1>Hair Color:</h1>
        <input
          type="color"
          name="hair_color"
          value={editForm.hair_color || "#000000"}
          onChange={handleChange}
          className="input input-bordered input-sm"
        />

        <h1>Clothing:</h1>
        <input
          type="text"
          name="default_clothing"
          value={editForm.default_clothing}
          onChange={handleChange}
          className="input input-bordered input-sm w-full"
          placeholder="e.g. blue dress"
        />

        <label className="flex gap-2 items-center">
          Glasses:
          <input
            type="checkbox"
            name="default_glasses"
            checked={editForm.default_glasses}
            onChange={handleChange}
          />
        </label>

        <h1>Extra Attributes:</h1>
        <input
          type="text"
          name="extra_attributes"
          value={editForm.extra_attributes}
          onChange={handleChange}
          className="input input-bordered input-sm w-full"
          placeholder="Any extra attributes"
        />

        <label className="flex gap-2 items-center">
          Customizable:
          <input
            type="checkbox"
            name="customizable"
            checked={editForm.customizable}
            onChange={handleChange}
          />
        </label>

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
