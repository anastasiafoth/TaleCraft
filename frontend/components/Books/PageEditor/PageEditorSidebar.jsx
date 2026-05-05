import { useState, useEffect, useCallback } from "react";
import { getAssets, getCharacterTemplates } from "../../../src/api";

// ─── Helpers ────────────────────────────────────────────────────────
function getInitials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  "bg-primary/20 text-primary",
  "bg-secondary/20 text-secondary",
  "bg-accent/20 text-accent",
  "bg-info/20 text-info",
  "bg-success/20 text-success",
];

// ─── Section ────────────────────────────────────────────────────────
function Section({ label, dotClass, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-base-300">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-base-200 transition-colors text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          <span className={`w-2 h-2 rounded-full shrink-0 ${dotClass}`} />
          {label}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-base-content/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>
      {open && <div className="px-3 pb-3 pt-1">{children}</div>}
    </div>
  );
}

// ─── Skeleton grid ───────────────────────────────────────────────────
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton aspect-square rounded-lg" />
      ))}
    </div>
  );
}

// ─── Asset grid ──────────────────────────────────────────────────────
function AssetGrid({ assets, loading, onDragStart }) {
  if (loading) return <SkeletonGrid />;

  if (!assets.length) {
    return (
      <p className="text-xs text-base-content/40 text-center py-3">
        No assets found
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1.5">
      {assets.map((asset) => (
        <div
          key={asset.id}
          draggable
          onDragStart={(e) => onDragStart(e, asset)}
          title={asset.object_key}
          className="relative aspect-square border border-base-300 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing bg-base-200 hover:border-base-content/30 transition-colors"
        >
          <img
            src={asset.file_url}
            alt={asset.object_key}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <span className="absolute bottom-0 left-0 right-0 text-[9px] text-base-content/60 bg-base-100/90 px-1 py-0.5 text-center truncate border-t border-base-300">
            {asset.object_key
              .split("/")
              .pop()
              .replace(/^[a-f0-9-]{36}-/, "")}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Character list ──────────────────────────────────────────────────
function CharacterList({ characters, loading, onDragStart }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="skeleton h-14 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!characters.length) {
    return (
      <p className="text-xs text-base-content/40 text-center py-3">
        No Characters found
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {characters.map((char, i) => {
        const name = char.name || char.default_name || `Figur ${i + 1}`;
        return (
          <div
            key={char.id}
            draggable
            onDragStart={(e) => onDragStart(e, char)}
            className="flex items-center gap-2.5 p-2 border border-base-300 rounded-lg cursor-grab active:cursor-grabbing hover:bg-base-200 hover:border-base-content/30 transition-colors"
          >
            {char.profile_img ? (
              <img
                src={char.profile_img}
                alt={name}
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
            ) : (
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
              >
                {getInitials(name)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{name}</p>
              {char.role && (
                <p className="text-xs text-base-content/50">{char.role}</p>
              )}
            </div>
            <span className="badge badge-sm badge-outline shrink-0">
              Character
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Text section ────────────────────────────────────────────────────
const FONT_SIZES = [10, 12, 14, 16, 18, 24, 32, 48];

function TextSection({ onAddText }) {
  const [value, setValue] = useState("");
  const [fontSize, setFontSize] = useState(16);

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={2}
        className="textarea textarea-bordered textarea-sm w-full resize-none text-sm"
        placeholder="text..."
      />
      <button
        type="button"
        className="btn btn-sm btn-primary w-full gap-1.5"
        onClick={() => onAddText?.(value)}
      >
        Add text to page
      </button>
    </div>
  );
}

// ─── Main Sidebar ────────────────────────────────────────────────────
/**
 * Props:
 *  - token: string               JWT token
 *  - id: number                  BookId to get character Templates
 *  - onAddText(text)             add Text to page
 *  - onDragAsset(e, asset)       dragstart for Assets
 *  - onDragCharacter(e, char)    dragstart for Characters
 */
export default function PageEditorSidebar({
  token,
  id,
  onAddText,
  onDragAsset,
  onDragCharacter,
}) {
  const [assets, setAssets] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [charsLoading, setCharsLoading] = useState(true);
  const [assetsError, setAssetsError] = useState(null);
  const [charsError, setCharsError] = useState(null);

  useEffect(() => {
    getAssets(token)
      .then((data) => setAssets(Array.isArray(data) ? data : []))
      .catch(() => setAssetsError("Assets could not load"))
      .finally(() => setAssetsLoading(false));
  }, [token]);

  useEffect(() => {
    if (!id) {
      setCharsLoading(false);
      return;
    }
    getCharacterTemplates(id, token)
      .then((data) => setCharacters(Array.isArray(data) ? data : []))
      .catch(() => setCharsError("Characters could not load"))
      .finally(() => setCharsLoading(false));
  }, [id, token]);

  // Assets nach Dateiname auf Layer aufteilen
  const bgAssets = assets.filter((a) => /background|weather|house|cloud|field|garden|bg_/i.test(a.object_key));
  const midAssets = assets.filter((a) =>
    /middle|mid_|tree|bush|rock|house|cloud/i.test(a.object_key),
  );
  const fgAssets = assets.filter(
    (a) =>
      !/(background|bg_|tree|bush|rock|cloud)/i.test(a.object_key),
  );

  const handleDragAsset = useCallback(
    (e, asset, layer) => {
      e.dataTransfer.setData(
        "application/json",
        JSON.stringify({ type: "asset", layer, ...asset }),
      );
      onDragAsset?.(e, asset);
    },
    [onDragAsset],
  );

  const handleDragCharacter = useCallback(
    (e, char) => {
      e.dataTransfer.setData(
        "application/json",
        JSON.stringify({ type: "character", ...char }),
      );
      onDragCharacter?.(e, char);
    },
    [onDragCharacter],
  );

  const ErrorMsg = ({ msg }) => (
    <p className="text-xs text-error py-2">{msg}</p>
  );

  return (
    <div className="w-64 h-full flex flex-col bg-base-100 border-r border-base-300 rounded-r-lg">
      {/* Header */}
      <div className="px-4 py-3 border-b border-base-300 shrink-0">
        <p className="font-medium text-base-content/50 uppercase tracking-widest">
          Page Editor
        </p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <Section label="Text" dotClass="bg-purple-400" defaultOpen>
          <TextSection onAddText={onAddText} />
        </Section>

        <Section label="Background" dotClass="bg-teal-400">
          {assetsError ? (
            <ErrorMsg msg={assetsError} />
          ) : (
            <AssetGrid
              assets={bgAssets}
              loading={assetsLoading}
              onDragStart={(e, asset) =>
                handleDragAsset(e, asset, "background")
              }
            />
          )}
        </Section>

        <Section label="Middleground" dotClass="bg-blue-400">
          {assetsError ? (
            <ErrorMsg msg={assetsError} />
          ) : (
            <AssetGrid
              assets={midAssets}
              loading={assetsLoading}
              onDragStart={(e, asset) =>
                handleDragAsset(e, asset, "middleground")
              }
            />
          )}
        </Section>

        <Section label="Foreground" dotClass="bg-pink-400">
          {assetsError ? (
            <ErrorMsg msg={assetsError} />
          ) : (
            <AssetGrid
              assets={fgAssets}
              loading={assetsLoading}
              onDragStart={(e, asset) =>
                handleDragAsset(e, asset, "foreground")
              }
            />
          )}
        </Section>

        <Section label="Characters" dotClass="bg-orange-400">
          {charsError ? (
            <ErrorMsg msg={charsError} />
          ) : (
            <CharacterList
              characters={characters}
              loading={charsLoading}
              onDragStart={handleDragCharacter}
            />
          )}
        </Section>
      </div>
    </div>
  );
}
