export default function PageObject({ obj }) {
  if (obj.type === "text") {
    return (
      <p
        style={{
          position: "absolute",
          left: obj.x,
          top: obj.y,
          fontSize: obj.font_size,
          color: obj.color,
        }}
      >
        {obj.content}
      </p>
    );
  }

  if (obj.type === "image" || obj.type === "character") {
    return (
      <img
        src={obj.src}
        style={{
          position: "absolute",
          left: obj.x,
          top: obj.y,
          width: obj.width,
          height: obj.height,
          transform: `rotate(${obj.rotation}deg) scaleX(${obj.flip_x ? -1 : 1})`,
        }}
      />
    );
  }

  return null;
}
