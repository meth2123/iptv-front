import { Link } from "react-router-dom";

export default function SubscriptionBadge() {
  return (
    <p className="text-gray-400 text-sm mt-1">
      Abonnement actif.{" "}
      <Link to="/profile" className="text-brand-400 hover:underline">
        Voir le profil
      </Link>
    </p>
  );
}
