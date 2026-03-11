import { NavLink } from "react-router-dom";
import { LayoutDashboard, CreditCard, User, Settings, Star, Film } from "lucide-react";

const items = [
  { to: "/dashboard", label: "Chaines", icon: LayoutDashboard },
  { to: "/favorites", label: "Favoris", icon: Star },
  { to: "/series", label: "Series", icon: Film },
  { to: "/subscribe", label: "Abonnement", icon: CreditCard },
  { to: "/profile", label: "Profil", icon: User },
  { to: "/settings", label: "Params", icon: Settings },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-brand-700 bg-brand-900/95 backdrop-blur supports-[backdrop-filter]:bg-brand-900/80"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto max-w-3xl px-2">
        <div className="grid grid-cols-6">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                [
                  "flex flex-col items-center justify-center gap-1 py-2 text-[11px] transition",
                  isActive ? "text-brand-400" : "text-gray-400 hover:text-white",
                ].join(" ")
              }
              end={it.to === "/dashboard"}
            >
              <it.icon className="w-5 h-5" />
              <span>{it.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
