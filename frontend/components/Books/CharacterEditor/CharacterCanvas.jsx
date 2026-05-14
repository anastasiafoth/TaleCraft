import { forwardRef, useImperativeHandle } from "react";

const LAYER_ORDER = ["body", "outfits", "head", "hair", "glasses"];
const CANVAS_SIZE = 512; // Exportsize in px

// loads image as HTMLImageElement (CORS-compatible via Proxy)
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// draws image on Canvas, with tint-color (multiply)
async function drawLayer(ctx, src, tintColor = null) {
  const img = await loadImage(src);
  const { width: w, height: h } = ctx.canvas;

  const scale = Math.min(w / img.width, h / img.height);
  const dx = (w - img.width * scale) / 2;
  const dy = (h - img.height * scale) / 2;
  const dw = img.width * scale;
  const dh = img.height * scale;

  if (tintColor) {
    // Offscreen-Canvas for this layer, isolated from main canvas
    const offscreen = document.createElement("canvas");
    offscreen.width = w;
    offscreen.height = h;
    const offCtx = offscreen.getContext("2d");

    // 1. draws image
    offCtx.globalCompositeOperation = "source-over";
    offCtx.drawImage(img, dx, dy, dw, dh);

    // 2. tint (multiply)
    offCtx.globalCompositeOperation = "multiply";
    offCtx.fillStyle = tintColor;
    offCtx.fillRect(dx, dy, dw, dh);

    // 3. Alpha 
    offCtx.globalCompositeOperation = "destination-in";
    offCtx.drawImage(img, dx, dy, dw, dh);

    // 4. draw Offscreen-Layer on main canvas zeichnen
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(offscreen, 0, 0);
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(img, dx, dy, dw, dh);
  }
}

export async function exportCharacterToPng({ parts, colors, toProxyUrl }) {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext("2d");

  // transparent background

  for (const layer of LAYER_ORDER) {
    const path = parts[layer];
    if (!path) continue;

    const src = toProxyUrl(path);

    let tint = null;
    if (layer === "hair") tint = colors.hair;
    if (layer === "head" || layer === "body") tint = colors.main;

    try {
      await drawLayer(ctx, src, tint);
    } catch (e) {
      console.warn(`Layer "${layer}" konnte nicht geladen werden:`, e);
    }
  }

  // return as blob for upload
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

function TintLayer({ src, color, zIndex, onClick }) {
  return (
    <div
      className="absolute inset-0 cursor-pointer isolate"
      style={{ zIndex }}
      onClick={onClick}
    >
      {/* base pic */}
      <img
        key={`${src}-base`}
        src={src}
        alt=""
        draggable={false}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
      />

      {/* Tint */}
      <div
        key={`${src}-${color}-tint`}
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: color,

          maskImage: `url(${src})`,
          WebkitMaskImage: `url(${src})`,

          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",

          maskPosition: "center",
          WebkitMaskPosition: "center",

          maskSize: "contain",
          WebkitMaskSize: "contain",

          mixBlendMode: "multiply",
        }}
      />
    </div>
  );
}

function NormalLayer({ src, zIndex, onClick }) {
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      onClick={onClick}
      className="absolute inset-0 w-full h-full object-contain cursor-pointer select-none"
      style={{ zIndex }}
    />
  );
}

const ASSET_BASE = "https://character-proxy.anastasiafoth9.workers.dev";

const CharacterCanvas = forwardRef(function CharacterCanvas(
  { parts, colors, onPartClick, toProxyUrl },
  ref,
) {
  useImperativeHandle(
    ref,
    () => ({
      exportToPng: () => exportCharacterToPng({ parts, colors, toProxyUrl }),
    }),
    [parts, colors, toProxyUrl],
  );
  function renderLayer(layer, index) {
    const path = parts[layer];
    if (!path) return null;

    const src = toProxyUrl(path);

    // color hair
    if (layer === "hair") {
      return (
        <TintLayer
          key={`${layer}-${src}-${colors.hair}`}
          src={src}
          color={colors.hair}
          zIndex={index}
          onClick={() => onPartClick?.(layer)}
        />
      );
    }

    // color skin
    if (layer === "head" || layer === "body") {
      return (
        <TintLayer
          key={`${layer}-${src}-${colors.main}`}
          src={src}
          color={colors.main}
          zIndex={index}
          onClick={() => onPartClick?.(layer)}
        />
      );
    }

    // normal layers
    return (
      <NormalLayer
        key={layer}
        src={src}
        zIndex={index}
        onClick={() => onPartClick?.(layer)}
        style={{
          isolation: "isolate",
        }}
      />
    );
  }

  return (
    <div className="relative isolate w-100 h-full bg-gray-100 rounded-lg overflow-hidden">
      {LAYER_ORDER.map((layer, index) => renderLayer(layer, index))}
    </div>
  );
});

export default CharacterCanvas;
