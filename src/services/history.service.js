import { normalizeStreamUrl, stripVolatileParams, withCurrentToken } from "./stream-url.service";
import { getUser } from "./auth";
const HISTORY_KEY_BASE = "prismplay_watch_history_v1";
const CONTINUE_KEY_BASE = "prismplay_continue_watching_v1";
const MAX_ITEMS = 10;
const MAX_CONTINUE_ITEMS = 30;

function normalizeText(v) {
  return String(v || "").trim().toLowerCase();
}

function dedupKey(entry) {
  const id = String(entry?.id || "").trim();
  if (id) return `id:${id}`;

  const name = normalizeText(entry?.name);
  if (name) return `name:${name}`;

  const normUrl = normalizeStreamUrl(entry?.streamUrl);
  if (normUrl) return `url:${normUrl}`;

  return "";
}

function readRaw() {
  try {
    const raw = localStorage.getItem(getHistoryKey());
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRaw(items) {
  localStorage.setItem(getHistoryKey(), JSON.stringify(items));
}

function getHistoryKey() {
  const userId = String(getUser()?.id || "").trim();
  return `${HISTORY_KEY_BASE}:${userId || "anonymous"}`;
}

function getContinueKey() {
  const userId = String(getUser()?.id || "").trim();
  return `${CONTINUE_KEY_BASE}:${userId || "anonymous"}`;
}

function readContinueRaw() {
  try {
    const raw = localStorage.getItem(getContinueKey());
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeContinueRaw(items) {
  localStorage.setItem(getContinueKey(), JSON.stringify(items));
}

export function getWatchHistory() {
  const list = readRaw();
  const seen = new Set();
  const out = [];

  for (const item of list) {
    const normalizedItem = {
      ...item,
      streamUrl: stripVolatileParams(item?.streamUrl),
    };
    const key = dedupKey(normalizedItem);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push({
      ...normalizedItem,
      streamUrl: withCurrentToken(normalizedItem.streamUrl),
    });
  }
  return out;
}

export function clearWatchHistory() {
  writeRaw([]);
}

export function getContinueWatching() {
  const list = readContinueRaw();
  const out = [];
  const seen = new Set();

  for (const item of list) {
    const stableUrl = stripVolatileParams(item?.streamUrl);
    const norm = normalizeStreamUrl(stableUrl);
    if (!stableUrl || !norm || seen.has(norm)) continue;
    seen.add(norm);

    const lastPositionSec = Math.max(0, Number(item?.lastPositionSec || 0));
    const durationSec = Math.max(0, Number(item?.durationSec || 0));
    const remaining = durationSec > 0 ? durationSec - lastPositionSec : Number.POSITIVE_INFINITY;
    if (lastPositionSec < 15) continue;
    if (remaining <= 20) continue;

    out.push({
      ...item,
      streamUrl: withCurrentToken(stableUrl),
      lastPositionSec,
      durationSec,
      updatedAt: Number(item?.updatedAt || 0),
    });
  }

  out.sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0));
  return out;
}

export function clearContinueWatching() {
  writeContinueRaw([]);
}

export function updateContinueWatchingProgress(entry, positionSec = 0, durationSec = 0) {
  if (!entry?.streamUrl) return;
  const stableStreamUrl = stripVolatileParams(entry.streamUrl);
  if (!stableStreamUrl) return;

  const pos = Math.max(0, Number(positionSec || 0));
  const dur = Math.max(0, Number(durationSec || 0));
  const finished = dur > 0 && pos >= dur - 20;
  const key = normalizeStreamUrl(stableStreamUrl);

  const list = readContinueRaw().filter((x) => normalizeStreamUrl(x?.streamUrl) !== key);
  if (!finished) {
    list.unshift({
      id: String(entry.id || stableStreamUrl),
      name: String(entry.name || "Chaine"),
      groupTitle: String(entry.groupTitle || ""),
      tvgLogo: String(entry.tvgLogo || ""),
      streamUrl: stableStreamUrl,
      format: String(entry.format || ""),
      type: String(entry.type || ""),
      lastPositionSec: pos,
      durationSec: dur,
      updatedAt: Date.now(),
    });
  }
  writeContinueRaw(list.slice(0, MAX_CONTINUE_ITEMS));
}

export function pushWatchHistory(entry) {
  if (!entry?.streamUrl) return;
  const now = Date.now();
  const stableStreamUrl = stripVolatileParams(entry.streamUrl);
  const item = {
    id: String(entry.id || stableStreamUrl),
    name: String(entry.name || "Chaine"),
    groupTitle: String(entry.groupTitle || ""),
    tvgLogo: String(entry.tvgLogo || ""),
    streamUrl: stableStreamUrl,
    format: String(entry.format || ""),
    watchedAt: now,
  };
  const key = dedupKey(item);

  const list = readRaw();
  const filtered = list.filter((x) => {
    const sameUrl = normalizeStreamUrl(x?.streamUrl) === normalizeStreamUrl(item.streamUrl);
    if (sameUrl) return false;
    return dedupKey({
      ...x,
      streamUrl: stripVolatileParams(x?.streamUrl),
    }) !== key;
  });
  filtered.unshift(item);
  writeRaw(filtered.slice(0, MAX_ITEMS));
}
