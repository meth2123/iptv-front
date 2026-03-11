/**
 * Client API - appels vers le backend
 */

const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");

function getToken() {
  return localStorage.getItem("iptv_token");
}

export async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const res = await fetch(`${API_URL}${normalizedPath}`, { ...options, headers });
  const raw = await res.text();
  let data = {};
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = { error: raw };
    }
  }

  if (!res.ok) {
    const err = new Error(data?.error || `Erreur ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function buildQuery(params = {}) {
  const clean = {};
  for (const [k, v] of Object.entries(params || {})) {
    if (v === undefined || v === null) continue;
    const s = String(v).trim();
    if (!s) continue;
    clean[k] = s;
  }
  const qs = new URLSearchParams(clean).toString();
  return qs ? `?${qs}` : "";
}

export const auth = {
  register: (body) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  profile: () => request("/auth/profile"),
};

export const subscription = {
  create: (body) => request("/subscription/create", { method: "POST", body: JSON.stringify(body) }),
  status: () => request("/subscription/status"),
};

export const payment = {
  callback: (body) =>
    request("/payment/callback", { method: "POST", body: JSON.stringify(body) }),
};

export const channels = {
  list: (params = {}) => {
    const qs = buildQuery(params);
    return request(`/channels${qs}`);
  },
  groups: () => request("/channels/groups"),
  resolveStream: async (channel = {}) => {
    const id = String(channel?.id || "").trim();
    if (!id) return String(channel?.streamUrl || "");
    const res = await request(`/channels?id=${encodeURIComponent(id)}&limit=1`);
    const item = Array.isArray(res?.channels) ? res.channels[0] : null;
    return String(item?.streamUrl || channel?.streamUrl || "");
  },
  series: (params = {}) => {
    const qs = buildQuery(params);
    return request(`/channels/series${qs}`);
  },
  seriesEpisodes: (seriesId) => request(`/channels/series/${encodeURIComponent(seriesId)}/episodes`),
};
