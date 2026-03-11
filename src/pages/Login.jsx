import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { auth } from "../services/api";
import { setAuth } from "../services/auth";
import { Eye, EyeOff, Lock, Mail, Tv, Zap, Shield, Film } from "lucide-react";
import Panel from "../components/Panel";

export default function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(
    () => identifier.trim().length > 0 && password.length > 0,
    [identifier, password],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setLoading(true);
    try {
      const data = await auth.login({ email: identifier.trim(), password });
      setAuth(data.token, data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err?.message || "Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="w-full min-h-[calc(100vh-56px)] px-4 sm:px-6 lg:px-10 py-8 sm:py-10 flex items-stretch
        bg-[radial-gradient(1200px_circle_at_10%_-10%,rgba(99,102,241,0.18),transparent_50%),radial-gradient(1000px_circle_at_90%_10%,rgba(16,185,129,0.12),transparent_55%)]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6 items-stretch">
        <div className="rounded-3xl border border-brand-700 bg-gradient-to-br from-brand-900 via-brand-900/60 to-brand-800/25 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-brand-400 font-bold tracking-tight">
              <Tv className="w-6 h-6" />
              <span className="text-lg">PrismPlay</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mt-5">Bon retour.</h1>
            <p className="text-gray-300/90 mt-3 max-w-xl">
              Connecte-toi pour acceder aux chaines, au lecteur et a ton abonnement.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { Icon: Film, t: "Mode cinema", d: "Plein ecran propre" },
              { Icon: Zap, t: "Lecture robuste", d: "TS via proxy" },
              { Icon: Shield, t: "Paiement", d: "Mobile money + carte" },
              { Icon: Tv, t: "Categories", d: "Navigation type app" },
            ].map((it) => (
              <div key={it.t} className="rounded-2xl border border-brand-700 bg-brand-800/35 p-4">
                <div className="flex items-center gap-2 text-gray-200 text-sm">
                  <it.Icon className="w-4 h-4 text-brand-400" />
                  <span className="font-semibold text-white">{it.t}</span>
                </div>
                <p className="text-gray-400 text-xs mt-2">{it.d}</p>
              </div>
            ))}
          </div>
        </div>

        <Panel className="p-7 sm:p-9 lg:p-10 flex flex-col justify-center">
          <div className="mb-7">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Connexion</h2>
            <p className="text-gray-400 mt-2">Accede a ton compte et tes chaines.</p>
          </div>

          {error ? (
            <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 px-4 py-3 text-sm">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email ou telephone
              </label>
              <div className="flex items-center gap-2 bg-brand-900 border border-brand-700 rounded-xl px-3 py-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
                  placeholder="vous@exemple.com ou +221..."
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Mot de passe</label>
              <div className="flex items-center gap-2 bg-brand-900 border border-brand-700 rounded-xl px-3 py-3">
                <Lock className="w-4 h-4 text-gray-500" />
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
                  placeholder="Mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="text-gray-400 hover:text-white"
                  aria-label="Afficher/masquer"
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !canSubmit}
              className="w-full rounded-xl bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white font-semibold py-3.5 transition"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <p className="mt-7 text-center text-gray-400 text-sm">
            Pas de compte ?{" "}
            <Link to="/register" className="text-brand-400 hover:underline">
              S'inscrire
            </Link>
          </p>
        </Panel>
      </div>
    </motion.div>
  );
}
