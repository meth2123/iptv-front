import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Settings as SettingsIcon, Monitor, Tv, Smartphone, RotateCcw } from "lucide-react";
import PageShell from "../components/PageShell";
import Panel from "../components/Panel";

const PREFS_KEY = "iptv_prefs_v1";

function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePrefs(prefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs || {}));
}

export default function Settings() {
  const [prefs, setPrefs] = useState(() => loadPrefs());

  useEffect(() => {
    savePrefs(prefs);
  }, [prefs]);

  const pageSize = Number(prefs.channelsPageSize || 500);
  const autoFullscreen = !!prefs.playerAutoFullscreen;

  return (
    <PageShell
      title="Parametres"
      subtitle="Ajuste la performance, l'affichage et le lecteur."
      icon={SettingsIcon}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] gap-6">
        <Panel className="p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Tv className="w-4 h-4 text-brand-400" />
            Chaines
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-brand-700 bg-brand-900/40 p-4">
              <p className="text-gray-300 text-sm mb-2">Taille de page</p>
              <select
                value={String(pageSize)}
                onChange={(e) =>
                  setPrefs((p) => ({ ...p, channelsPageSize: Number(e.target.value) }))
                }
                className="w-full bg-brand-900 border border-brand-700 rounded-lg px-4 py-2 text-white"
              >
                <option value="200">200 (rapide)</option>
                <option value="500">500</option>
                <option value="1000">1000</option>
                <option value="2000">2000 (lourd)</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Si ton telephone rame, baisse a 200 ou 500.
              </p>
            </div>

            <div className="rounded-xl border border-brand-700 bg-brand-900/40 p-4">
              <p className="text-gray-300 text-sm mb-2">Recherche</p>
              <p className="text-gray-400 text-sm">
                Utilise l'onglet Recherche (barre du bas) pour trouver une chaine rapidement.
              </p>
              <Link to="/dashboard?focus=search" className="inline-block mt-3 text-brand-400 hover:underline text-sm">
                Ouvrir la recherche
              </Link>
            </div>
          </div>
        </Panel>

        <Panel className="p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Monitor className="w-4 h-4 text-brand-400" />
            Lecteur
          </h2>

          <div className="rounded-xl border border-brand-700 bg-brand-900/40 p-4">
            <label className="flex items-start gap-3 text-sm text-gray-200">
              <input
                type="checkbox"
                checked={autoFullscreen}
                onChange={(e) =>
                  setPrefs((p) => ({ ...p, playerAutoFullscreen: e.target.checked }))
                }
                className="mt-1"
              />
              <span>
                <span className="text-white font-semibold block">Plein ecran automatique</span>
                <span className="text-gray-400 block">
                  Sur mobile, le navigateur peut bloquer. Utilise le bouton Plein ecran dans le lecteur.
                </span>
              </span>
            </label>
          </div>

          <div className="rounded-xl border border-brand-700 bg-brand-900/40 p-4 mt-4">
            <div className="flex items-center gap-2 text-gray-300 text-sm">
              <Smartphone className="w-4 h-4 text-brand-400" />
              Mode app
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Dans Chrome: menu puis "Installer l'application" pour un rendu comme une vraie app.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              localStorage.removeItem(PREFS_KEY);
              setPrefs({});
            }}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-black/30 hover:bg-black/40 text-white px-4 py-3 rounded-xl border border-brand-700"
          >
            <RotateCcw className="w-4 h-4" />
            Reinitialiser les parametres
          </button>
        </Panel>
      </div>
    </PageShell>
  );
}

