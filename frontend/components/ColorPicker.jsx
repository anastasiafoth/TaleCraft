function ColorPicker({ label, value, onChange }) {
  const colors = ["red", "blue", "green", "yellow", "black", "white"];

  return (
    <div>
      <p>{label}:</p>
      <div className="flex gap-2">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`w-6 h-6 rounded-full border ${
              value === c ? "ring-2 ring-black" : ""
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    </div>
  );
}
