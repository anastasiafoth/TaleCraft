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
      const newAsset = {
        type: "image",
        src: data.file_url,
        x: e.clientX,
        y: e.clientY,
      };

      setEditForm((prev) => ({
        ...prev,
        layout_data: {
          ...prev.layout_data,
          foreground: [...(prev.layout_data.foreground || []), newAsset],
        },
      }));
    }
  }

  return (
    <div className="bg-primary rounded-l-lg">
      <Stage
        width={800}
        height={600}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) setSelectedId(null);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
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
              />
            ))}
          </Layer>
        ))}
      </Stage>
    </div>
  );
}
