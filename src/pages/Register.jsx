import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { auth } from "../services/api";
import { setAuth } from "../services/auth";
import { Eye, EyeOff, Mail, Lock, Phone, User, Tv, Shield, Zap } from "lucide-react";
import Panel from "../components/Panel";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    country: "SN",
    password: "",
  });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return form.email.trim().length > 3 && form.password.length >= 6;
  }, [form.email, form.password]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setLoading(true);
    try {
      const data = await auth.register({
        ...form,
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
      });
      setAuth(data.token, data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="w-full min-h-[calc(100vh-56px)] px-4 sm:px-6 lg:px-10 py-8 sm:py-10 flex items-stretch
        bg-[radial-gradient(1200px_circle_at_10%_-10%,rgba(99,102,241,0.16),transparent_50%),radial-gradient(1000px_circle_at_90%_10%,rgba(245,158,11,0.10),transparent_55%)]"
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
            <h1 className="text-3xl sm:text-4xl font-bold text-white mt-5">Cree ton compte.</h1>
            <p className="text-gray-300/90 mt-3 max-w-xl">
              Acces au lecteur, categories, recherche, et paiement en FCFA.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { Icon: Zap, t: "Rapide", d: "Navigation type app" },
              { Icon: Shield, t: "Securise", d: "Compte + paiement" },
              { Icon: Tv, t: "Live", d: "Chaines et categories" },
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

        <Panel className="p-7 sm:p-9 lg:p-10">
          <div className="mb-7">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Inscription</h2>
            <p className="text-gray-400 mt-2">Cree ton compte pour acceder aux chaines.</p>
          </div>

          {error ? (
            <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 px-4 py-3 text-sm">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Prenom</label>
                <div className="flex items-center gap-2 bg-brand-900 border border-brand-700 rounded-xl px-3 py-3">
                  <User className="w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    name="firstname"
                    value={form.firstname}
                    onChange={handleChange}
                    className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
                    placeholder="Prenom"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nom</label>
                <div className="flex items-center gap-2 bg-brand-900 border border-brand-700 rounded-xl px-3 py-3">
                  <User className="w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    name="lastname"
                    value={form.lastname}
                    onChange={handleChange}
                    className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
                    placeholder="Nom"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email *</label>
              <div className="flex items-center gap-2 bg-brand-900 border border-brand-700 rounded-xl px-3 py-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
                  placeholder="vous@exemple.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Telephone</label>
                <div className="flex items-center gap-2 bg-brand-900 border border-brand-700 rounded-xl px-3 py-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
                    placeholder="+221 77 123 45 67"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Pays</label>
                <select
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  className="w-full bg-brand-900 border border-brand-700 rounded-xl px-4 py-3 text-white"
                >
                  <option value="SN">Senegal</option>
                  <option value="CI">Cote d'Ivoire</option>
                  <option value="ML">Mali</option>
                  <option value="BJ">Benin</option>
                  <option value="TG">Togo</option>
                  <option value="CM">Cameroun</option>
                  <option value="GA">Gabon</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Mot de passe *</label>
              <div className="flex items-center gap-2 bg-brand-900 border border-brand-700 rounded-xl px-3 py-3">
                <Lock className="w-4 h-4 text-gray-500" />
                <input
                  type={show ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
                  placeholder="Min 6 caracteres"
                  minLength={6}
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
              <p className="text-xs text-gray-500 mt-2">
                En t'inscrivant, tu acceptes les conditions d'utilisation.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !canSubmit}
              className="w-full rounded-xl bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white font-semibold py-3.5 transition"
            >
              {loading ? "Inscription..." : "Creer mon compte"}
            </button>
          </form>

          <p className="mt-7 text-center text-gray-400 text-sm">
            Deja un compte ?{" "}
            <Link to="/login" className="text-brand-400 hover:underline">
              Se connecter
            </Link>
          </p>
        </Panel>
      </div>
    </motion.div>
  );
}
