import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, subscription } from "../services/api";
import { Loader2, Calendar, CreditCard, User, Settings, LogOut } from "lucide-react";
import PageShell from "../components/PageShell";
import Panel from "../components/Panel";
import { clearAuth, getUser } from "../services/auth";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [subStatus, setSubStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([auth.profile(), subscription.status()])
      .then(([p, s]) => {
        setProfile(p);
        setSubStatus(s);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="w-full px-4 py-20 flex justify-center">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
      </div>
    );
  }

  const localUser = getUser();
  const user = profile || localUser || {};
  const initials = `${(user.firstname || user.email || "U")[0] || "U"}${(user.lastname || "")[0] || ""}`
    .toUpperCase()
    .slice(0, 2);

  const endDate =
    subStatus?.current?.endDate &&
    new Date(subStatus.current.endDate).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const displayName =
    (user.firstname || user.lastname)
      ? `${user.firstname || ""} ${user.lastname || ""}`.trim()
      : (user.email || "Utilisateur");

  return (
    <PageShell
      title="Profil"
      subtitle="Ton compte, ton abonnement et les raccourcis utiles."
      icon={User}
      right={
        <div className="flex items-center gap-2">
          <Link
            to="/settings"
            className="inline-flex items-center gap-2 bg-brand-800 hover:bg-brand-700 text-white px-3 py-2 rounded-lg text-sm border border-brand-700"
          >
            <Settings className="w-4 h-4" />
            Parametres
          </Link>
          <button
            type="button"
            onClick={() => {
              clearAuth();
              navigate("/");
            }}
            className="inline-flex items-center gap-2 bg-black/30 hover:bg-black/40 text-red-200 px-3 py-2 rounded-lg text-sm border border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            Deconnexion
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
        <Panel className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-900 border border-brand-700 flex items-center justify-center text-white font-bold text-lg">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold truncate">{displayName}</p>
              <p className="text-gray-400 text-sm truncate">{user.email || ""}</p>
              {user.phone ? <p className="text-gray-500 text-sm truncate">{user.phone}</p> : null}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-brand-700 bg-brand-900/40 p-4">
              <div className="flex items-center gap-2 text-gray-300 text-sm">
                <CreditCard className="w-4 h-4 text-brand-400" />
                Abonnement
              </div>
              {subStatus?.hasActiveSubscription ? (
                <div className="mt-2">
                  <p className="text-white font-semibold">{subStatus.current?.planType || "Actif"}</p>
                  <p className="text-gray-400 text-sm">Valide jusqu'au {endDate || "-"}</p>
                </div>
              ) : (
                <div className="mt-2">
                  <p className="text-white font-semibold">Inactif</p>
                  <p className="text-gray-400 text-sm">Aucun abonnement en cours</p>
                </div>
              )}
              <Link to="/subscribe" className="inline-block mt-3 text-brand-400 hover:underline text-sm">
                Gerer l'abonnement
              </Link>
            </div>

            <div className="rounded-xl border border-brand-700 bg-brand-900/40 p-4">
              <div className="flex items-center gap-2 text-gray-300 text-sm">
                <Calendar className="w-4 h-4 text-brand-400" />
                Astuce lecture
              </div>
              <p className="mt-2 text-white font-semibold">Chaine qui ne demarre pas ?</p>
              <p className="text-gray-400 text-sm">
                Certains providers bloquent le HLS. Ton app passe en TS via proxy si besoin.
              </p>
            </div>
          </div>
        </Panel>

        <Panel className="p-6">
          <h2 className="text-white font-semibold mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 gap-3">
            <Link
              to="/dashboard"
              className="rounded-xl border border-brand-700 bg-brand-900/40 p-4 hover:bg-brand-900/60 transition"
            >
              <p className="text-white font-semibold">Ouvrir les chaines</p>
              <p className="text-gray-400 text-sm">Categories, recherche et lecture.</p>
            </Link>
            <Link
              to="/subscribe"
              className="rounded-xl border border-brand-700 bg-brand-900/40 p-4 hover:bg-brand-900/60 transition"
            >
              <p className="text-white font-semibold">Paiement / abonnement</p>
              <p className="text-gray-400 text-sm">Activer, renouveler, verifier l'etat.</p>
            </Link>
            <Link
              to="/settings"
              className="rounded-xl border border-brand-700 bg-brand-900/40 p-4 hover:bg-brand-900/60 transition"
            >
              <p className="text-white font-semibold">Parametres</p>
              <p className="text-gray-400 text-sm">Performance, lecteur, app.</p>
            </Link>
          </div>
        </Panel>
      </div>
    </PageShell>
  );
}

