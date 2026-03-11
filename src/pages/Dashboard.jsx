import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { channels } from "../services/api";
import ChannelCard from "../components/ChannelCard";
import SubscriptionBadge from "../components/SubscriptionBadge";
import { Tv, Play, Search, History, Trash2 } from "lucide-react";
import {
  getWatchHistory,
  clearWatchHistory,
  getContinueWatching,
  clearContinueWatching,
} from "../services/history.service";
import { normalizeStreamUrl } from "../services/stream-url.service";

export default function Dashboard() {
  const initialGroup = useMemo(() => {
    const params = new URLSearchParams(window.location.search || "");
    return (params.get("group") || "").trim();
  }, []);
  const [channelList, setChannelList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState(initialGroup);
  const [groups, setGroups] = useState([]);
  const [recentHistory, setRecentHistory] = useState([]);
  const [continueWatching, setContinueWatching] = useState([]);
  const [paging, setPaging] = useState(() => {
    const raw = localStorage.getItem("iptv_prefs_v1");
    let limit = 500;
    try {
      const p = raw ? JSON.parse(raw) : {};
      if (Number(p.channelsPageSize)) limit = Number(p.channelsPageSize);
    } catch {
      // ignore
    }
    return { offset: 0, limit, total: 0, hasMore: false };
  });

  const queryParams = useMemo(
    () => ({
      offset: 0,
      limit: paging.limit,
      q: search.trim(),
      group: groupFilter,
    }),
    [search, groupFilter, paging.limit]
  );

  const continueSet = useMemo(() => {
    const s = new Set();
    for (const item of continueWatching) {
      const id = String(item?.id || "").trim();
      if (id) s.add(`id:${id}`);
      const url = normalizeStreamUrl(item?.streamUrl);
      if (url) s.add(`url:${url}`);
    }
    return s;
  }, [continueWatching]);

  const recentSet = useMemo(() => {
    const s = new Set();
    for (const item of recentHistory) {
      const id = String(item?.id || "").trim();
      if (id) s.add(`id:${id}`);
      const url = normalizeStreamUrl(item?.streamUrl);
      if (url) s.add(`url:${url}`);
    }
    return s;
  }, [recentHistory]);

  const mainChannels = useMemo(() => {
    return channelList.filter((ch) => {
      const idKey = `id:${String(ch?.id || "").trim()}`;
      const urlKey = `url:${normalizeStreamUrl(ch?.streamUrl)}`;
      return (
        !recentSet.has(idKey) &&
        !recentSet.has(urlKey) &&
        !continueSet.has(idKey) &&
        !continueSet.has(urlKey)
      );
    });
  }, [channelList, recentSet, continueSet]);

  const searchRef = useRef(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search || "");
    if (params.get("focus") === "search") {
      setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, []);

  useEffect(() => {
    setRecentHistory(getWatchHistory());
    setContinueWatching(getContinueWatching());

    const refresh = () => {
      setRecentHistory(getWatchHistory());
      setContinueWatching(getContinueWatching());
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadGroups() {
      try {
        const res = await channels.groups();
        if (!cancelled) setGroups(res.groups || []);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoadingGroups(false);
      }
    }

    loadGroups();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load first page when filters change (debounced)
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const res = await channels.list(queryParams);
        const list = res.channels || [];
        if (cancelled) return;
        setChannelList(list);
        const total = Number(res.total || 0);
        const offset = Number(res.offset || 0);
        const limit = Number(res.limit || paging.limit);
        const hasMore = total ? offset + limit < total : list.length === limit;
        setPaging({ offset, limit, total, hasMore });
      } catch (err) {
        if (cancelled) return;
        setError(
          err?.data?.code === "SUBSCRIPTION_REQUIRED"
            ? "Abonnement requis pour acceder aux chaines."
            : err.message || "Erreur chargement"
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams.q, queryParams.group, queryParams.limit]);

  async function loadMore() {
    if (loadingMore || !paging.hasMore) return;
    setLoadingMore(true);
    try {
      const nextOffset = paging.offset + paging.limit;
      const res = await channels.list({
        offset: nextOffset,
        limit: paging.limit,
        q: search.trim() || undefined,
        group: groupFilter || undefined,
      });
      const list = res.channels || [];
      setChannelList((prev) => [...prev, ...list]);

      const total = Number(res.total || paging.total || 0);
      const offset = Number(res.offset || nextOffset);
      const limit = Number(res.limit || paging.limit);
      const hasMore = total ? offset + limit < total : list.length === limit;
      setPaging({ offset, limit, total, hasMore });
    } finally {
      setLoadingMore(false);
    }
  }

  const SkeletonCard = ({ i }) => (
    <div
      className="rounded-xl overflow-hidden border border-brand-700 bg-brand-800/60"
      style={{ animationDelay: `${(i % 12) * 60}ms` }}
    >
      <div className="aspect-[16/10] bg-brand-950 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-900 to-brand-950 animate-pulse" />
      </div>
      <div className="p-3">
        <div className="h-4 w-3/4 bg-brand-700/50 rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-brand-700/30 rounded mt-2 animate-pulse" />
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-md text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <Link
          to="/subscribe"
          className="inline-block bg-brand-500 hover:bg-brand-400 text-white px-6 py-3 rounded-lg font-medium"
        >
          S'abonner
        </Link>
      </div>
    );
  }

  return (
    <motion.div className="w-full px-4 sm:px-6 lg:px-8 py-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Tv className="w-7 h-7 text-brand-400" />
            Chaines
          </h1>
          <SubscriptionBadge />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/watch"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white px-4 py-2 rounded-lg font-medium transition text-sm"
          >
            <Play className="w-4 h-4" />
            Regarder en direct
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <aside className="bg-brand-900/60 border border-brand-700 rounded-xl p-3 h-fit lg:sticky lg:top-20">
          <div className="flex items-center gap-2 text-white font-semibold mb-2">
            <span>Categories</span>
            {loadingGroups && <span className="text-xs text-gray-500">(chargement...)</span>}
          </div>
          <div className="space-y-1 max-h-[55vh] overflow-auto pr-1">
            <button
              type="button"
              onClick={() => setGroupFilter("")}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                groupFilter === "" ? "bg-brand-500/30 text-white" : "text-gray-300 hover:bg-brand-800/70"
              }`}
            >
              Toutes
            </button>
            {groups.map((g) => (
              <button
                key={g.title}
                type="button"
                onClick={() => setGroupFilter(g.title)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center justify-between gap-2 ${
                  groupFilter === g.title ? "bg-brand-500/30 text-white" : "text-gray-300 hover:bg-brand-800/70"
                }`}
              >
                <span className="truncate">{g.title}</span>
                <span className="text-xs text-gray-500">{g.count}</span>
              </button>
            ))}
            {loadingGroups &&
              Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="px-3 py-2 rounded-lg bg-brand-800/50 border border-brand-700/50">
                  <div className="h-3 w-2/3 bg-brand-700/40 rounded animate-pulse" />
                </div>
              ))}
          </div>
        </aside>

        <section className="min-w-0">
          {continueWatching.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                  <Play className="w-4 h-4 text-brand-400" />
                  Continuer a regarder
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    clearContinueWatching();
                    setContinueWatching([]);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Vider
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {continueWatching.slice(0, 10).map((ch, i) => (
                  <motion.div
                    key={`${ch.streamUrl}-${i}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.12) }}
                  >
                    <ChannelCard channel={ch} streamUrl={ch.streamUrl} refreshOnClick />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {recentHistory.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-brand-400" />
                  Recemment regardees
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    clearWatchHistory();
                    setRecentHistory([]);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Vider
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {recentHistory.slice(0, 10).map((ch, i) => (
                  <motion.div
                    key={`${ch.streamUrl}-${i}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.12) }}
                  >
                    <ChannelCard channel={ch} streamUrl={ch.streamUrl} refreshOnClick />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[240px] flex items-center gap-2 bg-brand-800 border border-brand-600 rounded-lg px-3 py-2 text-white">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Rechercher une chaine..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent outline-none placeholder-gray-500"
              />
            </div>
            <div className="text-sm text-gray-400 flex items-center">
              {paging.total ? `${paging.total} chaines` : ""}
            </div>
          </div>

          <h2 className="text-lg font-semibold text-white mb-4">
            {groupFilter || "Toutes les chaines"}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
            {loading && channelList.length === 0
              ? Array.from({ length: 24 }).map((_, i) => <SkeletonCard key={i} i={i} />)
              : mainChannels.map((ch, i) => (
                  <motion.div
                    key={ch.id ?? i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.006, 0.18) }}
                  >
                    <ChannelCard channel={ch} streamUrl={ch.streamUrl} />
                  </motion.div>
                ))}
          </div>

          {paging.hasMore && (
            <div className="flex justify-center pt-10">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="bg-brand-800 hover:bg-brand-700 disabled:opacity-60 text-white px-6 py-3 rounded-lg font-medium"
              >
                {loadingMore ? "Chargement..." : "Charger plus"}
              </button>
            </div>
          )}

          {!loading && mainChannels.length === 0 && (
            <p className="text-gray-500 text-center py-12">Aucune chaine trouvee.</p>
          )}
        </section>
      </div>
    </motion.div>
  );
}
