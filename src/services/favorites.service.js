import { normalizeStreamUrl, stripVolatileParams, withCurrentToken } from "./stream-url.service";
import { getUser } from "./auth";
const FAVORITES_KEY_BASE = "prismplay_favorites_v1";
const FAVORITES_EVENT = "prismplay:favorites-updated";
const MAX_ITEMS = 200;

function readRaw() {
  try {
    const raw = localStorage.getItem(getFavoritesKey());
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRaw(items) {
  localStorage.setItem(getFavoritesKey(), JSON.stringify(items));
  window.dispatchEvent(new Event(FAVORITES_EVENT));
}

function getFavoritesKey() {
  const userId = String(getUser()?.id || "").trim();
  return `${FAVORITES_KEY_BASE}:${userId || "anonymous"}`;
}

export function getFavorites() {
  return readRaw().map((item) => ({
    ...item,
    streamUrl: withCurrentToken(stripVolatileParams(item?.streamUrl)),
  }));
}

export function clearFavorites() {
  writeRaw([]);
}

export function isFavoriteByStreamUrl(streamUrl) {
  if (!streamUrl) return false;
  const key = normalizeStreamUrl(streamUrl);
  const list = readRaw();
  return list.some((x) => normalizeStreamUrl(x?.streamUrl) === key);
}

export function toggleFavorite(channel) {
  const streamUrl = String(channel?.streamUrl || "");
  if (!streamUrl) return false;
  const stableStreamUrl = stripVolatileParams(streamUrl);
  const key = normalizeStreamUrl(stableStreamUrl);

  const list = readRaw();
  const exists = list.some((x) => normalizeStreamUrl(x?.streamUrl) === key);

  if (exists) {
    writeRaw(list.filter((x) => normalizeStreamUrl(x?.streamUrl) !== key));
    return false;
  }

  const item = {
    id: String(channel?.id || stableStreamUrl),
    name: String(channel?.name || "Chaine"),
    groupTitle: String(channel?.groupTitle || ""),
    tvgLogo: String(channel?.tvgLogo || ""),
    streamUrl: stableStreamUrl,
    format: String(channel?.format || ""),
    addedAt: Date.now(),
  };
  writeRaw([item, ...list].slice(0, MAX_ITEMS));
  return true;
}

export function onFavoritesUpdated(handler) {
  if (typeof handler !== "function") return () => {};
  const fn = () => handler(getFavorites());
  window.addEventListener(FAVORITES_EVENT, fn);
  return () => window.removeEventListener(FAVORITES_EVENT, fn);
}
