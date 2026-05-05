// Konva Stage with 3 Layers
import { useRef, useState, useEffect } from "react";
import { Stage, Layer, Image, Text, Transformer } from "react-konva";
import useImage from "use-image";
import KonvaObjectEdit from "./KonvaObjectEdit";

export default function EditorCanvas({ page, onLayoutChange }) {
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

    const data = JSON.parse(e.dataTransfer.getData("application/json"));

    if (data.type !== "asset") return;

    const targetLayerRaw = data.layer ?? "foreground";

    const targetLayer = String(targetLayerRaw).trim().toLowerCase();

    const img = new window.Image();
    img.onload = () => {
      const newAsset = {
        id: crypto.randomUUID(),
        type: "image",
        src: data.file_url,
        x: 100,
        y: 100,
        width: img.width * 0.1,
        height: img.height * 0.1,
      };

      onLayoutChange({
        background: [...(layout.background ?? [])],
        middleground: [...(layout.middleground ?? [])],
        foreground: [...(layout.foreground ?? [])],
        [targetLayer]: [...(layout[targetLayer] ?? []), newAsset],
      });
    };

    img.src = data.file_url;
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
}
