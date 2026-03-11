import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Tv, User, LogOut, LayoutDashboard, Settings, Star, Film } from "lucide-react";
import { isAuthenticated, clearAuth } from "../services/auth";
import { AnimatePresence, motion } from "framer-motion";
import BottomNav from "./BottomNav";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const authenticated = isAuthenticated();

  const isPlayer = location.pathname.startsWith("/watch");
  const isAuth =
    location.pathname.startsWith("/login") || location.pathname.startsWith("/register");
  const showBottomNav = authenticated && !isPlayer;

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {!isPlayer && (
        <header className="sticky top-0 z-50 bg-brand-900/98 border-b border-brand-700">
          <div className="container mx-auto px-4 h-14 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-brand-400 font-bold text-xl tracking-tight">
              <Tv className="w-7 h-7" />
              <span className="hidden sm:inline">PrismPlay</span>
            </Link>
            <nav className="flex items-center gap-4">
              {authenticated ? (
                <>
                  <Link to="/dashboard" className="hidden sm:flex items-center gap-2 text-gray-300 hover:text-white transition">
                    <LayoutDashboard className="w-4 h-4" />
                    Chaines
                  </Link>
                  <Link to="/settings" className="hidden sm:flex items-center gap-2 text-gray-300 hover:text-white transition">
                    <Settings className="w-4 h-4" />
                    Parametres
                  </Link>
                  <Link to="/subscribe" className="hidden sm:inline text-gray-300 hover:text-white transition">
                    Abonnement
                  </Link>
                  <Link to="/favorites" className="hidden sm:flex items-center gap-2 text-gray-300 hover:text-white transition">
                    <Star className="w-4 h-4" />
                    Favoris
                  </Link>
                  <Link to="/series" className="hidden sm:flex items-center gap-2 text-gray-300 hover:text-white transition">
                    <Film className="w-4 h-4" />
                    Series
                  </Link>
                  <Link to="/profile" className="hidden sm:flex items-center gap-2 text-gray-300 hover:text-white transition">
                    <User className="w-4 h-4" />
                    Profil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="hidden sm:flex items-center gap-2 text-gray-400 hover:text-red-400 transition"
                    type="button"
                  >
                    <LogOut className="w-4 h-4" />
                    Deconnexion
                  </button>

                  <Link
                    to="/settings"
                    className="sm:hidden flex items-center gap-2 text-gray-300 hover:text-white transition"
                    aria-label="Parametres"
                    title="Parametres"
                  >
                    <Settings className="w-5 h-5" />
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-300 hover:text-white transition">
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="bg-brand-500 hover:bg-brand-400 text-white px-4 py-2 rounded-lg font-medium transition"
                  >
                    S'inscrire
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>
      )}

      <main
        className={[
          "flex-1",
          showBottomNav ? "pb-[calc(72px+env(safe-area-inset-bottom))]" : "",
        ].join(" ")}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname + location.search}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {!isPlayer && !isAuth && (
        <footer className="border-t border-brand-700 py-6 text-center text-gray-500 text-sm">
          (c) PrismPlay - Paiement securise en FCFA (Orange Money, MTN, Wave...)
        </footer>
      )}

      {showBottomNav && <BottomNav />}
    </div>
  );
}
