// app/checkout/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { SAVED_ADDRESSES, DEFAULT_CONTACT } from "@/data/mockCartData";
import { FulfillmentMode, PaymentMethod, DeliveryAddress, CustomerContact } from "@/types/order";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000"
).replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");

const getAuthToken = () => {
  if (typeof window === "undefined") return "";

  const match = document.cookie.match(
    /(?:^|;\s*)(?:token|dinedesk_auth_token|better-auth\.session_token|auth_token|accessToken)=([^;]+)/
  );
  if (match && match[1]) return match[1].trim();

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("dinedesk_auth_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    ""
  ).trim();
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, toggleDrawer, clearCart, applyCoupon, removeCoupon } = useCart();

  // Fulfillment mode
  const [fulfillmentMode, setFulfillmentMode] = useState<FulfillmentMode>("delivery");

  // Delivery details
  const [selectedAddressId, setSelectedAddressId] = useState<string>("addr-home");
  const [streetAddress, setStreetAddress] = useState("House 42, Road 11, Block D");
  const [apartment, setApartment] = useState("Flat 4B (South Suite)");
  const [floor, setFloor] = useState("4th Floor / Lift 02");
  const [instructions, setInstructions] = useState("Leave at reception or ring bell once. Do not knock.");

  // Contact
  const [contact, setContact] = useState<CustomerContact>(DEFAULT_CONTACT);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [cardholderName, setCardholderName] = useState("Tahmid Rahman");
  const [cardNumber, setCardNumber] = useState("");
  const [expDate, setExpDate] = useState("08/28");
  const [cvc, setCvc] = useState("");

  // Coupon
  const [couponCode, setCouponCode] = useState(cart.appliedCoupon || "FIRSTDINE");
  const [couponError, setCouponError] = useState("");

  // Order state
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const handleAddressSelect = (addr: DeliveryAddress) => {
    setSelectedAddressId(addr.id);
    setStreetAddress(addr.street);
    setApartment(addr.apartment);
    setFloor(addr.floor);
    setInstructions(addr.instructions);
  };

  const handleApplyCoupon = () => {
    if (applyCoupon(couponCode)) {
      setCouponError("");
    } else {
      setCouponError("Invalid coupon code. Try FIRSTDINE");
    }
  };

  const handlePlaceOrder = async () => {
    if (cart.items.length === 0) return;
    setIsPlacingOrder(true);
    setOrderError(null);

    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const backendOrderType =
        fulfillmentMode === "takeaway"
          ? "PICKUP"
          : (fulfillmentMode as string) === "dinein"
            ? "DINE_IN"
            : "DELIVERY";

      const backendPaymentMethod = paymentMethod === "card" ? "STRIPE" : "COD";

      const formattedAddress = `${apartment ? apartment + ", " : ""}${streetAddress}${floor ? " (" + floor + ")" : ""
        }`;

      // Build payload matching backend createOrder controller
      const payload = {
        orderType: backendOrderType,
        paymentMethod: backendPaymentMethod,
        deliveryAddress: formattedAddress,
        deliveryLat: 22.3384,
        deliveryLng: 91.8317,
        couponCode: cart.appliedCoupon || undefined,
        items: cart.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          restaurantId: (item as any).restaurantId || cart.restaurantId,
        })),
      };

      const res = await fetch(`${API_BASE_URL}/api/v1/orders`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to initiate order.");
      }

      // STRIPE CARD PAYMENT: Redirect to Stripe Checkout (Cart preserved until verified payment)
      if (backendPaymentMethod === "STRIPE" && json.data?.stripeSessionUrl) {
        window.location.href = json.data.stripeSessionUrl;
        return;
      }

      // CASH ON DELIVERY: Cart is cleared and user is redirected to confirmation
      clearCart();
      const createdOrderId = json.data?.order?.id;
      router.push(`/order-confirmation/${createdOrderId}`);
    } catch (err: any) {
      console.error("Order dispatch error:", err);
      setOrderError(err.message || "An error occurred while creating your order.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const activeDeliveryFee = fulfillmentMode === "delivery" ? cart.deliveryFee : 0;
  const grandTotal = Math.max(
    0,
    cart.subtotal + activeDeliveryFee + cart.packagingFee + cart.tax - cart.discount
  );

  return (
    <main className="w-full pt-20 bg-surface">
      <div className="flex flex-col w-full">
        <div className="w-full bg-surface py-space-xl">
          <div className="max-w-[1440px] mx-auto px-margin">
            {/* Breadcrumb and Top Narrative Bar */}
            <div className="flex flex-wrap items-center justify-between gap-space-md mb-space-xl">
              <div className="flex items-center gap-space-sm font-label-md text-label-md text-on-surface-variant">
                <Link className="hover:text-primary transition-colors" href="/explore">
                  Directory
                </Link>
                <span>/</span>
                <span className="hover:text-primary transition-colors">
                  {cart.restaurantName || "Restaurant"}
                </span>
                <span>/</span>
                <span className="text-primary font-semibold">Checkout</span>
              </div>
              <div className="flex items-center gap-space-md">
                <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-primary-container bg-surface-container-high px-space-md py-1.5 rounded">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  <span>Avg. Delivery: 35–45 mins</span>
                </div>
                <button
                  className="flex items-center gap-space-xs font-label-md text-label-md text-on-primary bg-primary-container hover:bg-primary px-space-md py-1.5 rounded shadow-sm transition-colors cursor-pointer"
                  id="toggleCartDrawerBtn"
                  onClick={toggleDrawer}
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">shopping_bag</span>
                  <span>Cart Drawer ({cart.items.reduce((s, i) => s + i.quantity, 0)})</span>
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {orderError && (
              <div className="mb-space-lg p-space-md bg-error/10 border border-error/20 rounded text-error text-body-sm flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{orderError}</span>
              </div>
            )}

            {/* Main Dual Experience Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
              {/* LEFT & CENTER: Full Checkout Flow (8 Cols on Desktop) */}
              <div className="lg:col-span-8 flex flex-col gap-space-xl">
                {/* Section 1: Fulfillment Selector */}
                <div className="bg-surface-container-lowest p-space-lg rounded shadow-sm">
                  <div className="flex items-center justify-between mb-space-md">
                    <div className="flex items-center gap-space-sm">
                      <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">
                        Step 01
                      </span>
                      <h2 className="font-headline-md text-headline-md text-on-surface">
                        Fulfillment Mode
                      </h2>
                    </div>
                    <span className="text-on-surface-variant font-label-sm text-label-sm">
                      Dhaka Metropolitan Area
                    </span>
                  </div>
                  {/* Fulfillment Switcher Tabs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm p-1.5 bg-surface-container rounded">
                    <button
                      className={`fulfillment-tab flex items-center justify-center gap-space-xs py-space-sm px-space-md rounded font-label-md text-label-md transition-all cursor-pointer ${fulfillmentMode === "delivery"
                          ? "bg-surface-container-lowest text-primary-container font-semibold shadow-sm"
                          : "text-on-surface-variant hover:text-on-surface"
                        }`}
                      onClick={() => setFulfillmentMode("delivery")}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-base">moped</span>
                      <span>Delivery</span>
                    </button>
                    <button
                      className={`fulfillment-tab flex items-center justify-center gap-space-xs py-space-sm px-space-md rounded font-label-md text-label-md transition-all cursor-pointer ${fulfillmentMode === "takeaway"
                          ? "bg-surface-container-lowest text-primary-container font-semibold shadow-sm"
                          : "text-on-surface-variant hover:text-on-surface"
                        }`}
                      onClick={() => setFulfillmentMode("takeaway")}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-base">shopping_basket</span>
                      <span>Pickup / Takeaway</span>
                    </button>
                    <button
                      className={`fulfillment-tab flex items-center justify-center gap-space-xs py-space-sm px-space-md rounded font-label-md text-label-md transition-all cursor-pointer ${(fulfillmentMode as string) === "dinein"
                          ? "bg-surface-container-lowest text-primary-container font-semibold shadow-sm"
                          : "text-on-surface-variant hover:text-on-surface"
                        }`}
                      onClick={() => setFulfillmentMode("dinein" as FulfillmentMode)}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-base">table_restaurant</span>
                      <span>Dine-in Pre-order</span>
                    </button>
                  </div>
                </div>

                {/* Section 2: Delivery Destination & Map Picker */}
                {fulfillmentMode === "delivery" && (
                  <div className="bg-surface-container-lowest p-space-lg rounded shadow-sm">
                    <div className="flex items-center justify-between mb-space-md">
                      <div className="flex items-center gap-space-sm">
                        <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">
                          Step 02
                        </span>
                        <h3 className="font-headline-md text-headline-md text-on-surface">
                          Delivery Address
                        </h3>
                      </div>
                      <span className="font-label-sm text-label-sm text-primary-container flex items-center gap-1 font-semibold">
                        <span className="material-symbols-outlined text-sm">my_location</span> Banani Express Hub
                      </span>
                    </div>

                    {/* Saved Addresses Radio Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md mb-space-lg">
                      {SAVED_ADDRESSES.map((addr) => {
                        const isSelected = selectedAddressId === addr.id;
                        return (
                          <label
                            key={addr.id}
                            onClick={() => handleAddressSelect(addr)}
                            className={`relative flex flex-col p-space-md rounded cursor-pointer transition-all group ${isSelected
                                ? "bg-surface-container-low border border-primary-container/40"
                                : "bg-surface-container-lowest border border-outline-variant hover:bg-surface-container"
                              }`}
                          >
                            <div className="flex items-center justify-between mb-space-xs">
                              <span className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1">
                                <span className="material-symbols-outlined text-base text-primary-container">
                                  {addr.type === "home" ? "home" : "apartment"}
                                </span>{" "}
                                {addr.label}
                              </span>
                              <input
                                checked={isSelected}
                                onChange={() => handleAddressSelect(addr)}
                                className="w-4 h-4 text-primary-container accent-primary-container"
                                name="saved_address"
                                type="radio"
                              />
                            </div>
                            <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                              {addr.street}
                            </p>
                            <span
                              className={`mt-space-sm font-label-sm text-[10px] uppercase tracking-wider ${addr.isDefault ? "text-primary font-bold" : "text-on-surface-variant"
                                }`}
                            >
                              {addr.isDefault ? "Default Address" : "Secondary"}
                            </span>
                          </label>
                        );
                      })}
                      <button
                        className="flex flex-col items-center justify-center p-space-md rounded bg-surface-container-low hover:bg-surface-container transition-all text-primary-container gap-space-xs cursor-pointer border border-dashed border-outline-variant"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-xl">add_circle</span>
                        <span className="font-label-md text-label-md font-semibold">
                          + Add New Address
                        </span>
                      </button>
                    </div>

                    {/* Detailed Address Inputs & Map Preview Bento */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md">
                      <div className="md:col-span-7 flex flex-col gap-space-md">
                        <div>
                          <label className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-space-xs">
                            Street Address
                          </label>
                          <input
                            className="w-full bg-surface-container-low rounded py-space-sm px-space-md font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest"
                            type="text"
                            value={streetAddress}
                            onChange={(e) => setStreetAddress(e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-space-sm">
                          <div>
                            <label className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-space-xs">
                              Apartment / Flat
                            </label>
                            <input
                              className="w-full bg-surface-container-low rounded py-space-sm px-space-md font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest"
                              type="text"
                              value={apartment}
                              onChange={(e) => setApartment(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-space-xs">
                              Floor &amp; Elevator
                            </label>
                            <input
                              className="w-full bg-surface-container-low rounded py-space-sm px-space-md font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest"
                              type="text"
                              value={floor}
                              onChange={(e) => setFloor(e.target.value)}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-space-xs">
                            Delivery Instructions
                          </label>
                          <input
                            className="w-full bg-surface-container-low rounded py-space-sm px-space-md font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest"
                            type="text"
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Location Map Preview */}
                      <div className="md:col-span-5 flex flex-col">
                        <label className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-space-xs">
                          Map Pin
                        </label>
                        <div className="relative w-full h-full min-h-[170px] bg-surface-container rounded overflow-hidden flex flex-col justify-end p-space-sm shadow-inner">
                          <div className="absolute inset-0 bg-primary/10 pointer-events-none"></div>
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                            <span className="material-symbols-outlined text-secondary text-3xl animate-bounce">
                              location_on
                            </span>
                            <span className="w-2.5 h-1 bg-on-surface/30 rounded-full blur-[1px]"></span>
                          </div>
                          <div className="relative z-10 bg-surface-container-lowest/95 backdrop-blur px-space-sm py-1 rounded flex items-center justify-between text-[11px] font-label-sm">
                            <span className="text-on-surface truncate">Road 11, Banani</span>
                            <span className="text-secondary font-bold">Pinned</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Section 3: Contact Details */}
                <div className="bg-surface-container-lowest p-space-lg rounded shadow-sm">
                  <div className="flex items-center gap-space-sm mb-space-md">
                    <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">
                      {fulfillmentMode === "delivery" ? "Step 03" : "Step 02"}
                    </span>
                    <h3 className="font-headline-md text-headline-md text-on-surface">
                      Contact Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                    <div>
                      <label className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-space-xs">
                        Full Name
                      </label>
                      <div className="relative">
                        <input
                          className="w-full bg-surface-container-low rounded py-space-sm pl-9 pr-space-md font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest"
                          type="text"
                          value={contact.fullName}
                          onChange={(e) =>
                            setContact({ ...contact, fullName: e.target.value })
                          }
                        />
                        <span className="material-symbols-outlined text-base absolute left-2.5 top-2.5 text-on-surface-variant">
                          person
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-space-xs">
                        Phone Number
                      </label>
                      <div className="relative">
                        <input
                          className="w-full bg-surface-container-low rounded py-space-sm pl-9 pr-space-md font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest"
                          type="tel"
                          value={contact.phone}
                          onChange={(e) =>
                            setContact({ ...contact, phone: e.target.value })
                          }
                        />
                        <span className="material-symbols-outlined text-base absolute left-2.5 top-2.5 text-on-surface-variant">
                          call
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-space-xs">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          className="w-full bg-surface-container-low rounded py-space-sm pl-9 pr-space-md font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest"
                          type="email"
                          value={contact.email}
                          onChange={(e) =>
                            setContact({ ...contact, email: e.target.value })
                          }
                        />
                        <span className="material-symbols-outlined text-base absolute left-2.5 top-2.5 text-on-surface-variant">
                          mail
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 4: Payment Instruments & Security */}
                <div className="bg-surface-container-lowest p-space-lg rounded shadow-sm">
                  <div className="flex items-center justify-between mb-space-md">
                    <div className="flex items-center gap-space-sm">
                      <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">
                        {fulfillmentMode === "delivery" ? "Step 04" : "Step 03"}
                      </span>
                      <h3 className="font-headline-md text-headline-md text-on-surface">
                        Payment Method
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-sm text-primary">
                        verified_user
                      </span>
                      <span>Secure 256-bit SSL</span>
                    </div>
                  </div>

                  {/* Radio Options Stack */}
                  <div className="space-y-space-md">
                    {/* Option 1: Credit / Debit Card via Stripe */}
                    <div
                      onClick={() => setPaymentMethod("card")}
                      className={`p-space-md rounded cursor-pointer transition-colors ${paymentMethod === "card"
                          ? "bg-surface-container-low border border-primary-container/30"
                          : "bg-surface-container-lowest hover:bg-surface-container-low"
                        }`}
                    >
                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-space-sm">
                          <input
                            checked={paymentMethod === "card"}
                            onChange={() => setPaymentMethod("card")}
                            className="w-4 h-4 text-primary-container accent-primary-container"
                            name="payment_method"
                            type="radio"
                            value="card"
                          />
                          <div>
                            <p className="font-label-lg text-label-lg font-semibold text-on-surface">
                              Credit / Debit Card via Stripe
                            </p>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">
                              Secure hosted payment checkout for all credit and debit cards
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-space-xs">
                          <span className="px-2 py-0.5 bg-surface-container-lowest text-primary font-bold text-[10px] tracking-wider rounded">
                            VISA
                          </span>
                          <span className="px-2 py-0.5 bg-surface-container-lowest text-secondary font-bold text-[10px] tracking-wider rounded">
                            MC
                          </span>
                          <span className="px-2 py-0.5 bg-surface-container-lowest text-on-surface font-bold text-[10px] tracking-wider rounded">
                            AMEX
                          </span>
                        </div>
                      </label>
                    </div>

                    {/* Option 2: Cash on Delivery */}
                    <div
                      onClick={() => setPaymentMethod("cod")}
                      className={`p-space-md rounded cursor-pointer transition-colors ${paymentMethod === "cod"
                          ? "bg-surface-container-low border border-primary-container/30"
                          : "bg-surface-container-lowest hover:bg-surface-container-low"
                        }`}
                    >
                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-space-sm">
                          <input
                            checked={paymentMethod === "cod"}
                            onChange={() => setPaymentMethod("cod")}
                            className="w-4 h-4 text-primary-container accent-primary-container"
                            name="payment_method"
                            type="radio"
                            value="cod"
                          />
                          <div>
                            <p className="font-label-lg text-label-lg font-semibold text-on-surface">
                              Cash on Delivery
                            </p>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">
                              Pay with cash directly to the courier upon delivery
                            </p>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-xl text-on-surface-variant">
                          payments
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: Dual Cart Presence / Sticky Checkout Summary Panel (4 Cols) */}
              <div className="lg:col-span-4 flex flex-col gap-space-lg lg:sticky lg:top-24">
                {/* Coupon & Promo Code Module */}
                <div className="bg-surface-container-lowest p-space-md rounded shadow-sm">
                  <label className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-space-xs">
                    Voucher or Dining Coupon
                  </label>
                  <div className="flex items-center gap-space-xs">
                    <input
                      className="flex-1 bg-surface-container-low rounded py-space-sm px-space-md font-body-sm text-body-sm uppercase tracking-wider text-on-surface focus:outline-none"
                      id="couponInput"
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="px-space-md py-space-sm bg-primary-container hover:bg-primary text-on-primary rounded font-label-md text-label-md font-semibold transition-colors cursor-pointer"
                      type="button"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-error mt-1">{couponError}</p>
                  )}
                  {cart.appliedCoupon && (
                    <div className="mt-space-sm flex items-center justify-between bg-primary-fixed text-on-primary-fixed px-space-sm py-1.5 rounded text-xs font-label-sm">
                      <span className="flex items-center gap-1 font-semibold">
                        <span className="material-symbols-outlined text-sm">local_offer</span>
                        <span>FIRSTDINE applied (-$10 discount!)</span>
                      </span>
                      <button
                        aria-label="Remove coupon"
                        onClick={removeCoupon}
                        className="text-on-primary-fixed hover:opacity-75 cursor-pointer"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Order Summary Card */}
                <div className="bg-surface-container-lowest p-space-lg rounded shadow-sm">
                  <div className="flex items-center justify-between pb-space-md">
                    <div>
                      <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
                        Order Invoice
                      </span>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface">
                        Order Summary
                      </h3>
                    </div>
                    <span className="px-2 py-1 bg-surface-container text-on-surface-variant font-label-sm text-label-sm rounded font-medium">
                      {cart.items.reduce((s, i) => s + i.quantity, 0)} Dishes
                    </span>
                  </div>

                  {/* Itemized preview */}
                  <div className="py-space-md space-y-space-sm border-t border-b border-outline-variant/40">
                    {cart.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-space-sm text-body-sm"
                      >
                        <div>
                          <p className="font-medium text-on-surface">
                            {item.quantity}× {item.name}
                          </p>
                          {item.variant && (
                            <p className="text-xs text-on-surface-variant">{item.variant}</p>
                          )}
                        </div>
                        <span className="tabular-nums font-semibold text-on-surface">
                          ${(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Financial Ledger */}
                  <div className="pt-space-md space-y-space-xs font-body-sm text-body-sm">
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span>Subtotal</span>
                      <span className="tabular-nums">${cart.subtotal.toLocaleString()}</span>
                    </div>
                    {fulfillmentMode === "delivery" && (
                      <div className="flex items-center justify-between text-on-surface-variant">
                        <span>Delivery Fee</span>
                        <span className="tabular-nums">${cart.deliveryFee.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span>Restaurant Packaging</span>
                      <span className="tabular-nums">${cart.packagingFee.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span>State Sales Tax (6%)</span>
                      <span className="tabular-nums">${cart.tax.toLocaleString()}</span>
                    </div>
                    {cart.appliedCoupon && (
                      <div className="flex items-center justify-between text-secondary font-medium">
                        <span>First Dine Voucher</span>
                        <span className="tabular-nums">-${cart.discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="pt-space-md mt-space-sm flex items-baseline justify-between text-on-surface">
                      <div>
                        <p className="font-label-lg text-label-lg font-bold">Total Payable</p>
                        <p className="text-[11px] text-on-surface-variant">
                          Inclusive of all local culinary taxes
                        </p>
                      </div>
                      <div className="text-right">
                        {cart.discount > 0 && (
                          <span className="text-xs line-through text-on-surface-variant mr-1">
                            ${(grandTotal + cart.discount).toLocaleString()}
                          </span>
                        )}
                        <span className="font-headline-md text-headline-md font-bold text-primary-container tabular-nums">
                          ${grandTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder || cart.items.length === 0}
                    className="w-full mt-space-lg py-space-md px-space-lg bg-primary-container hover:bg-primary text-on-primary rounded font-label-lg text-label-lg font-semibold tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-space-sm group cursor-pointer disabled:opacity-70"
                    type="button"
                  >
                    {isPlacingOrder ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-lg">
                          progress_activity
                        </span>
                        <span>
                          {paymentMethod === "card"
                            ? "Connecting to Stripe..."
                            : "Confirming Order..."}
                        </span>
                      </>
                    ) : (
                      <>
                        <span>
                          {paymentMethod === "card"
                            ? `Pay $${grandTotal.toLocaleString()} with Card`
                            : `Place COD Order ($${grandTotal.toLocaleString()})`}
                        </span>
                        <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                          arrow_forward
                        </span>
                      </>
                    )}
                  </button>

                  {/* Trust Badges */}
                  <div className="mt-space-md pt-space-sm text-center">
                    <div className="flex items-center justify-center gap-space-xs text-[11px] font-label-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-xs text-primary-container">
                        lock
                      </span>
                      <span>SSL Secure Encrypted 256-Bit</span>
                      <span>•</span>
                      <span>100% Satisfaction Guarantee</span>
                    </div>
                  </div>
                </div>

                {/* Kitchen Notice */}
                <div className="bg-surface-container-low p-space-md rounded flex items-start gap-space-sm">
                  <span className="material-symbols-outlined text-secondary text-xl shrink-0 mt-0.5">
                    restaurant
                  </span>
                  <div>
                    <p className="font-label-sm text-label-sm font-semibold text-on-surface">
                      Fresh Preparation Notice
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      All orders are prepared fresh upon confirmation. Packaging is sealed under kitchen quality control.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}