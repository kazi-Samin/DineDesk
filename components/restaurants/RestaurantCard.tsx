import { Restaurant } from "@/types/restaurant";

interface RestaurantCardProps {
  restaurant: Restaurant;
  viewMode?: "grid" | "list";
}

export default function RestaurantCard({ restaurant, viewMode = "grid" }: RestaurantCardProps) {
  if (viewMode === "list") {
    return (
      <article
        className={`group bg-surface-container-lowest border border-outline-variant hover:border-primary-container rounded flex flex-col md:flex-row transition-all duration-200 overflow-hidden ${
          !restaurant.isOpen ? "opacity-95" : ""
        }`}
      >
        <div className="relative w-full md:w-72 aspect-[4/3] md:aspect-auto shrink-0 bg-surface-container-high overflow-hidden">
          <img
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
              !restaurant.isOpen ? "grayscale-[30%]" : ""
            }`}
            alt={restaurant.imageAlt}
            src={restaurant.image}
          />
          {!restaurant.isOpen && <div className="absolute inset-0 bg-inverse-surface/20"></div>}
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur-sm border border-outline-variant/60 font-label-sm text-[11px] font-semibold text-primary">
            <span className="material-symbols-outlined text-[14px] text-amber-600" style={{ fontVariationSettings: "'FILL' 1" }}>
              star
            </span>
            <span>{restaurant.rating.toFixed(1)}</span>
            <span className="text-on-surface-variant font-normal">({restaurant.reviewCount}+)</span>
          </div>
          {restaurant.badge && (
            <div
              className={`absolute top-2 right-2 px-2 py-0.5 rounded font-label-sm text-[10px] tracking-wider uppercase font-semibold ${
                restaurant.badge === "Heritage"
                  ? "bg-primary-container text-on-primary"
                  : "bg-surface-container-lowest/90 backdrop-blur-sm border border-outline-variant/60 text-primary"
              }`}
            >
              {restaurant.badge}
            </div>
          )}
          {restaurant.closedNotice && (
            <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-surface-container-lowest border border-secondary text-secondary font-label-sm text-[11px] font-semibold flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              <span>{restaurant.closedNotice}</span>
            </div>
          )}
        </div>
        <div className="p-space-md flex flex-col flex-1 justify-between gap-space-sm">
          <div>
            <div className="flex items-baseline justify-between gap-space-xs">
              <h3 className="font-headline-sm text-lg text-on-surface group-hover:text-primary transition-colors">
                {restaurant.name}
              </h3>
            </div>
            <div className="flex items-center gap-2 mt-1 text-on-surface-variant font-body-sm text-[13px]">
              <span>{restaurant.cuisine}</span>
              <span>•</span>
              <span className="text-on-surface font-medium">{restaurant.priceTier}</span>
            </div>
          </div>
          <div className="pt-space-xs border-t border-outline-variant/50 flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">
                {restaurant.isOpen ? "schedule" : "lock_clock"}
              </span>{" "}
              {restaurant.deliveryTime}
            </span>
            <span className="flex items-center gap-1 text-primary">
              <span className="material-symbols-outlined text-sm">
                {restaurant.isOpen ? "moped" : "restaurant"}
              </span>{" "}
              {restaurant.deliveryFee}
            </span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`group bg-surface-container-lowest border border-outline-variant hover:border-primary-container rounded flex flex-col transition-all duration-200 overflow-hidden ${
        !restaurant.isOpen ? "opacity-95" : ""
      }`}
    >
      <div className="relative w-full aspect-[4/3] bg-surface-container-high overflow-hidden">
        <img
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
            !restaurant.isOpen ? "grayscale-[30%]" : ""
          }`}
          alt={restaurant.imageAlt}
          src={restaurant.image}
        />
        {!restaurant.isOpen && <div className="absolute inset-0 bg-inverse-surface/20"></div>}
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur-sm border border-outline-variant/60 font-label-sm text-[11px] font-semibold text-primary">
          <span className="material-symbols-outlined text-[14px] text-amber-600" style={{ fontVariationSettings: "'FILL' 1" }}>
            star
          </span>
          <span>{restaurant.rating.toFixed(1)}</span>
          <span className="text-on-surface-variant font-normal">({restaurant.reviewCount}+)</span>
        </div>
        {restaurant.badge && (
          <div
            className={`absolute top-2 right-2 px-2 py-0.5 rounded font-label-sm text-[10px] tracking-wider uppercase font-semibold ${
              restaurant.badge === "Heritage"
                ? "bg-primary-container text-on-primary"
                : restaurant.badge === "Chef's Table"
                ? "bg-surface-container-lowest/90 backdrop-blur-sm border border-outline-variant/60 text-primary-container"
                : "bg-surface-container-lowest/90 backdrop-blur-sm border border-outline-variant/60 text-primary"
            }`}
          >
            {restaurant.badge}
          </div>
        )}
        {restaurant.id === "osteria-bella" && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-label-sm text-[10px] font-semibold tracking-wide">
            Live Woodfire Oven
          </div>
        )}
        {restaurant.closedNotice && (
          <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-surface-container-lowest border border-secondary text-secondary font-label-sm text-[11px] font-semibold flex items-center gap-1 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            <span>{restaurant.closedNotice}</span>
          </div>
        )}
      </div>
      <div className="p-space-md flex flex-col flex-1 justify-between gap-space-sm">
        <div>
          <div className="flex items-baseline justify-between gap-space-xs">
            <h3 className="font-headline-sm text-lg text-on-surface group-hover:text-primary transition-colors truncate">
              {restaurant.name}
            </h3>
          </div>
          <div className="flex items-center gap-2 mt-1 text-on-surface-variant font-body-sm text-[13px]">
            <span>{restaurant.cuisine}</span>
            <span>•</span>
            <span className="text-on-surface font-medium">{restaurant.priceTier}</span>
          </div>
        </div>
        <div className="pt-space-xs border-t border-outline-variant/50 flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">
              {restaurant.isOpen
                ? "schedule"
                : restaurant.deliveryTime.includes("reservations")
                ? "event_seat"
                : "lock_clock"}
            </span>{" "}
            {restaurant.deliveryTime}
          </span>
          <span
            className={`flex items-center gap-1 ${
              restaurant.id === "tokyo-drift-izakaya" || restaurant.id === "sweet-alchemy"
                ? "font-medium text-secondary"
                : restaurant.id === "the-gilded-fork"
                ? "text-outline font-body-sm text-[12px]"
                : "text-primary"
            }`}
          >
            {restaurant.isOpen && restaurant.deliveryFee.includes("delivery") && (
              <span className="material-symbols-outlined text-sm">moped</span>
            )}
            {restaurant.deliveryFee}
          </span>
        </div>
      </div>
    </article>
  );
}
