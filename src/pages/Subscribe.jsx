import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CheckCircle,
  CreditCard,
  Loader2,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import PageShell from "../components/PageShell";
import Panel from "../components/Panel";
import { subscription } from "../services/api";

export default function Subscribe() {
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success") === "1";

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [planType, setPlanType] = useState("ANNUAL");
  const [error, setError] = useState("");

  useEffect(() => {
    subscription
      .status()
      .then(setStatus)
      .catch(() => setStatus(null))
      .finally(() => setLoading(false));
  }, [success]);

  const plans = useMemo(
    () => (Array.isArray(status?.availablePlans) ? status.availablePlans : []),
    [status],
  );

  const annualPlan = plans.find((p) => p.type === "ANNUAL");
  const monthlyPlan = plans.find((p) => p.type === "MONTHLY");

  const selectedPlan =
    planType === "MONTHLY"
      ? (monthlyPlan || annualPlan || null)
      : (annualPlan || monthlyPlan || null);

  const displayLabel = planType === "MONTHLY" ? "Mensuel" : "Annuel";
  const displayPrice =
    selectedPlan?.price != null
      ? `${selectedPlan.price} ${selectedPlan.currency || "XOF"}`
      : "25 000 XOF";

  const handleSubscribe = async () => {
    setError("");
    setCreating(true);
    try {
      const data = await subscription.create({ planType, currency: "XOF" });
      window.location.href = data.paymentUrl;
    } catch (err) {
      setError(err?.message || "Erreur lors de la creation du paiement");
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full px-4 py-20 flex justify-center">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <PageShell
        title="Paiement reussi"
        subtitle="Ton abonnement est actif. Tu peux acceder a toutes les chaines."
        icon={CheckCircle}
      >
        <Panel className="p-6 sm:p-8 max-w-xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold">Abonnement active</p>
              <p className="text-gray-400 text-sm mt-1">
                Si les chaines ne chargent pas, reviens sur le Dashboard et relance une chaine.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-semibold px-5 py-3 transition"
            >
              Ouvrir les chaines
            </Link>
            <Link
              to="/profile"
              className="inline-flex items-center justify-center rounded-xl bg-black/30 hover:bg-black/40 text-white px-5 py-3 border border-brand-700 transition"
            >
              Voir mon profil
            </Link>
          </div>
        </Panel>
      </PageShell>
    );
  }

  if (status?.hasActiveSubscription) {
    const endDate = status.current?.endDate
      ? new Date(status.current.endDate).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "";

    return (
      <PageShell
        title="Abonnement"
        subtitle="Etat de ton abonnement et acces aux chaines."
        icon={CreditCard}
        right={
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-semibold px-4 py-2.5 transition"
          >
            Ouvrir les chaines
          </Link>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-6">
          <Panel className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-900 border border-brand-700 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div className="min-w-0">
                <p className="text-white font-semibold">Abonnement actif</p>
                <p className="text-gray-400 text-sm mt-1">
                  Valide jusqu'au <span className="text-white font-semibold">{endDate || "-"}</span>.
                </p>
                <p className="text-gray-500 text-sm mt-3">
                  Tu peux regarder les chaines sur tes appareils autorises. Evite d'ouvrir trop de lecteurs en meme temps.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: Shield, t: "Paiement", d: "Securise" },
                { icon: Users, t: "Appareils", d: "Selon l'offre" },
                { icon: Zap, t: "Lecture", d: "TS via proxy" },
              ].map((it) => (
                <div key={it.t} className="rounded-xl border border-brand-700 bg-brand-900/40 p-4">
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <it.icon className="w-4 h-4 text-brand-400" />
                    {it.t}
                  </div>
                  <p className="text-white font-semibold mt-2">{it.d}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="p-6">
            <h2 className="text-white font-semibold">Raccourcis</h2>
            <p className="text-gray-400 text-sm mt-2">Accede vite au lecteur et a ton compte.</p>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <Link
                to="/dashboard"
                className="rounded-xl border border-brand-700 bg-brand-900/40 p-4 hover:bg-brand-900/60 transition"
              >
                <p className="text-white font-semibold">Dashboard</p>
                <p className="text-gray-400 text-sm">Categories, recherche, chaines.</p>
              </Link>
              <Link
                to="/profile"
                className="rounded-xl border border-brand-700 bg-brand-900/40 p-4 hover:bg-brand-900/60 transition"
              >
                <p className="text-white font-semibold">Profil</p>
                <p className="text-gray-400 text-sm">Infos compte et etat abonnement.</p>
              </Link>
              <Link
                to="/settings"
                className="rounded-xl border border-brand-700 bg-brand-900/40 p-4 hover:bg-brand-900/60 transition"
              >
                <p className="text-white font-semibold">Parametres</p>
                <p className="text-gray-400 text-sm">Performance et lecteur.</p>
              </Link>
            </div>
          </Panel>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Abonnement"
      subtitle="Active ton acces. Paiement mobile money et carte."
      icon={CreditCard}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-6">
        <Panel className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-white font-semibold">Choisir un plan</p>
              <p className="text-gray-400 text-sm mt-1">
                Paiement securise (Orange Money, MTN, Wave, Moov, carte).
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
              <Shield className="w-4 h-4 text-brand-400" />
              Fedapay
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            <button
              type="button"
              onClick={() => setPlanType("ANNUAL")}
              className={[
                "text-left rounded-2xl border p-5 transition",
                planType === "ANNUAL"
                  ? "border-brand-400 bg-brand-900/45"
                  : "border-brand-700 bg-brand-900/30 hover:bg-brand-900/45",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-white font-semibold">Annuel</p>
                  <p className="text-gray-400 text-sm mt-1">Le meilleur prix sur l'annee.</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-lg">
                    {annualPlan?.price != null ? `${annualPlan.price}` : "25 000"}{" "}
                    <span className="text-gray-400 font-normal text-sm">
                      {annualPlan?.currency || "XOF"}
                    </span>
                  </p>
                  <p className="text-gray-500 text-xs">par an</p>
                </div>
              </div>
            </button>

            {monthlyPlan ? (
              <button
                type="button"
                onClick={() => setPlanType("MONTHLY")}
                className={[
                  "text-left rounded-2xl border p-5 transition",
                  planType === "MONTHLY"
                    ? "border-brand-400 bg-brand-900/45"
                    : "border-brand-700 bg-brand-900/30 hover:bg-brand-900/45",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-white font-semibold">Mensuel</p>
                    <p className="text-gray-400 text-sm mt-1">Flexible, renouvellement chaque mois.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-lg">
                      {monthlyPlan.price}{" "}
                      <span className="text-gray-400 font-normal text-sm">
                        {monthlyPlan.currency || "XOF"}
                      </span>
                    </p>
                    <p className="text-gray-500 text-xs">par mois</p>
                  </div>
                </div>
              </button>
            ) : null}
          </div>

          {error ? (
            <div className="mt-5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 px-4 py-3 text-sm">
              {error}
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleSubscribe}
            disabled={creating}
            className="mt-6 w-full rounded-xl bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white font-semibold py-3 transition flex items-center justify-center gap-2"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirection vers le paiement...
              </>
            ) : (
              `Payer (${displayLabel} - ${displayPrice})`
            )}
          </button>

          <p className="mt-4 text-gray-500 text-xs">
            Tu seras redirige vers Fedapay pour finaliser le paiement.
          </p>
        </Panel>

        <Panel className="p-6 sm:p-8">
          <p className="text-white font-semibold">Inclus</p>
          <p className="text-gray-400 text-sm mt-2">
            Une experience type app, optimisee pour mobile et navigateur.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-3">
            {[
              {
                icon: Zap,
                t: "Lecture plus robuste",
                d: "Si HLS bloque, le lecteur peut passer en TS via proxy.",
              },
              {
                icon: Users,
                t: "Multi appareils",
                d: "Selon ton offre et la limite du provider.",
              },
              {
                icon: Shield,
                t: "Paiement securise",
                d: "Mobile money + carte via Fedapay.",
              },
            ].map((it) => (
              <div key={it.t} className="rounded-xl border border-brand-700 bg-brand-900/40 p-4">
                <div className="flex items-center gap-2 text-gray-200 text-sm">
                  <it.icon className="w-4 h-4 text-brand-400" />
                  <span className="text-white font-semibold">{it.t}</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">{it.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <Link to="/profile" className="text-brand-400 hover:underline text-sm">
              Voir mon profil
            </Link>
            <Link to="/dashboard" className="text-gray-400 hover:text-white text-sm">
              Aller au dashboard
            </Link>
          </div>
        </Panel>
      </div>
    </PageShell>
  );
}

