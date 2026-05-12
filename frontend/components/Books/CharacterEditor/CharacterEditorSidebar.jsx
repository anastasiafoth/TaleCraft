import { useState, useEffect } from "react";
import { getAssets } from "../../../src/api";

const CATEGORIES = ["head", "hair", "outfits", "body", "glasses"];

function PartButton({ asset, isActive, onClick, toProxyUrl }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative aspect-square border rounded-lg overflow-hidden
        hover:border-primary transition-colors
        ${isActive ? "border-primary ring-2 ring-primary/30" : "border-base-300"}
      `}
    >
      <img
        src={toProxyUrl(asset.file_url)}
        alt={asset.object_key}
        draggable={false}
        className="w-full h-full object-contain p-1 select-none"
      />
    </button>
  );
}

function NoneButton({ isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        aspect-square border rounded-lg flex items-center justify-center
        text-xs text-base-content/40 hover:border-primary transition-colors
        ${isActive ? "border-primary ring-2 ring-primary/30" : "border-base-300 border-dashed"}
      `}
    >
      None
    </button>
  );
}

function getAssetPath(asset) {
  if (asset.object_key) return `/${asset.object_key}`;

  try {
    return new URL(asset.file_url).pathname;
  } catch {
    return asset.file_url;
  }
}

function checkImage(url, toProxyUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = toProxyUrl(url);
  });
}

export default function CharacterEditorSidebar({
  token,
  parts,
  colors,
  activeCategory,
  onCategoryChange,
  onPartChange,
  onColorChange,
  toProxyUrl,
}) {
  const [categoryAssets, setCategoryAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  const nullableParts = ["glasses", "hair"];

  useEffect(() => {
    let cancelled = false;

    async function loadAssets() {
      setLoading(true);

      try {
        const data = await getAssets(token);

        const candidates = data.filter((asset) => {
          const key = asset.object_key?.toLowerCase() ?? "";
          return (
            key.startsWith(`characters/${activeCategory}/`) &&
            (key.endsWith(".png"))
          );
        });

        const checks = await Promise.all(
          candidates.map(async (asset) => ({
            asset,
            ok: await checkImage(asset.file_url, toProxyUrl),
          })),
        );

        if (!cancelled) {
          setCategoryAssets(
            checks.filter((entry) => entry.ok).map((entry) => entry.asset),
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAssets();

    return () => {
      cancelled = true;
    };
  }, [token, activeCategory, toProxyUrl]);

  return (
    <aside className="w-64 h-full flex flex-col bg-base-100 border-l border-base-300">
      <div className="px-4 py-3 border-b border-base-300 shrink-0">
        <p className="font-medium text-base-content/50 uppercase tracking-widest text-xs">
          Character Editor
        </p>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className="border-b border-base-300 p-4 flex flex-col gap-3">
          <p className="text-sm font-medium">Colors</p>

          <label className="flex items-center justify-between text-sm">
            <span className="text-base-content/60">Body Color</span>
            <input
              type="color"
              value={colors.main}
              onChange={(e) => onColorChange("main", e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border border-base-300"
            />
          </label>

          <label className="flex items-center justify-between text-sm">
            <span className="text-base-content/60">Hair Color</span>
            <input
              type="color"
              value={colors.hair}
              onChange={(e) => onColorChange("hair", e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border border-base-300"
            />
          </label>
        </div>

        <div className="border-b border-base-300 px-3 pt-3 flex gap-1 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={`btn btn-xs mb-2 capitalize ${activeCategory === cat ? "btn-primary" : "btn-ghost"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="p-3">
          <p className="text-xs text-base-content/50 mb-2 capitalize">
            Choose {activeCategory}
          </p>

          {loading ? (
            <div className="grid grid-cols-3 gap-1.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton aspect-square rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              {nullableParts.includes(activeCategory) && (
                <NoneButton
                  isActive={!parts[activeCategory]}
                  onClick={() => onPartChange(activeCategory, null)}
                />
              )}

              {categoryAssets.map((asset) => {
                const assetPath = getAssetPath(asset);
                const isActive = parts[activeCategory] === assetPath;

                return (
                  <PartButton
                    key={asset.id}
                    asset={asset}
                    isActive={isActive}
                    onClick={() => onPartChange(activeCategory, assetPath)}
                    toProxyUrl={toProxyUrl}
                  />
                );
              })}

              {categoryAssets.length === 0 && (
                <p className="col-span-3 text-xs text-base-content/40 text-center py-4">
                  No assets found for "{activeCategory}"
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
