const ASSET_BASE = "https://character-proxy.anastasiafoth9.workers.dev";

export function toProxyUrl(pathOrUrl) {
  try {
    const url = new URL(pathOrUrl);

    if (url.hostname.endsWith(".r2.dev")) {
      return `${ASSET_BASE}${url.pathname}${url.search}`;
    }

    return url.toString();
  } catch {
    return new URL(pathOrUrl, ASSET_BASE).toString();
  }
}

export function normalizeLayout(layout = {}) {
  const normalizeLayer = (layer = []) =>
    layer.map((obj) =>
      obj?.src
        ? {
            ...obj,
            src: toProxyUrl(obj.src),
          }
        : obj,
    );

  return {
    background: normalizeLayer(layout.background ?? []),
    middleground: normalizeLayer(layout.middleground ?? layout.middle ?? []),
    foreground: normalizeLayer(layout.foreground ?? []),
  };
}

