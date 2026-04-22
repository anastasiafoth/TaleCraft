import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getPersonalizationById,
  getPersonalizationCharacters,
  getPersonalizationCharacterById,
  updatePersonalizationCharacter,
  resetPersonalizationCharacter,
} from "../../src/api";
import { useAuth } from "../../src/AuthContext";

export default function CharacterEdit() {
  const { token } = useAuth();
  const [success, setSuccess] = useState(false);
  const [status, setStatus] = useState("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [character, setCharacter] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    gender: "",
    main_color: "",
    hair_color: "",
    clothing: "",
    glasses: "",
    extra_attributes: "",
  });
  const navigate = useNavigate();
  const { personalizationId, characterId } = useParams();

  useEffect(() => {
    if (!characterId) return;

    async function fetchTemplate() {
      try {
        setLoading(true);
        const fetchedCharacter = await getPersonalizationCharacterById(
          characterId,
          token,
        );
        setCharacter(fetchedCharacter);
        setEditForm({
          name: fetchedCharacter?.name ?? "",
          gender: fetchedCharacter?.gender ?? "",
          main_color: fetchedCharacter?.main_color ?? "",
          hair_color: fetchedCharacter?.hair_color ?? "",
          clothing: fetchedCharacter?.clothing ?? "",
          glasses: fetchedCharacter?.glasses ?? false,
          extra_attributes: fetchedCharacter?.extra_attributes ?? "",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTemplate();
  }, [personalizationId, characterId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);
    setStatus("submitting");
    try {
      if (character) {
        // template patched
        const patch = {};
        if (editForm.name !== character.name) patch.name = editForm.name;
        if (editForm.gender !== character.gender)
          patch.gender = editForm.gender;
        if (editForm.main_color !== character.main_color)
          patch.main_color = editForm.main_color;
        if (editForm.hair_color !== character.hair_color)
          patch.hair_color = editForm.hair_color;
        if (editForm.clothing !== character.clothing)
          patch.clothing = editForm.clothing;
        if (editForm.glasses !== character.glasses)
          patch.glasses = editForm.glasses;
        if (editForm.extra_attributes !== character.extra_attributes)
          patch.extra_attributes = editForm.extra_attributes;

        await updatePersonalizationCharacter(character.id, patch, token);
        setSuccess(true);
        navigate(
          `/parent/personalizations/${personalizationId}/characters/${characterId}`,
        );
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
        to={`/parent/personalizations/${personalizationId}`}
        className="text-sm mt-2 underline cursor-pointer"
      >
        Go back to all Characters
      </Link>

      <form className="card-body p-4 gap-2" onSubmit={handleSubmit}>
        <h1>Role: {character?.role}</h1>

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
              value={editForm.gender}
              checked={editForm.gender === "girl"}
              onChange={handleChange}
            />{" "}
            Girl
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="boy"
              checked={editForm.gender === "boy"}
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
          name="clothing"
          value={editForm.clothing}
          onChange={handleChange}
          className="input input-bordered input-sm w-full"
          placeholder="e.g. blue dress"
        />

        <label className="flex gap-2 items-center">
          Glasses:
          <input
            type="checkbox"
            name="glasses"
            checked={editForm.glasses}
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
