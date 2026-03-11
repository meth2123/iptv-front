import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Play,
  Tv,
  Check,
  Sparkles,
  ShieldCheck,
  Smartphone,
  Zap,
  CreditCard,
  Headphones,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { isAuthenticated } from "../services/auth";

const liveNow = [
  { name: "Canal Sport 1", tag: "Sport", color: "from-emerald-400/25 to-cyan-400/20" },
  { name: "Action Movies HD", tag: "Films", color: "from-orange-400/25 to-rose-400/20" },
  { name: "News 24 Afrique", tag: "Info", color: "from-indigo-400/25 to-sky-400/20" },
  { name: "Kids Play", tag: "Kids", color: "from-fuchsia-400/20 to-violet-400/20" },
  { name: "Premier League Live", tag: "Sport", color: "from-lime-400/20 to-emerald-400/20" },
  { name: "Cinema Max", tag: "Films", color: "from-amber-400/20 to-red-400/20" },
  { name: "Music World", tag: "Music", color: "from-cyan-400/20 to-blue-400/20" },
  { name: "Documentaire Plus", tag: "Docu", color: "from-slate-300/20 to-indigo-400/20" },
];

const benefits = [
  {
    icon: Zap,
    title: "Lecture rapide",
    desc: "Demarrage optimisé via proxy et flux adaptés au web.",
  },
  {
    icon: ShieldCheck,
    title: "Paiement sécurisé",
    desc: "Mobile money et carte, avec validation fiable.",
  },
  {
    icon: Smartphone,
    title: "Multi-appareils",
    desc: "TV, smartphone, tablette et ordinateur.",
  },
];

const steps = [
  {
    n: "01",
    icon: Tv,
    title: "Créer ton compte",
    desc: "Inscription en quelques secondes.",
  },
  {
    n: "02",
    icon: CreditCard,
    title: "Activer l'abonnement",
    desc: "Paiement simple en FCFA.",
  },
  {
    n: "03",
    icon: Play,
    title: "Regarder en direct",
    desc: "Accès immédiat aux chaînes.",
  },
];

const faqs = [
  {
    q: "Sur combien d'appareils je peux regarder ?",
    a: "Selon ton offre. Tu peux définir une limite pour éviter les connexions simultanées excessives.",
  },
  {
    q: "Le paiement est-il sécurisé ?",
    a: "Oui, le paiement passe par un provider sécurisé et ton abonnement s'active automatiquement après confirmation.",
  },
  {
    q: "Pourquoi certaines chaînes démarrent lentement ?",
    a: "Certaines sources sont instables. PrismPlay optimise le démarrage via proxy et format de flux adapté.",
  },
  {
    q: "Est-ce que ça marche sur mobile ?",
    a: "Oui, l'interface est responsive et pensée pour un usage app-like sur téléphone.",
  },
  {
    q: "Comment contacter le support ?",
    a: "Depuis ton espace profil/paramètres ou via l'email de support de la plateforme.",
  },
];

export default function Home() {
  const authed = isAuthenticated();

  return (
    <div className="min-h-screen">
      <section className="relative h-[85vh] min-h-[500px] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(1100px_circle_at_18%_10%,rgba(45,212,191,0.16),transparent_56%),radial-gradient(950px_circle_at_82%_20%,rgba(99,102,241,0.18),transparent_60%),linear-gradient(160deg,#070b15_0%,#0b1220_42%,#121a2f_100%)]" />
        <div className="absolute inset-0 z-0 opacity-[0.10] [background-image:linear-gradient(rgba(255,255,255,0.45)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.45)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-cyan-400/10 blur-3xl z-0" />
        <div className="absolute -bottom-28 right-0 w-[28rem] h-[28rem] rounded-full bg-indigo-500/15 blur-3xl z-0" />
        <div className="absolute inset-0 z-[6] hidden lg:flex items-center justify-center px-8 pointer-events-none">
          <div className="relative w-[min(92vw,1200px)] aspect-[16/9] rounded-[2.2rem] border border-white/15 bg-black/55 shadow-[0_40px_120px_rgba(0,0,0,0.75)] overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(11,18,32,0.92),rgba(14,25,44,0.76),rgba(8,12,20,0.95))]" />
            <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.22)_1px,transparent_1px)] [background-size:36px_36px]" />
            <div className="absolute inset-x-0 top-0 h-14 bg-black/45 border-b border-white/10 flex items-center px-5">
              <span className="text-xs tracking-[0.22em] uppercase text-white/70">PrismPlay</span>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[clamp(3.2rem,9vw,8rem)] font-black tracking-[0.10em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-indigo-300 drop-shadow-[0_0_26px_rgba(103,232,249,0.28)]">
                PRISMPLAY
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/85 to-transparent" />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-950/95 via-brand-900/80 to-transparent z-10" />
        <div className="container mx-auto px-4 pb-20 pt-32 relative z-20">
          <motion.div
            className="max-w-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-brand-400 font-semibold text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              PrismPlay - TV en direct
            </p>
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-4">
              Vos chaines preferees.
              <br />
              <span className="text-brand-400">Un seul abonnement.</span>
            </h1>
            <p className="text-lg text-gray-400 mb-8 max-w-xl">
              HD / Full HD, 3 appareils, support client. Paiement en FCFA par Orange Money, MTN,
              Wave.
            </p>
            <div className="flex flex-wrap gap-4">
              {authed ? (
                <>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white font-semibold px-8 py-4 rounded-lg transition shadow-lg shadow-brand-500/20"
                  >
                    <Play className="w-5 h-5" />
                    Ouvrir les chaines
                  </Link>
                  <Link
                    to="/settings"
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-lg transition border border-white/20"
                  >
                    Parametres
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white font-semibold px-8 py-4 rounded-lg transition shadow-lg shadow-brand-500/20"
                  >
                    <Play className="w-5 h-5" />
                    Commencer
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-lg transition border border-white/20"
                  >
                    J'ai deja un compte
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold text-white">Top chaines en ce moment</h2>
          <Link to={authed ? "/dashboard" : "/register"} className="text-brand-400 hover:text-brand-300 text-sm inline-flex items-center gap-1">
            Voir tout <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
          {liveNow.map((ch, i) => (
            <motion.div
              key={ch.name}
              className="snap-start min-w-[230px] max-w-[230px] rounded-2xl border border-brand-700 bg-brand-800/45 overflow-hidden"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
            >
              <div className={`h-28 bg-gradient-to-br ${ch.color} p-3 flex items-start justify-between`}>
                <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-black/30 border border-white/10 text-white/90">
                  {ch.tag}
                </span>
                <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-red-500/80 text-white">
                  LIVE
                </span>
              </div>
              <div className="p-3">
                <p className="text-white font-semibold truncate">{ch.name}</p>
                <p className="text-gray-400 text-sm mt-1">Disponible sur PrismPlay</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-white mb-6">Pourquoi PrismPlay</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {benefits.map((item, i) => (
            <motion.div
              key={item.title}
              className="rounded-2xl border border-brand-700 bg-brand-800/55 p-6"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <item.icon className="w-10 h-10 text-brand-400 mb-4" />
              <h3 className="text-white text-xl font-semibold">{item.title}</h3>
              <p className="text-gray-400 mt-2">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-white mb-6">Comment ca marche</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {steps.map((step, i) => (
            <motion.div
              key={step.n}
              className="rounded-2xl border border-brand-700 bg-black/25 p-6"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="flex items-center justify-between">
                <span className="text-brand-300 font-bold tracking-widest">{step.n}</span>
                <step.icon className="w-5 h-5 text-brand-400" />
              </div>
              <p className="text-white font-semibold text-lg mt-4">{step.title}</p>
              <p className="text-gray-400 mt-2">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-white mb-5 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-brand-400" />
          Questions frequentes
        </h2>
        <div className="grid grid-cols-1 gap-3">
          {faqs.map((item) => (
            <details key={item.q} className="rounded-xl border border-brand-700 bg-brand-800/45 p-4 open:bg-brand-800/60">
              <summary className="cursor-pointer list-none text-white font-semibold">
                {item.q}
              </summary>
              <p className="text-gray-400 mt-3">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-white mb-8">Inclus dans l'abonnement</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Tv, title: "Toutes les chaines", desc: "Sport, films, info, divertissement en direct" },
            { icon: Check, title: "3 appareils", desc: "TV, smartphone, tablette en meme temps" },
            { icon: Sparkles, title: "HD / Full HD", desc: "Qualite optimale et mises a jour gratuites" },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              className="card-prime rounded-xl bg-brand-800/60 border border-brand-700 p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <item.icon className="w-12 h-12 text-brand-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-gray-400">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {!authed && (
        <section className="border-t border-brand-700 py-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-3xl font-bold text-white mb-2">
              25 000 <span className="text-brand-400 font-normal">FCFA</span>
              <span className="text-lg font-normal text-gray-400"> / an</span>
            </p>
            <p className="text-gray-400 mb-6">
              Paiement securise · Orange Money, MTN, Wave, carte
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-brand-orange hover:bg-amber-500 text-black font-semibold px-8 py-4 rounded-lg transition"
              >
                S'abonner maintenant
              </Link>
              <span className="inline-flex items-center gap-2 text-gray-400 text-sm">
                <Headphones className="w-4 h-4" />
                Support client inclus
              </span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

