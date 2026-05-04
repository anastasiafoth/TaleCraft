import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../src/AuthContext";
import {
  getPersonalizationCharacterById,
  updatePersonalizationCharacter,
  resetPersonalizationCharacter,
  getCharacterTemplateById,
  addCharacterTemplate,
  updateCharacterTemplate,
} from "../src/api";

const DEFAULT_COLORS = {
  main: "#f2c6a0",
  hair: "#3b2f2f",
};

const DEFAULT_PARTS = {
  head: "head_1",
  hair: "hair_long",
  torso: "shirt_basic",
  legs: "pants_blue",
  glasses: null,
};

export default function CharacterEdit() {
  const { user, token } = useAuth();
  const [success, setSuccess] = useState(false);
  const [status, setStatus] = useState("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [character, setCharacter] = useState(null);
  const navigate = useNavigate();
  const {
    id: bookId,
    templateId,
    personalizationId,
    characterId,
  } = useParams();

  const [editForm, setEditForm] = useState(
    user.role === "Parent"
      ? {
          name: "",
          gender: "",
          parts: DEFAULT_PARTS,
          colors: DEFAULT_COLORS,
        }
      : {
          role: "",
          name: "",
          gender: "",
          parts: DEFAULT_PARTS,
          colors: DEFAULT_COLORS,
          customizable: true,
        },
  );

  useEffect(() => {
    if (!token) return;

    async function fetchCharacter() {
      try {
        setLoading(true);

        let fetched;

        if (user?.role === "Parent") {
          fetched = await getPersonalizationCharacterById(characterId, token);

          setEditForm({
            name: fetched?.name ?? "",
            gender: fetched?.gender ?? "",
            parts: fetched?.parts ?? DEFAULT_PARTS,
            colors: fetched?.colors ?? DEFAULT_COLORS,
          });
        } else {
          if (templateId) {
            fetched = await getCharacterTemplateById(templateId, token);

            setEditForm({
              role: fetched?.role ?? "",
              name: fetched?.name ?? "",
              gender: fetched?.gender ?? "",
              parts: fetched?.parts ?? DEFAULT_PARTS,
              colors: fetched?.colors ?? DEFAULT_COLORS,
              customizable: fetched?.customizable ?? true,
            });
          }
        }

        setCharacter(fetched);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCharacter();
  }, [characterId, templateId, token, user?.role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setStatus("submitting");

    try {
      const patch = {};

      if (character) {
        if (user?.role === "Parent") {
          if (editForm.name !== character.name) patch.name = editForm.name;

          if (editForm.gender !== character.gender)
            patch.gender = editForm.gender;

          if (
            JSON.stringify(editForm.parts) !== JSON.stringify(character.parts)
          )
            patch.parts = editForm.parts;

          if (
            JSON.stringify(editForm.colors) !== JSON.stringify(character.colors)
          )
            patch.colors = editForm.colors;

          await updatePersonalizationCharacter(character.id, patch, token);

          navigate(`/parent/personalizations/${personalizationId}`);
        } else {
          if (editForm.role !== character.role) patch.role = editForm.role;

          if (editForm.name !== character.name) patch.name = editForm.name;

          if (editForm.gender !== character.gender)
            patch.gender = editForm.gender;

          if (
            JSON.stringify(editForm.parts) !== JSON.stringify(character.parts)
          )
            patch.parts = editForm.parts;

          if (
            JSON.stringify(editForm.colors) !== JSON.stringify(character.colors)
          )
            patch.colors = editForm.colors;

          if (editForm.customizable !== character.customizable)
            patch.customizable = editForm.customizable;

          await updateCharacterTemplate(character.id, patch, token);

          navigate(`/author/books/${bookId}/character_templates`);
        }
      } else {
        console.log(editForm);
        const newTemplate = await addCharacterTemplate(bookId, editForm, token);
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
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleColorChange(key, value) {
    setEditForm((prev) => ({
      ...prev,
      colors: { ...prev.colors, [key]: value },
    }));
  }

  function handlePartChange(key, value) {
    setEditForm((prev) => ({
      ...prev,
      parts: { ...prev.parts, [key]: value || null },
    }));
  }

  async function handleReset() {
    try {
      setLoading(true);
      setStatus("resetting");

      const data = await resetPersonalizationCharacter(characterId, token);

      setEditForm({
        name: data?.name ?? "",
        gender: data?.gender ?? "",
        parts: data?.parts ?? DEFAULT_PARTS,
        colors: data?.colors ?? DEFAULT_COLORS,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setStatus("idle");
    }
  }

  if (loading) return <p>Loading character info...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      {user.role === "Parent" ? (
        <Link
          to={
            user.role === "Parent"
              ? `/parent/personalizations/${personalizationId}`
              : `/author/books/${bookId}/character_templates`
          }
          className="text-sm mt-2 underline cursor-pointer"
        >
          Go back to all Characters
        </Link>
      ) : (
        <Link
          to={`/author/books/${bookId}/character_templates`}
          className="text-sm mt-2 underline cursor-pointer"
        >
          Go back to all Characters
        </Link>
      )}

      <form className="card-body p-4 gap-2" onSubmit={handleSubmit}>
        {user.role === "Parent" ? (
          <h1>Role: {character?.role}</h1>
        ) : (
          <>
            <h1>Role:</h1>
            <input
              type="text"
              name="role"
              value={editForm.role}
              onChange={handleChange}
              className="input input-bordered input-sm w-full"
              placeholder="e.g. protagonist"
            />
          </>
        )}

        <h1>Name:</h1>
        <input
          type="text"
          name="name"
          value={editForm.name}
          onChange={handleChange}
          className="input input-bordered input-sm w-full"
          placeholder="Name"
        />

        <h1>Gender:</h1>
        <div className="flex gap-4">
          <label>
            <input
              type="radio"
              name="gender"
              value="female"
              checked={editForm.gender === "female"}
              onChange={handleChange}
            />{" "}
            Female
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="male"
              checked={editForm.gender === "male"}
              onChange={handleChange}
            />{" "}
            Male
          </label>
        </div>

        <h1>Colors:</h1>
        <label>Skin / Main Color:</label>
        <input
          type="color"
          value={editForm.colors.main}
          onChange={(e) => handleColorChange("main", e.target.value)}
          className="input input-bordered input-sm"
        />
        <label>Hair Color:</label>
        <input
          type="color"
          value={editForm.colors.hair}
          onChange={(e) => handleColorChange("hair", e.target.value)}
          className="input input-bordered input-sm"
        />

        <h1>Parts:</h1>
        {Object.entries(editForm.parts).map(([key, value]) => (
          <div key={key}>
            <label className="capitalize">{key}:</label>
            <input
              type="text"
              value={value ?? ""}
              onChange={(e) => handlePartChange(key, e.target.value)}
              className="input input-bordered input-sm w-full"
              placeholder={`e.g. ${key}_1`}
            />
          </div>
        ))}

        {user.role === "Author" && (
          <label className="flex gap-2 items-center">
            Customizable:
            <input
              type="checkbox"
              name="customizable"
              checked={editForm.customizable}
              onChange={handleChange}
            />
          </label>
        )}

        <div className="flex gap-2 mt-4">
          <button
            disabled={status !== "idle"}
            className="btn btn-primary flex-1"
          >
            {status == "submitting" ? "Saving..." : "Save"}
          </button>
          {user.role === "Parent" && (
            <button
              type="button"
              disabled={status !== "idle"}
              onClick={handleReset}
              className="btn btn-outline flex-1"
            >
              {status == "resetting" ? "Resetting..." : "Reset to default"}
            </button>
          )}
        </div>
      </form>

      {success && (
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-xl">Saved successfully!</h2>
        </div>
      )}
    </>
  );
}
