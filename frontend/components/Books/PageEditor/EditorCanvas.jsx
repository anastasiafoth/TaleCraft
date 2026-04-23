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

  return (
    <div className="bg-primary rounded-lg">
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
              />
            ))}
          </Layer>
        ))}
      </Stage>
    </div>
  );
}
