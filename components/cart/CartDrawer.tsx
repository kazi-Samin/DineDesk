"use client";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function CartDrawer() {
  const {
    cart,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    addRecommendation,
  } = useCart();
  const router = useRouter();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  const handleProceedToCheckout = () => {
    closeDrawer();
    router.push("/checkout");
  };

  if (!isDrawerOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-on-surface/40 z-50 transition-opacity duration-300 opacity-100 pointer-events-auto"
      id="cartDrawerBackdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeDrawer();
      }}
    >
      <div
        className="absolute top-0 right-0 bottom-0 w-full max-w-md bg-surface-container-lowest shadow-2xl flex flex-col justify-between transform transition-transform duration-300 translate-x-0"
        id="cartDrawer"
      >
        {/* Drawer Header */}
        <div className="p-space-lg bg-surface-container-low flex items-start justify-between">
          <div>
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary-container text-lg">
                local_dining
              </span>
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">
                Your Order
              </span>
            </div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface mt-0.5">
              {cart.restaurantName}
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {cart.items.length > 0
                ? `${cart.items.reduce((s, i) => s + i.quantity, 0)} items ready for delivery`
                : "Your cart is currently empty"}
            </p>
          </div>
          <button
            aria-label="Close cart"
            className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            id="closeCartDrawerBtn"
            onClick={closeDrawer}
            type="button"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Drawer Items List */}
        <div className="flex-1 overflow-y-auto p-space-lg space-y-space-md">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-on-surface-variant">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-primary-container mb-space-sm">
                <span className="material-symbols-outlined text-3xl">shopping_bag</span>
              </div>
              <h3 className="font-headline-sm text-lg text-on-surface mb-1">Your cart is empty</h3>
              <p className="font-body-sm text-sm text-on-surface-variant max-w-xs mb-space-md">
                Explore delicious handcrafted dishes from Dhaka&apos;s celebrated kitchens.
              </p>
              <Link
                href="/explore"
                onClick={closeDrawer}
                className="px-space-md py-2 bg-primary-container text-on-primary rounded font-label-sm text-label-sm font-semibold"
              >
                Browse Restaurants
              </Link>
            </div>
          ) : (
            <>
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-space-md p-space-sm rounded bg-surface-container-lowest hover:bg-surface-container-low transition-colors"
                >
                  <div className="w-16 h-16 rounded overflow-hidden shrink-0 bg-surface-container">
                    <img
                      className="w-full h-full object-cover"
                      alt={item.imageAlt}
                      src={item.image}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h3 className="font-label-lg text-label-lg font-semibold text-on-surface truncate">
                        {item.name}
                      </h3>
                    </div>
                    {item.variant && (
                      <p className="text-xs text-on-surface-variant mt-0.5">{item.variant}</p>
                    )}
                    <div className="flex items-center justify-between mt-space-sm">
                      {/* Stepper */}
                      <div className="flex items-center bg-surface-container rounded px-1.5 py-0.5 gap-space-sm text-xs font-label-sm">
                        <button
                          aria-label="Decrease quantity"
                          className="w-5 h-5 flex items-center justify-center text-on-surface hover:bg-surface-container-high rounded"
                          onClick={() => updateQuantity(item.id, -1)}
                          type="button"
                        >
                          -
                        </button>
                        <span className="font-bold text-on-surface tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          aria-label="Increase quantity"
                          className="w-5 h-5 flex items-center justify-center text-on-surface hover:bg-surface-container-high rounded"
                          onClick={() => updateQuantity(item.id, 1)}
                          type="button"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-label-md text-label-md font-bold text-on-surface tabular-nums">
                        ${(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Additional Chef Suggestion Upsell */}
              <div className="p-space-md bg-surface-container-low rounded flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-secondary text-lg">
                    hotel_class
                  </span>
                  <div>
                    <p className="font-label-sm text-label-sm font-semibold text-on-surface">
                      Artisanal Honey Panna Cotta
                    </p>
                    <p className="text-[11px] text-on-surface-variant">
                      +$8 (Special dessert pairing)
                    </p>
                  </div>
                </div>
                <button
                  onClick={addRecommendation}
                  className="px-space-sm py-1 bg-surface-container-lowest hover:bg-primary hover:text-on-primary rounded text-xs font-label-sm font-semibold transition-colors"
                  type="button"
                >
                  Add
                </button>
              </div>
            </>
          )}
        </div>

        {/* Drawer Cost Breakdown & Sticky Checkout Action */}
        {cart.items.length > 0 && (
          <div className="p-space-lg bg-surface-container-lowest shadow-[0_-8px_20px_rgba(30,27,22,0.05)]">
            <div className="space-y-1.5 font-body-sm text-body-sm pb-space-md">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>Subtotal</span>
                <span className="tabular-nums">${cart.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>Delivery Fee</span>
                <span className="tabular-nums">${cart.deliveryFee.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>Restaurant Packaging</span>
                <span className="tabular-nums">${cart.packagingFee.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>State &amp; Local Tax (6%)</span>
                <span className="tabular-nums">${cart.tax.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pt-space-xs font-headline-sm text-headline-sm text-on-surface font-semibold">
                <span>Total</span>
                <span className="text-primary-container tabular-nums">
                  ${(cart.subtotal + cart.deliveryFee + cart.packagingFee + cart.tax).toLocaleString()}
                </span>
              </div>
            </div>
            <button
              onClick={handleProceedToCheckout}
              className="w-full py-space-md px-space-lg bg-primary-container hover:bg-primary text-on-primary rounded font-label-lg text-label-lg font-semibold tracking-wide transition-colors flex items-center justify-center gap-space-sm"
              id="drawerCheckoutAction"
              type="button"
            >
              <span>Proceed to Checkout</span>
              <span className="material-symbols-outlined text-lg">east</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
