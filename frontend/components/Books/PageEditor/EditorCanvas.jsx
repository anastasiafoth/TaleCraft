// Konva Stage with 3 Layers
import { useRef, useState, useEffect } from "react";
import { Stage, Layer, Image, Text, Transformer } from "react-konva";
import useImage from "use-image";
import KonvaObjectEdit from "./KonvaObjectEdit";

export default function EditorCanvas({ page, onLayoutChange }) {
  const [selectedId, setSelectedId] = useState(null);
  const layout = page?.layout_data;

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
    if (data.type === "asset") {
      const img = new window.Image();
      img.onload = () => {
        const newAsset = {
          id: data.object_key,
          type: "image",
          src: data.file_url,
          x: 100,
          y: 100,
          width: img.width * 0.1,
          height: img.height * 0.1,
        };

        const targetLayer = data.layer || "foreground";

        onLayoutChange({
          ...layout,
          [targetLayer]: [...(layout?.[targetLayer] || []), newAsset],
        });
      };

      img.src = data.file_url;
    }
  }

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (!selectedId) return;

        const newLayout = {};
        for (const layer of ["background", "middle", "foreground"]) {
          newLayout[layer] = (layout[layer] || []).filter(
            (obj) => obj.id !== selectedId,
          );
        }

        onLayoutChange(newLayout);
        setSelectedId(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, layout]);

  function handleDeleteObject(e) {}
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
        {["background", "middle", "foreground"].map((layerName) => (
          <Layer key={layerName} name={layerName}>
            {layout?.[layerName]?.map((obj) => (
              <KonvaObjectEdit
                key={obj.id}
                obj={obj}
                isSelected={selectedId === obj.id}
                onSelect={() => setSelectedId(obj.id)}
                onChange={(updated) => handleChange(layerName, updated)}
                onDelete={handleDeleteObject}
              />
            ))}
          </Layer>
        ))}
      </Stage>
    </div>
  );
}
