import { getToken } from "./auth";

const VOLATILE_PARAMS = new Set(["token", "sid"]);

function safeUrl(rawUrl) {
  try {
    return new URL(String(rawUrl || "").trim());
  } catch {
    return null;
  }
}

export function normalizeStreamUrl(rawUrl) {
  const raw = String(rawUrl || "").trim();
  if (!raw) return "";

  const parsed = safeUrl(raw);
  if (!parsed) return raw.split("?")[0].toLowerCase();

  for (const key of VOLATILE_PARAMS) parsed.searchParams.delete(key);
  parsed.hash = "";
  return `${parsed.origin}${parsed.pathname}${parsed.search}`.toLowerCase();
}

export function stripVolatileParams(rawUrl) {
  const raw = String(rawUrl || "").trim();
  if (!raw) return "";

  const parsed = safeUrl(raw);
  if (!parsed) return raw;

  for (const key of VOLATILE_PARAMS) parsed.searchParams.delete(key);
  parsed.hash = "";
  return parsed.toString();
}

export function withCurrentToken(rawUrl) {
  const base = stripVolatileParams(rawUrl);
  if (!base) return "";

  const parsed = safeUrl(base);
  if (!parsed) return base;

  const token = getToken();
  if (token) parsed.searchParams.set("token", token);
  return parsed.toString();
}
