const LAYER_ORDER = ["legs", "torso", "head", "hair", "glasses"];

function TintLayer({ src, color, zIndex, onClick }) {
  return (
    <div
      className="absolute inset-0 cursor-pointer isolate"
      style={{ zIndex }}
      onClick={onClick}
    >
      {/* Basisbild */}
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

export default function CharacterCanvas({
  parts,
  colors,
  onPartClick,
  toProxyUrl,
}) {
  function renderLayer(layer, index) {
    const path = parts[layer];
    if (!path) return null;

    const src = toProxyUrl(path);

    // Haare einfärben
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

    // Haut einfärben
    if (layer === "head" || layer === "legs") {
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

    // Normale Layers
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
}
