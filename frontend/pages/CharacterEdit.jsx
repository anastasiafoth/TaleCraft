import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../src/AuthContext";
import {
  getPersonalizationCharacterById,
  updatePersonalizationCharacter,
  resetPersonalizationCharacter,
  getCharacterTemplateById,
  addCharacterTemplate,
  updateCharacterTemplate,
} from "../src/api";

import CharacterCanvas from "../components/Books/CharacterEditor/CharacterCanvas";
import CharacterEditorSidebar from "../components/Books/CharacterEditor/CharacterEditorSidebar";

const DEFAULT_COLORS = {
  main: "#f2c6a0",
  hair: "#3b2f2f",
};

const DEFAULT_PARTS = {
  hair: "/characters/hair/hair_long_1.png",
  head: "/characters/head/head_1.png",
  body: "/characters/body/body_standing_1.png",
  outfits: "/characters/outfits/outfit_dress_1.png",
  glasses: "/characters/glasses/glasses_1.png",
};

const ASSET_BASE = "https://character-proxy.anastasiafoth9.workers.dev";

function toProxyUrl(pathOrUrl) {
  try {
    const url = new URL(pathOrUrl);

    if (url.hostname.endsWith(".r2.dev")) {
      return `${ASSET_BASE}${url.pathname}${url.search}`;
    }

    return url.toString();
  } catch {
    return new URL(pathOrUrl, ASSET_BASE).toString();
  }
}

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
  const [activeLayer, setActiveLayer] = useState("hair");
  const [activeCategory, setActiveCategory] = useState("hair");

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

  function buildPatch() {
    const patch = {};

    if (user?.role === "Parent") {
      if (editForm.name !== character.name) patch.name = editForm.name;
      if (editForm.gender !== character.gender) patch.gender = editForm.gender;
      if (JSON.stringify(editForm.parts) !== JSON.stringify(character.parts))
        patch.parts = editForm.parts;
      if (JSON.stringify(editForm.colors) !== JSON.stringify(character.colors))
        patch.colors = editForm.colors;
    } else {
      if (editForm.role !== character.role) patch.role = editForm.role;
      if (editForm.name !== character.name) patch.name = editForm.name;
      if (editForm.gender !== character.gender) patch.gender = editForm.gender;
      if (JSON.stringify(editForm.parts) !== JSON.stringify(character.parts))
        patch.parts = editForm.parts;
      if (JSON.stringify(editForm.colors) !== JSON.stringify(character.colors))
        patch.colors = editForm.colors;
      if (editForm.customizable !== character.customizable)
        patch.customizable = editForm.customizable;
    }

    return patch;
  }

  async function uploadRenderedCharacter(characterId) {
    const blob = await canvasRef.current.exportToPng();
    const filename = `characters/rendered/${characterId}.png`;

    const res = await fetch(
      `https://character-proxy.anastasiafoth9.workers.dev/upload/${filename}`,
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

  const canvasRef = useRef(null);

  async function handleExportAndUpload() {
    setStatus("submitting");
    setError(null);

    try {
      if (character) {
        const patch = buildPatch();
        patch.rendered_url = await uploadRenderedCharacter(character.id);

        if (user?.role === "Parent") {
          await updatePersonalizationCharacter(character.id, patch, token);
        } else {
          await updateCharacterTemplate(character.id, patch, token);
        }
      } else {
        const newTemplate = await addCharacterTemplate(bookId, editForm, token);
        const renderedUrl = await uploadRenderedCharacter(newTemplate.id);

        await updateCharacterTemplate(
          newTemplate.id,
          { rendered_url: renderedUrl },
          token,
        );
        navigate(
          `/author/books/${bookId}/character_templates/${newTemplate.id}`,
        );
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setStatus("idle");
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-dots loading-5xl" />
      </div>
    );
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

      <form className="card-body p-4 gap-2 flex flex-row h-full">
        <section className="shrink-0">
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
                className="input input-bordered input-sm "
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
            className="input input-bordered input-sm "
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
          <CharacterEditorSidebar
            token={token}
            parts={editForm.parts}
            colors={editForm.colors}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            onPartChange={handlePartChange}
            onColorChange={handleColorChange}
            toProxyUrl={toProxyUrl}
          />
        </section>

        <section className="flex flex-col  border border-base-300 rounded-lg overflow-hidden">
          <h1>Character:</h1>
          <CharacterCanvas
            ref={canvasRef}
            token={token}
            parts={editForm.parts}
            colors={editForm.colors}
            onPartClick={(category) => setActiveCategory(category)}
            toProxyUrl={toProxyUrl}
          />
        </section>

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            disabled={status !== "idle"}
            className="btn btn-primary flex-1"
            onClick={handleExportAndUpload}
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
