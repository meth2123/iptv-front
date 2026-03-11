import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import Hls from "hls.js";
import mpegts from "mpegts.js";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Film,
  List,
  Maximize,
  Minimize,
  Pause,
  Play,
  Tv,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { channels } from "../services/api";
import { pushWatchHistory, updateContinueWatchingProgress } from "../services/history.service";
import { withCurrentToken } from "../services/stream-url.service";

function safeImgUrl(raw) {
  const s = (raw || "").trim();
  if (!s) return "";
  try {
    const parsed = new URL(s, window.location.origin);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "";
    return parsed.href;
  } catch {
    return "";
  }
}

function clamp01(n) {
  const x = Number(n);
  if (Number.isNaN(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

function inferFormatFromUrl(rawUrl) {
  const u = String(rawUrl || "").toLowerCase();
  if (!u) return "hls";
  if (u.includes(".m3u8") || u.endsWith(".m3u")) return "hls";
  if (/\.ts(\?|$)/i.test(u)) return "ts";
  if (/\.(mp4|mkv|avi|mov|webm|m4v)(\?|$)/i.test(u)) return "direct";
  return "hls";
}

export default function Player() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialUrl = searchParams.get("url");
  const initialIndex = String(searchParams.get("index") || "").trim();
  const initialFormat = (searchParams.get("format") || "").toLowerCase();
  const initialType = (searchParams.get("type") || "").toLowerCase();

  const playerRootRef = useRef(null);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const mpegtsRef = useRef(null);
  const hideTimerRef = useRef(null);

  const [error, setError] = useState("");
  const [subscriptionRequired, setSubscriptionRequired] = useState(false);
  const [channelsLoading, setChannelsLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(true);
  const [channelList, setChannelList] = useState([]);
  const [currentUrl, setCurrentUrl] = useState(() => initialUrl || "");
  const [currentChannel, setCurrentChannel] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paging, setPaging] = useState({ offset: 0, limit: 2000, total: 0, hasMore: false });
  const [loadingMore, setLoadingMore] = useState(false);
  const [filterText, setFilterText] = useState("");

  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cinemaMode, setCinemaMode] = useState(false);
  const [fitMode, setFitMode] = useState("contain"); // contain | cover

  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.9);
  const [isPlaying, setIsPlaying] = useState(false);
  const lastHistoryKeyRef = useRef("");
  const lastProgressSaveAtRef = useRef(0);
  const playableUrl = useMemo(() => withCurrentToken(currentUrl || ""), [currentUrl]);

  const channelsWithUrls = useMemo(() => channelList.filter((c) => c.streamUrl), [channelList]);
  const filteredChannels = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    if (!q) return channelsWithUrls;
    return channelsWithUrls.filter((c) => {
      return (
        (c.name || "").toLowerCase().includes(q) ||
        (c.groupTitle || "").toLowerCase().includes(q)
      );
    });
  }, [channelsWithUrls, filterText]);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 2600);
  }, []);

  const loadInitial = useCallback(async () => {
    try {
      const listRes = await channels.list({ offset: 0, limit: 2000 });
      const list = listRes.channels || listRes || [];
      setChannelList(list);
      const canWatch = listRes?.canWatch !== false;
      setSubscriptionRequired(!canWatch);

      const total = Number(listRes.total || 0);
      const offset = Number(listRes.offset || 0);
      const limit = Number(listRes.limit || 2000);
      const hasMore = total ? offset + limit < total : list.length === limit;
      setPaging({ offset, limit, total, hasMore });

      if (!canWatch) {
        setError(listRes?.message || "Abonnement requis pour lire les chaines.");
        return;
      }

      if (!initialUrl) {
        if (initialIndex) {
          const byId = list.find((c) => String(c?.id || "") === initialIndex);
          if (byId?.streamUrl) {
            setCurrentUrl(byId.streamUrl);
            setCurrentChannel(byId);
            return;
          }
        }
        if (list.length > 0 && list[0].streamUrl) {
          setCurrentUrl(list[0].streamUrl);
          setCurrentChannel(list[0]);
        }
      } else if (initialUrl) {
        const decoded = decodeURIComponent(initialUrl);
        const ch = list.find((c) => c.streamUrl === decoded);
        setCurrentChannel(ch || null);
      }
    } catch {
      setError("Impossible de charger les chaines.");
    } finally {
      setChannelsLoading(false);
    }
  }, [initialUrl, initialIndex]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        const el = playerRootRef.current || videoRef.current;
        if (el?.requestFullscreen) await el.requestFullscreen();
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleCinema = useCallback(() => {
    setCinemaMode((v) => {
      const next = !v;
      if (next) setSidebarOpen(false);
      return next;
    });
    showControls();
  }, [showControls]);

  async function loadMore() {
    if (loadingMore || !paging.hasMore) return;
    setLoadingMore(true);
    try {
      const nextOffset = paging.offset + paging.limit;
      const listRes = await channels.list({ offset: nextOffset, limit: paging.limit });
      const list = listRes.channels || listRes || [];
      setChannelList((prev) => [...prev, ...list]);

      const total = Number(listRes.total || paging.total || 0);
      const offset = Number(listRes.offset || nextOffset);
      const limit = Number(listRes.limit || paging.limit);
      const hasMore = total ? offset + limit < total : list.length === limit;
      setPaging({ offset, limit, total, hasMore });
    } catch {
      // ignore
    } finally {
      setLoadingMore(false);
    }
  }

  const playStream = useCallback(
    (url, channel) => {
      setCurrentUrl(url);
      setCurrentChannel(channel);
      setError("");
      setVideoLoading(true);
      showControls();
      if (window.matchMedia("(max-width: 1023px)").matches) {
        setSidebarOpen(false);
      }
      navigate(`/watch?url=${encodeURIComponent(url)}`, { replace: true });
    },
    [navigate, showControls],
  );

  const playAdjacent = useCallback(
    async (dir) => {
      const list = filteredChannels;
      if (!list.length) return;
      const idx = list.findIndex((c) => c.streamUrl === currentUrl);
      const nextIdx = idx < 0 ? 0 : idx + dir;

      if (nextIdx >= 0 && nextIdx < list.length) {
        playStream(list[nextIdx].streamUrl, list[nextIdx]);
        return;
      }

      if (dir > 0 && paging.hasMore && !loadingMore) {
        await loadMore();
      }
    },
    [filteredChannels, currentUrl, playStream, paging.hasMore, loadingMore],
  );

  const togglePlayPause = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;
    showControls();
    try {
      if (v.paused) {
        await v.play();
      } else {
        v.pause();
      }
    } catch {
      // ignore
    }
  }, [showControls]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onPlaying = () => setVideoLoading(false);
    const onCanPlay = () => setVideoLoading(false);
    const onError = () => {
      setError("Impossible de lire le flux");
      setVideoLoading(false);
    };

    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("playing", onPlaying);
    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("error", onError);

    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("error", onError);
    };
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !currentUrl) return;
    lastProgressSaveAtRef.current = 0;

    const saveProgress = (force = false) => {
      const now = Date.now();
      if (!force && now - lastProgressSaveAtRef.current < 8000) return;
      lastProgressSaveAtRef.current = now;

      updateContinueWatchingProgress(
        {
          id: currentChannel?.id || currentUrl,
          name: currentChannel?.name || "Lecture",
          groupTitle: currentChannel?.groupTitle || "",
          tvgLogo: currentChannel?.tvgLogo || "",
          streamUrl: currentUrl,
          format: currentChannel?.format || initialFormat || inferFormatFromUrl(currentUrl),
          type: currentChannel?.type || initialType || "",
        },
        Number(v.currentTime || 0),
        Number(v.duration || 0),
      );
    };

    const onTimeUpdate = () => saveProgress(false);
    const onPauseSave = () => saveProgress(true);
    const onEnded = () => {
      const d = Number(v.duration || 0);
      updateContinueWatchingProgress(
        {
          id: currentChannel?.id || currentUrl,
          name: currentChannel?.name || "Lecture",
          groupTitle: currentChannel?.groupTitle || "",
          tvgLogo: currentChannel?.tvgLogo || "",
          streamUrl: currentUrl,
          format: currentChannel?.format || initialFormat || inferFormatFromUrl(currentUrl),
          type: currentChannel?.type || initialType || "",
        },
        d || Number(v.currentTime || 0),
        d,
      );
    };

    v.addEventListener("timeupdate", onTimeUpdate);
    v.addEventListener("pause", onPauseSave);
    v.addEventListener("ended", onEnded);

    return () => {
      saveProgress(true);
      v.removeEventListener("timeupdate", onTimeUpdate);
      v.removeEventListener("pause", onPauseSave);
      v.removeEventListener("ended", onEnded);
    };
  }, [currentUrl, currentChannel, initialFormat, initialType]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !!muted;
  }, [muted]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = clamp01(volume);
  }, [volume]);

  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = (e.target?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || e.target?.isContentEditable) return;

      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        togglePlayPause();
        return;
      }
      if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
        return;
      }
      if (e.key === "c" || e.key === "C") {
        toggleCinema();
        return;
      }
      if (e.key === "m" || e.key === "M") {
        setMuted((v) => !v);
        showControls();
        return;
      }
      if (e.key === "ArrowLeft") {
        playAdjacent(-1);
        return;
      }
      if (e.key === "ArrowRight") {
        playAdjacent(1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleFullscreen, toggleCinema, togglePlayPause, playAdjacent, showControls]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!playableUrl || !videoRef.current) return;

    setVideoLoading(true);
    setError("");

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (mpegtsRef.current) {
      try {
        mpegtsRef.current.destroy();
      } catch {
        // ignore
      }
      mpegtsRef.current = null;
    }

    const format = currentChannel?.format || initialFormat || inferFormatFromUrl(playableUrl);
    if (format === "ts") {
      if (!mpegts.getFeatureList?.().mseLivePlayback) {
        setError("Lecture TS non supportee sur ce navigateur");
        setVideoLoading(false);
        return;
      }
      // Use explicit type hint from URL when currentChannel metadata is unavailable.
      const typeHint = String(currentChannel?.type || initialType || "").toLowerCase();
      const tsIsLive = typeHint === "live";

      const player = mpegts.createPlayer(
        { type: "mpegts", url: playableUrl, isLive: tsIsLive },
        { enableWorker: true, lazyLoad: false, enableStashBuffer: true, stashInitialSize: 384 * 1024, lazyLoadMaxDuration: 30 },
      );
      mpegtsRef.current = player;
      player.attachMediaElement(videoRef.current);
      player.load();
      player
        .play()
        .catch(() => {
          // autoplay can be blocked
        })
        .finally(() => {
          // Avoid loader stuck on some TS streams
          setVideoLoading(false);
        });

      player.on(mpegts.Events.ERROR, () => {
        setError("Impossible de lire le flux");
        setVideoLoading(false);
      });

      return () => {
        try {
          player.destroy();
        } catch {
          // ignore
        }
        mpegtsRef.current = null;
      };
    }

    if (format === "direct") {
      const v = videoRef.current;
      v.src = playableUrl;
      v.load();
      v
        .play()
        .catch(() => {
          // autoplay can be blocked by browser
        })
        .finally(() => setVideoLoading(false));

      const onLoaded = () => setVideoLoading(false);
      v.addEventListener("loadeddata", onLoaded);
      return () => {
        v.removeEventListener("loadeddata", onLoaded);
        v.src = "";
      };
    }

    if (Hls.isSupported()) {
      const typeHint = String(currentChannel?.type || initialType || "").toLowerCase();
      const isLiveType = typeHint === "live";
      const hls = new Hls({
        enableWorker: true,
        // Low-latency mode can stall some Xtream VOD/series playlists at 0s.
        lowLatencyMode: isLiveType,
        maxBufferLength: isLiveType ? 10 : 60,
        backBufferLength: isLiveType ? 30 : 90,
        startPosition: isLiveType ? -1 : 0,
        liveDurationInfinity: isLiveType,
        xhrSetup: (xhr) => {
          xhr.withCredentials = false;
        },
      });
      hlsRef.current = hls;
      hls.loadSource(playableUrl);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setVideoLoading(false);
        // Keep parity with TS/direct paths: explicitly attempt playback.
        videoRef.current?.play?.().catch(() => {
          // autoplay can be blocked by browser policy
        });
      });
      hls.on(Hls.Events.FRAG_BUFFERED, () => {
        const v = videoRef.current;
        if (!v || isLiveType) return;
        // Some VOD playlists (fMP4) stay stuck at 0; nudge playback once buffered.
        if (v.currentTime <= 0.1 && v.buffered?.length) {
          const start = v.buffered.start(0);
          if (Number.isFinite(start)) {
            v.currentTime = Math.max(0, start + 0.05);
            v.play?.().catch(() => {});
          }
        }
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setError("Impossible de lire le flux");
              setVideoLoading(false);
          }
        }
      });
      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    }

    if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = playableUrl;
      const onLoadedData = () => setVideoLoading(false);
      videoRef.current.addEventListener("loadeddata", onLoadedData);
      return () => {
        videoRef.current.removeEventListener("loadeddata", onLoadedData);
        videoRef.current.src = "";
      };
    }

    setError("Lecteur HLS non supporte");
    setVideoLoading(false);
  }, [playableUrl, currentChannel?.format, currentChannel?.type, initialFormat, initialType]);

  useEffect(() => {
    if (!currentUrl || !currentChannel) return;
    const key = `${currentChannel.id || currentChannel.name || "ch"}::${currentUrl}`;
    if (lastHistoryKeyRef.current === key) return;

    const t = setTimeout(() => {
      pushWatchHistory({
        id: currentChannel.id,
        name: currentChannel.name,
        groupTitle: currentChannel.groupTitle,
        tvgLogo: currentChannel.tvgLogo,
        streamUrl: currentUrl,
        format: currentChannel.format,
      });
      lastHistoryKeyRef.current = key;
    }, 2200);

    return () => clearTimeout(t);
  }, [currentUrl, currentChannel]);

  if (channelsLoading && channelList.length === 0 && !error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400">Chargement des chaines...</p>
      </div>
    );
  }

  if ((subscriptionRequired || error) && !currentUrl) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-5 px-4">
        <div className="w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-300 text-center">
          {subscriptionRequired
            ? "Chargement termine. Un abonnement est requis pour lancer cette chaine."
            : error}
        </p>
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <Link
            to="/subscribe"
            className="inline-flex items-center justify-center rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-semibold px-5 py-3 transition"
          >
            Aller a l'abonnement
          </Link>
          <Link
            to={
              currentChannel?.groupTitle
                ? `/dashboard?group=${encodeURIComponent(currentChannel.groupTitle)}`
                : "/dashboard"
            }
            className="text-brand-400 hover:underline"
          >
            Retour aux chaines
          </Link>
        </div>
      </div>
    );
  }

  const formatLabel = (currentChannel?.format || initialFormat || inferFormatFromUrl(currentUrl)).toUpperCase();

  return (
    <div
      ref={playerRootRef}
      className={[
        "fixed inset-0 z-40 flex bg-black select-none",
        cinemaMode ? "bg-black" : "bg-black",
      ].join(" ")}
      onMouseMove={showControls}
      onTouchStart={showControls}
    >
      <div className="flex-1 flex flex-col min-w-0 relative">
        <div
          className={[
            "absolute inset-0",
            cinemaMode ? "bg-[radial-gradient(900px_circle_at_50%_20%,rgba(99,102,241,0.18),transparent_60%)]" : "",
          ].join(" ")}
          aria-hidden="true"
        />

        <button
          type="button"
          onClick={() => {
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
            hideTimerRef.current = null;
            setControlsVisible((v) => {
              const next = !v;
              if (next) showControls();
              return next;
            });
          }}
          className="absolute inset-0 z-[5] cursor-default"
          aria-label="Afficher les controles"
        />

        {videoLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
            <div className="w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : null}

        {error && currentUrl ? (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 bg-red-500/90 text-white px-4 py-2 rounded-xl text-sm border border-red-500/30">
            {error}
          </div>
        ) : null}

        <video
          ref={videoRef}
          className={[
            "w-full h-full flex-1",
            fitMode === "cover" ? "object-cover" : "object-contain",
            cinemaMode ? "bg-black" : "bg-black",
          ].join(" ")}
          autoPlay
          playsInline
          muted={false}
        />

        <div
          className={[
            "absolute top-0 left-0 right-0 z-50 transition-opacity duration-200",
            controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none",
          ].join(" ")}
        >
          <div className="p-3 sm:p-4 bg-gradient-to-b from-black/85 via-black/35 to-transparent">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Link
                  to={
                    currentChannel?.groupTitle
                      ? `/dashboard?group=${encodeURIComponent(currentChannel.groupTitle)}`
                      : "/dashboard"
                  }
                  className="inline-flex items-center gap-2 text-white/90 hover:text-white bg-black/55 hover:bg-black/75 px-3 py-2 rounded-xl transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">Chaines</span>
                </Link>

                {!cinemaMode ? (
                  <button
                    type="button"
                    onClick={() => setSidebarOpen((o) => !o)}
                    className="inline-flex items-center gap-2 text-white/90 hover:text-white bg-black/55 hover:bg-black/75 px-3 py-2 rounded-xl transition lg:hidden"
                    title="Liste"
                  >
                    {sidebarOpen ? <X className="w-5 h-5" /> : <List className="w-5 h-5" />}
                    <span className="hidden sm:inline">Liste</span>
                  </button>
                ) : null}

                {currentChannel ? (
                  <div className="hidden md:flex items-center gap-2 text-white/90 min-w-0">
                    {safeImgUrl(currentChannel.tvgLogo) ? (
                      <img
                        src={safeImgUrl(currentChannel.tvgLogo)}
                        alt=""
                        className="w-8 h-8 rounded-lg object-contain bg-black/40 border border-white/10"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center">
                        <Tv className="w-4 h-4 text-brand-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold truncate leading-tight">{currentChannel.name}</p>
                      <p className="text-xs text-white/60 truncate leading-tight">
                        {currentChannel.groupTitle || "Live"} · {formatLabel}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-black/55 border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-white/85 text-sm font-medium">LIVE</span>
                </div>

                <button
                  type="button"
                  onClick={toggleCinema}
                  className={[
                    "inline-flex items-center gap-2 px-3 py-2 rounded-xl transition border",
                    cinemaMode
                      ? "bg-brand-500/20 border-brand-400/40 text-white"
                      : "bg-black/55 hover:bg-black/75 border-white/10 text-white/90 hover:text-white",
                  ].join(" ")}
                  title="Mode cinema (C)"
                >
                  <Film className="w-5 h-5" />
                  <span className="hidden sm:inline">{cinemaMode ? "Cinema" : "Cinema"}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="inline-flex items-center gap-2 text-white/90 hover:text-white bg-black/55 hover:bg-black/75 px-3 py-2 rounded-xl transition border border-white/10"
                  title="Plein ecran (F)"
                >
                  {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                  <span className="hidden sm:inline">{isFullscreen ? "Quitter" : "Plein ecran"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          className={[
            "absolute bottom-0 left-0 right-0 z-50 transition-opacity duration-200",
            controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none",
          ].join(" ")}
        >
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlayPause}
                  className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white transition"
                  title="Lecture/Pause (Espace)"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>

                <button
                  type="button"
                  onClick={() => playAdjacent(-1)}
                  className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-black/55 hover:bg-black/75 border border-white/10 text-white transition"
                  title="Precedent (Fleche gauche)"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => playAdjacent(1)}
                  className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-black/55 hover:bg-black/75 border border-white/10 text-white transition"
                  title="Suivant (Fleche droite)"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMuted((v) => !v);
                    showControls();
                  }}
                  className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-black/55 hover:bg-black/75 border border-white/10 text-white transition"
                  title="Muet (M)"
                >
                  {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>

                <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-2xl bg-black/40 border border-white/10">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={String(volume)}
                    onChange={(e) => setVolume(clamp01(e.target.value))}
                    className="w-32 accent-brand-400"
                    aria-label="Volume"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFitMode((m) => (m === "contain" ? "cover" : "contain"));
                    showControls();
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-black/55 hover:bg-black/75 border border-white/10 text-white/90 hover:text-white transition"
                  title="Ajuster l'image"
                >
                  <span className="text-xs font-semibold">{fitMode === "cover" ? "REMPLIR" : "AJUSTER"}</span>
                </button>

                {!cinemaMode ? (
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-black/55 hover:bg-black/75 border border-white/10 text-white/90 hover:text-white transition"
                    title="Ouvrir la liste"
                  >
                    <List className="w-4 h-4" />
                    <span className="hidden sm:inline">Liste</span>
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {!cinemaMode && sidebarOpen && (
        <>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute inset-0 bg-black/45 z-30"
            aria-label="Fermer la liste des chaines"
          />
          <aside
            className={[
              "absolute right-0 top-0 bottom-0 z-40 w-[88vw] max-w-sm sm:w-80 md:w-96",
              "lg:static lg:z-auto lg:w-96",
              "flex-shrink-0 flex flex-col bg-brand-900/98 border-l border-brand-700 overflow-hidden",
              "shadow-2xl lg:shadow-none",
            ].join(" ")}
          >
          <div className="p-2 border-b border-brand-700 flex items-center justify-between">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Tv className="w-5 h-5 text-brand-400" />
              Chaines
            </h2>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-gray-400 hover:text-white lg:hidden"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              <input
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Rechercher..."
                className="w-full bg-brand-800 border border-brand-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-sm outline-none"
              />
            </div>

            {filteredChannels.map((ch) => (
              <button
                key={ch.id ?? ch.streamUrl}
                type="button"
                onClick={() => playStream(ch.streamUrl, ch)}
                className={[
                  "w-full flex items-center gap-3 px-3 py-2.5 text-left transition",
                  currentUrl === ch.streamUrl
                    ? "bg-brand-500/30 text-white border-l-2 border-brand-500"
                    : "text-gray-300 hover:bg-brand-800/80",
                ].join(" ")}
              >
                <div className="w-10 h-10 rounded flex-shrink-0 bg-brand-800 flex items-center justify-center overflow-hidden">
                  {safeImgUrl(ch.tvgLogo) ? (
                    <img
                      src={safeImgUrl(ch.tvgLogo)}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Tv className="w-5 h-5 text-brand-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{ch.name || "Chaine"}</p>
                  {ch.groupTitle ? <p className="text-xs text-gray-500 truncate">{ch.groupTitle}</p> : null}
                </div>
              </button>
            ))}

            {paging.hasMore ? (
              <div className="p-3">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="w-full bg-brand-800 hover:bg-brand-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg font-medium"
                >
                  {loadingMore ? "Chargement..." : "Charger plus"}
                </button>
              </div>
            ) : null}
          </div>
          </aside>
        </>
      )}
    </div>
  );
}
