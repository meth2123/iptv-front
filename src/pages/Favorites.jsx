import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Star, Trash2 } from "lucide-react";
import ChannelCard from "../components/ChannelCard";
import PageShell from "../components/PageShell";
import Panel from "../components/Panel";
import {
  clearFavorites,
  getFavorites,
  onFavoritesUpdated,
} from "../services/favorites.service";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("");
  const [sort, setSort] = useState("recent");

  useEffect(() => {
    setFavorites(getFavorites());
    return onFavoritesUpdated((list) => setFavorites(list || []));
  }, []);

  const groups = useMemo(() => {
    const set = new Set();
    for (const f of favorites) {
      if (f.groupTitle) set.add(f.groupTitle);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [favorites]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = favorites.filter((f) => {
      const okGroup = !group || f.groupTitle === group;
      if (!okGroup) return false;
      if (!q) return true;
      return (
        String(f.name || "").toLowerCase().includes(q) ||
        String(f.groupTitle || "").toLowerCase().includes(q)
      );
    });

    list = [...list];
    if (sort === "name") {
      list.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
    } else if (sort === "group") {
      list.sort((a, b) => String(a.groupTitle || "").localeCompare(String(b.groupTitle || "")));
    } else {
      list.sort((a, b) => Number(b.addedAt || 0) - Number(a.addedAt || 0));
    }
    return list;
  }, [favorites, search, group, sort]);

  return (
    <PageShell
      title="Favoris"
      subtitle="Tes chaines preferees dans une page dediee."
      icon={Star}
      right={
        favorites.length > 0 ? (
          <button
            type="button"
            onClick={() => clearFavorites()}
            className="inline-flex items-center gap-2 bg-black/30 hover:bg-black/45 text-white px-3 py-2 rounded-lg text-sm border border-brand-700"
          >
            <Trash2 className="w-4 h-4" />
            Vider tout
          </button>
        ) : null
      }
    >
      <Panel className="p-4 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_180px] gap-3">
          <div className="flex items-center gap-2 bg-brand-800 border border-brand-600 rounded-lg px-3 py-2 text-white">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un favori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none placeholder-gray-500"
            />
          </div>
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="bg-brand-800 border border-brand-600 rounded-lg px-3 py-2 text-white"
          >
            <option value="">Toutes categories</option>
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-brand-800 border border-brand-600 rounded-lg px-3 py-2 text-white"
          >
            <option value="recent">Tri: Recent</option>
            <option value="name">Tri: Nom</option>
            <option value="group">Tri: Categorie</option>
          </select>
        </div>
      </Panel>

      <div className="mt-5">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
            {filtered.map((ch, i) => (
              <motion.div
                key={`${ch.streamUrl}-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.01, 0.18) }}
              >
                <ChannelCard channel={ch} streamUrl={ch.streamUrl} refreshOnClick />
              </motion.div>
            ))}
          </div>
        ) : (
          <Panel className="p-8 text-center">
            <Star className="w-8 h-8 text-gray-500 mx-auto mb-3" />
            <p className="text-white font-semibold">Aucun favori</p>
            <p className="text-gray-400 text-sm mt-2">
              Ajoute des chaines avec l'etoile pour les retrouver ici.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex mt-4 bg-brand-500 hover:bg-brand-400 text-white px-4 py-2 rounded-lg"
            >
              Aller au dashboard
            </Link>
          </Panel>
        )}
      </div>
    </PageShell>
  );
}
