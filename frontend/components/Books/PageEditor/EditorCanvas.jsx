// Konva Stage with 3 Layers
import { useState, forwardRef } from "react";
import { Stage, Layer } from "react-konva";
import KonvaObjectEdit from "./KonvaObjectEdit";
import { toProxyUrl } from "../../../src/utils/assets";

const EditorCanvas = forwardRef(function EditorCanvas(
  { page, onLayoutChange },
  ref,
) {
  const [selectedId, setSelectedId] = useState(null);
  const EMPTY_LAYOUT = { background: [], middleground: [], foreground: [] };
  const layout = page?.layout_data ?? EMPTY_LAYOUT;

  function handleChange(layerName, updatedObj) {
    const updatedLayout = {
      ...layout,
      [layerName]: layout[layerName].map((obj) =>
        obj.id === updatedObj.id ? updatedObj : obj,
      ),
    };
    onLayoutChange(updatedLayout);
  }

  function handleDrop(e) {
    e.preventDefault();

    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;

    const data = JSON.parse(raw);

    const targetLayer = String(data.layer ?? "foreground")
      .trim()
      .toLowerCase();

    const src = toProxyUrl(
      data.type === "character" ? data.rendered_url : data.file_url,
    );

    if (!src) return;

    const img = new window.Image();
    img.onload = () => {
      const isCharacter = data.type === "character";

      const newAsset = {
        id: crypto.randomUUID(),
        type: "image",
        kind: isCharacter ? "character" : "asset",
        src,
        updatedAt: isCharacter ? data.updated_at : null,
        x: 100,
        y: 100,
        width: isCharacter ? img.width * 0.35 : img.width * 0.1,
        height: isCharacter ? img.height * 0.35 : img.height * 0.1,
        characterId: isCharacter ? data.id : null,
        name: isCharacter ? data.name : null,
      };

      onLayoutChange({
        background: [...(layout.background ?? [])],
        middleground: [...(layout.middleground ?? [])],
        foreground: [...(layout.foreground ?? [])],
        [targetLayer]: [...(layout[targetLayer] ?? []), newAsset],
      });
    };

    img.src = src;
  }

  function handleDelete(layerName, id) {
    onLayoutChange({
      ...layout,
      [layerName]: layout[layerName].filter((obj) => obj.id !== id),
    });
    setSelectedId(null);
  }

  return (
    <div
      className="bg-white rounded-l-lg"
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={handleDrop}
    >
      <Stage
        ref={ref}
        width={800}
        height={600}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) setSelectedId(null);
        }}
      >
        {["background", "middleground", "foreground"].map((layerName) => (
          <Layer key={layerName} name={layerName}>
            {layout?.[layerName]?.map((obj) => (
              <KonvaObjectEdit
                key={obj.id}
                obj={obj}
                isSelected={selectedId === obj.id}
                onSelect={() => setSelectedId(obj.id)}
                onChange={(updated) => handleChange(layerName, updated)}
                onDelete={() => handleDelete(layerName, obj.id)}
              />
            ))}
          </Layer>
        ))}
      </Stage>
    </div>
  );
});

export default EditorCanvas;
