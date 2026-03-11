import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Film, ListVideo, Play, Search } from "lucide-react";
import PageShell from "../components/PageShell";
import Panel from "../components/Panel";
import { channels } from "../services/api";

export default function Series() {
  const navigate = useNavigate();
  const [loadingSeries, setLoadingSeries] = useState(true);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [seriesList, setSeriesList] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadSeries() {
      setLoadingSeries(true);
      setError("");
      try {
        const res = await channels.series({ offset: 0, limit: 500, q: search.trim() || undefined });
        if (cancelled) return;
        const list = Array.isArray(res?.series) ? res.series : [];
        setSeriesList(list);
        setSelectedSeries((prev) => {
          const prevId = String(prev?.id || "");
          const stillExists = prevId && list.some((s) => s.id === prevId);
          return stillExists ? prev : (list[0] || null);
        });
      } catch (err) {
        if (cancelled) return;
        setError(err?.message || "Impossible de charger les series");
      } finally {
        if (!cancelled) setLoadingSeries(false);
      }
    }
    const t = setTimeout(loadSeries, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    async function loadEpisodes() {
      const sid = String(selectedSeries?.seriesId || "").trim();
      if (!sid) {
        setEpisodes([]);
        return;
      }
      setLoadingEpisodes(true);
      setError("");
      try {
        const res = await channels.seriesEpisodes(sid);
        if (cancelled) return;
        setEpisodes(Array.isArray(res?.episodes) ? res.episodes : []);
      } catch (err) {
        if (cancelled) return;
        setError(err?.message || "Impossible de charger les episodes");
      } finally {
        if (!cancelled) setLoadingEpisodes(false);
      }
    }
    loadEpisodes();
    return () => {
      cancelled = true;
    };
  }, [selectedSeries?.seriesId]);

  const episodesBySeason = useMemo(() => {
    const map = new Map();
    for (const ep of episodes) {
      const season = Number(ep?.season || 1) || 1;
      if (!map.has(season)) map.set(season, []);
      map.get(season).push(ep);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [episodes]);

  const openEpisode = (ep) => {
    const streamUrl = String(ep?.streamUrl || "");
    if (!streamUrl) return;
    const format = String(ep?.format || "").trim();
    const type = "series";
    navigate(
      `/watch?url=${encodeURIComponent(streamUrl)}${format ? `&format=${encodeURIComponent(format)}` : ""}&type=${encodeURIComponent(type)}`,
    );
  };

  return (
    <PageShell title="Series" subtitle="Catalogue Xtream Series et lecture episode par episode." icon={Film}>
      <Panel className="p-4 sm:p-5 mb-5">
        <div className="flex items-center gap-2 bg-brand-800 border border-brand-600 rounded-lg px-3 py-2 text-white">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une serie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none placeholder-gray-500"
          />
        </div>
      </Panel>

      {error ? <p className="text-red-400 mb-4">{error}</p> : null}

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5">
        <Panel className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <ListVideo className="w-4 h-4 text-brand-400" />
              Series
            </h2>
            {loadingSeries ? <span className="text-xs text-gray-500">chargement...</span> : null}
          </div>
          <div className="max-h-[68vh] overflow-auto space-y-1 pr-1">
            {seriesList.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedSeries(s)}
                className={[
                  "w-full text-left px-3 py-2 rounded-lg transition",
                  selectedSeries?.id === s.id
                    ? "bg-brand-500/30 text-white"
                    : "text-gray-300 hover:bg-brand-800/70",
                ].join(" ")}
              >
                <p className="font-medium truncate">{s.name}</p>
                <p className="text-xs text-gray-500 truncate">{s.groupTitle}</p>
              </button>
            ))}
            {!loadingSeries && seriesList.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">Aucune serie trouvee.</p>
            ) : null}
          </div>
        </Panel>

        <Panel className="p-4">
          <div className="mb-4">
            <h2 className="text-white text-lg font-semibold">{selectedSeries?.name || "Selectionne une serie"}</h2>
            <p className="text-sm text-gray-400">{selectedSeries?.groupTitle || ""}</p>
          </div>

          {loadingEpisodes ? <p className="text-gray-400">Chargement des episodes...</p> : null}

          {!loadingEpisodes && episodesBySeason.length === 0 ? (
            <p className="text-gray-500">Aucun episode disponible pour cette serie.</p>
          ) : null}

          <div className="space-y-4">
            {episodesBySeason.map(([season, list]) => (
              <div key={season}>
                <h3 className="text-white/90 font-semibold mb-2">Saison {season}</h3>
                <div className="space-y-2">
                  {list.map((ep) => (
                    <div
                      key={ep.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-brand-700 bg-brand-900/40 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="text-white truncate">
                          E{String(ep.episodeNum || "").padStart(2, "0")} - {ep.title || "Episode"}
                        </p>
                        <p className="text-xs text-gray-500">{String(ep.format || "").toUpperCase()}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openEpisode(ep)}
                        disabled={!ep.streamUrl}
                        className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg text-sm"
                      >
                        <Play className="w-4 h-4" />
                        Lire
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </PageShell>
  );
}
