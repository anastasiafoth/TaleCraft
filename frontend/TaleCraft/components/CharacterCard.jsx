export default function CharacterCard({
  character,
  onChange,
  onSave,
  onDelete,
  onReset,
  mode,
}) {
  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    onChange({
      ...character,
      [name]: type === "checkbox" ? checked : value,
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* NAME */}
      <div className="flex gap-2 items-center">
        <span>Name:</span>
        <input
          name="name"
          value={character.name || ""}
          onChange={handleChange}
          className="input input-bordered input-sm"
        />
      </div>

      {/* GENDER */}
      <div className="flex gap-4">
        <label>
          <input
            type="radio"
            name="gender"
            value="girl"
            checked={character.gender === "girl"}
            onChange={handleChange}
          />
          Girl
        </label>

        <label>
          <input
            type="radio"
            name="gender"
            value="boy"
            checked={character.gender === "boy"}
            onChange={handleChange}
          />
          Boy
        </label>
      </div>

      {/* COLORS */}
      <ColorPicker
        label="Main Color"
        value={character.main_color}
        onChange={(val) => onChange({ ...character, main_color: val })}
      />

      <ColorPicker
        label="Hair Color"
        value={character.hair_color}
        onChange={(val) => onChange({ ...character, hair_color: val })}
      />

      {/* GLASSES */}
      <label className="flex gap-2 items-center">
        Glasses:
        <input
          type="checkbox"
          name="glasses"
          checked={character.glasses || false}
          onChange={handleChange}
        />
      </label>

      {/* ACTIONS */}
      <div className="flex gap-2 mt-4">
        <button onClick={onSave} className="btn btn-primary">
          Save
        </button>

        {mode === "template" && onDelete && (
          <button onClick={onDelete} className="btn btn-warning">
            Delete
          </button>
        )}

        {mode === "personalization" && onReset && (
          <button onClick={onReset} className="btn btn-outline">
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
