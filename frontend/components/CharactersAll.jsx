import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import CharacterCard from "./CharacterCard";

export default function AllCharacters({
  characters = null,
  setCharacters,
  mode, // "template" | "personalization"
  onSave,
  onDelete,
  onReset,
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  function updateCharacter(updated) {
    setCharacters((prev) =>
      prev.map((c, i) => (i === activeIndex ? updated : c)),
    );
  }

  return (
    <div className="flex gap-6">
      {/* LEFT */}
      <div className="flex-1 bg-base-200 p-4 rounded-xl">
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {characters.map((c, i) => (
            <button
              key={c.id || i}
              onClick={() => setActiveIndex(i)}
              className={`btn btn-sm ${i === activeIndex ? "btn-primary" : ""}`}
            >
              Character {i + 1}
            </button>
          ))}

          {mode === "template" && (
            <button
              className="btn btn-sm btn-outline"
              onClick={() =>
                setCharacters((prev) => [
                  ...prev,
                  {
                    name: "",
                    gender: "boy",
                    main_color: "",
                    hair_color: "",
                    clothing: "",
                    glasses: false,
                  },
                ])
              }
            >
              +
            </button>
          )}
        </div>

        {/* Active Card */}
        <CharacterCard
          character={characters[activeIndex]}
          onChange={updateCharacter}
          onSave={() => onSave(characters[activeIndex])}
          onDelete={() => onDelete?.(characters[activeIndex])}
          onReset={() => onReset?.(characters[activeIndex])}
          mode={mode}
        />
      </div>

      {/* RIGHT PREVIEW */}
      <div className="w-[400px] bg-base-300 flex items-center justify-center rounded-xl">
        <span className="text-3xl font-bold opacity-50">PREVIEW</span>
      </div>
    </div>
  );
}


