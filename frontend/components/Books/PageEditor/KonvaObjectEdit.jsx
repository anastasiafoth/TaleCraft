import { useRef, useEffect } from "react";
import { Image, Text, Transformer } from "react-konva";
import useImage from "use-image";
import { toProxyUrl } from "../../../src/utils/assets";

export default function KonvaObjectEdit({
  obj,
  isSelected,
  onSelect,
  onChange,
  onDelete,
}) {
  const src =
    obj.kind === "character" && obj.updatedAt
      ? `${obj.src}?t=${obj.updatedAt}`
      : obj.src;

  const imageSrc = obj.type === "image" ? toProxyUrl(obj.src) : null;
  const [image] = useImage(imageSrc, "anonymous");
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  useEffect(() => {
    if (!isSelected) return;

    function handleKeyDown(e) {
      console.log(document);
      const tag = document.activeElement?.tagName?.toLowerCase();
      const isEditable = document.activeElement?.isContentEditable;
      if (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        isEditable
      )
        return;

      if (e.key === "Delete" || e.key === "Backspace") {
        onDelete?.(); // neues Prop
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSelected]);

  const commonProps = {
    ref: shapeRef,
    x: obj.x,
    y: obj.y,
    width: obj.width,
    height: obj.height,
    rotation: obj.rotation,
    draggable: true,
    onClick: onSelect,
    onMouseEnter: () => {
      document.body.style.cursor = "pointer";
    },
    onMouseLeave: () => {
      document.body.style.cursor = "default";
    },
    onDragEnd: (e) => onChange({ ...obj, x: e.target.x(), y: e.target.y() }),
    onTransformEnd: () => {
      const node = shapeRef.current;
      onChange({
        ...obj,
        x: node.x(),
        y: node.y(),
        width: node.width() * node.scaleX(),
        height: node.height() * node.scaleY(),
        rotation: node.rotation(),
      });
      node.scaleX(1);
      node.scaleY(1);
    },
  };

  return (
    <>
      {obj.type === "text" ? (
        <Text
          {...commonProps}
          id={obj.id}
          text={obj.content}
          fontSize={obj.font_size}
          fill={obj.color}
        />
      ) : (
        <Image {...commonProps} image={image} scaleX={obj.flip_x ? -1 : 1} />
      )}
      {isSelected && <Transformer ref={trRef} />}
    </>
  );
}
