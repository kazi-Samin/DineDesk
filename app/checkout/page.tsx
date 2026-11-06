// app/checkout/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { SAVED_ADDRESSES, DEFAULT_CONTACT } from "@/data/mockCartData";
import { FulfillmentMode, PaymentMethod, DeliveryAddress, CustomerContact } from "@/types/order";
import EmbeddedStripeCheckout from "@/components/checkout/EmbeddedStripeCheckout";

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
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [stripeOrderId, setStripeOrderId] = useState<string | null>(null);
  const [stripeVerifiedTotal, setStripeVerifiedTotal] = useState<number>(0);
  const [isInitializingStripe, setIsInitializingStripe] = useState(false);

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
    // Reset stripe client secret if address changes so backend re-validates
    setStripeClientSecret(null);
  };

  const handleApplyCoupon = () => {
    if (applyCoupon(couponCode)) {
      setCouponError("");
      setStripeClientSecret(null);
    } else {
      setCouponError("Invalid coupon code. Try FIRSTDINE");
    }
  };

  const initializeStripeIntent = async () => {
    if (cart.items.length === 0) return;
    setIsInitializingStripe(true);
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

      const formattedAddress = `${apartment ? apartment + ", " : ""}${streetAddress}${floor ? " (" + floor + ")" : ""}`;

      const payload = {
        orderType: backendOrderType,
        paymentMethod: "STRIPE",
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
        throw new Error(json.message || "Failed to initialize payment gateway.");
      }

      if (json.data?.clientSecret) {
        setStripeClientSecret(json.data.clientSecret);
        setStripeOrderId(json.data.order?.id);
        setStripeVerifiedTotal(Number(json.data.total) || grandTotal);
      }
    } catch (err: any) {
      console.error("Stripe initialization error:", err);
      setOrderError(err.message || "Unable to initialize Stripe payment. Please check your network or try again.");
    } finally {
      setIsInitializingStripe(false);
    }
  };

  const handlePaymentSuccess = async (orderId: string) => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      await fetch(`${API_BASE_URL}/api/v1/orders/confirm-payment`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          orderId,
          paymentIntentId: stripeClientSecret ? stripeClientSecret.split("_secret_")[0] : undefined,
        }),
      }).catch(() => null);

      clearCart();
      router.push(`/dashboard/customer/orders?order_success=true&order_id=${orderId}`);
    } catch (e) {
      clearCart();
      router.push(`/dashboard/customer/orders?order_success=true&order_id=${orderId}`);
    }
  };

  const handlePlaceOrder = async () => {
    if (cart.items.length === 0) return;

    if (paymentMethod === "card") {
      if (!stripeClientSecret) {
        await initializeStripeIntent();
      } else {
        const el = document.getElementById("stripe-payment-container");
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    // Cash On Delivery flow
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

      const formattedAddress = `${apartment ? apartment + ", " : ""}${streetAddress}${floor ? " (" + floor + ")" : ""}`;

      const payload = {
        orderType: backendOrderType,
        paymentMethod: "COD",
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

      clearCart();
      const createdOrderId = json.data?.order?.id;
      router.push(`/dashboard/customer/orders?order_success=true&order_id=${createdOrderId}`);
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

  if (cart.items.length === 0) {
    return (
      <main className="w-full pt-28 pb-20 bg-stone-50 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200/80 shadow-md p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-50 text-[#1b3b2b] rounded-2xl flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-3xl">shopping_cart</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-[#1b3b2b]">
            Your Dining Cart is Empty
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
            Looks like you haven't added any dishes yet. Browse our verified culinary kitchens to discover delicious chef-recommended meals.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 bg-[#1b3b2b] hover:bg-[#142e21] text-white font-bold text-sm rounded-xl transition-all shadow-sm"
          >
            <span>Explore Verified Menus</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full pt-20 bg-surface">
      <div className="flex flex-col w-full">
        <div className="w-full bg-surface py-space-xl">
          <div className="max-w-[1440px] mx-auto px-3.5 sm:px-margin">
            {/* Breadcrumb and Top Narrative Bar */}
            <div className="flex flex-wrap items-center justify-between gap-space-md mb-space-md">
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

            {/* Prominent Secure Checkout Heading */}
            <div className="mb-space-xl pb-space-sm border-b border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#1b3b2b] flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-700 text-2xl sm:text-3xl">verified_user</span>
                  <span>Secure Checkout</span>
                </h1>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Complete your order inside DineDesk • 256-Bit SSL Encrypted
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl self-start sm:self-auto shadow-2xs">
                <span className="material-symbols-outlined text-sm text-emerald-600">lock</span>
                <span>Direct In-Page Payment</span>
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
                    {/* Option 1: Credit / Debit Card via Stripe Embedded Elements */}
                    <div
                      onClick={() => setPaymentMethod("card")}
                      className={`p-space-md rounded-2xl cursor-pointer transition-all border ${paymentMethod === "card"
                          ? "bg-white border-[#1b3b2b] shadow-sm ring-1 ring-[#1b3b2b]/15"
                          : "bg-surface-container-lowest border-stone-200/80 hover:bg-surface-container-low"
                        }`}
                    >
                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-space-sm">
                          <input
                            checked={paymentMethod === "card"}
                            onChange={() => setPaymentMethod("card")}
                            className="w-4 h-4 text-[#1b3b2b] accent-[#1b3b2b]"
                            name="payment_method"
                            type="radio"
                            value="card"
                          />
                          <div>
                            <p className="font-label-lg text-label-lg font-bold text-on-surface flex items-center gap-2">
                              <span>Credit / Debit Card</span>
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                                Direct In-Page
                              </span>
                            </p>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">
                              Pay securely directly on DineDesk without external redirects
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-space-xs">
                          <span className="px-2 py-0.5 bg-stone-100 text-primary font-bold text-[10px] tracking-wider rounded">
                            VISA
                          </span>
                          <span className="px-2 py-0.5 bg-stone-100 text-secondary font-bold text-[10px] tracking-wider rounded">
                            MC
                          </span>
                          <span className="px-2 py-0.5 bg-stone-100 text-on-surface font-bold text-[10px] tracking-wider rounded">
                            AMEX
                          </span>
                        </div>
                      </label>

                      {/* Embedded Stripe Payment Elements Form Container */}
                      {paymentMethod === "card" && (
                        <div id="stripe-payment-container" className="mt-4 pt-4 border-t border-stone-100">
                          {!stripeClientSecret ? (
                            <div className="p-5 bg-stone-50/80 rounded-xl border border-stone-200/80 text-center space-y-3">
                              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-[#1b3b2b]">
                                <span className="material-symbols-outlined text-emerald-600 text-base">lock</span>
                                <span>Direct Embedded Payment Gateway</span>
                              </div>
                              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                                Complete your payment directly on DineDesk. Click below to load the secure payment form.
                              </p>
                              <button
                                type="button"
                                onClick={initializeStripeIntent}
                                disabled={isInitializingStripe || cart.items.length === 0}
                                className="px-6 py-2.5 bg-[#1b3b2b] hover:bg-[#142e21] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 mx-auto cursor-pointer disabled:opacity-50"
                              >
                                {isInitializingStripe ? (
                                  <>
                                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Connecting to Stripe...</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="material-symbols-outlined text-base">credit_card</span>
                                    <span>Load Embedded Payment Form (${grandTotal.toFixed(2)})</span>
                                  </>
                                )}
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between pb-1">
                                <span className="text-xs font-bold text-[#1b3b2b] uppercase tracking-wider flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-emerald-600 text-sm">verified_user</span>
                                  <span>Embedded Stripe Payment Form</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setStripeClientSecret(null)}
                                  className="text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer"
                                >
                                  Change Details
                                </button>
                              </div>
                              <EmbeddedStripeCheckout
                                clientSecret={stripeClientSecret}
                                orderId={stripeOrderId!}
                                total={stripeVerifiedTotal || grandTotal}
                                onPaymentSuccess={handlePaymentSuccess}
                                onCancel={() => setStripeClientSecret(null)}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Option 2: Cash on Delivery */}
                    <div
                      onClick={() => setPaymentMethod("cod")}
                      className={`p-space-md rounded-2xl cursor-pointer transition-all border ${paymentMethod === "cod"
                          ? "bg-white border-[#1b3b2b] shadow-sm ring-1 ring-[#1b3b2b]/15"
                          : "bg-surface-container-lowest border-stone-200/80 hover:bg-surface-container-low"
                        }`}
                    >
                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-space-sm">
                          <input
                            checked={paymentMethod === "cod"}
                            onChange={() => setPaymentMethod("cod")}
                            className="w-4 h-4 text-[#1b3b2b] accent-[#1b3b2b]"
                            name="payment_method"
                            type="radio"
                            value="cod"
                          />
                          <div>
                            <p className="font-label-lg text-label-lg font-bold text-on-surface">
                              Cash on Delivery (COD)
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
                  {paymentMethod === "card" && stripeClientSecret ? (
                    <button
                      onClick={() => {
                        const el = document.getElementById("stripe-payment-container");
                        el?.scrollIntoView({ behavior: "smooth", block: "center" });
                      }}
                      className="w-full mt-space-lg py-space-md px-space-lg bg-[#1b3b2b] hover:bg-[#142e21] text-white rounded-xl font-label-lg text-label-lg font-bold tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-space-sm cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-lg">credit_card</span>
                      <span>Complete Payment in Form</span>
                      <span className="material-symbols-outlined text-lg">arrow_upward</span>
                    </button>
                  ) : (
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isPlacingOrder || isInitializingStripe || cart.items.length === 0}
                      className="w-full mt-space-lg py-space-md px-space-lg bg-[#1b3b2b] hover:bg-[#142e21] text-white rounded-xl font-label-lg text-label-lg font-bold tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-space-sm group cursor-pointer disabled:opacity-70"
                      type="button"
                    >
                      {isPlacingOrder || isInitializingStripe ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-lg">
                            progress_activity
                          </span>
                          <span>
                            {paymentMethod === "card"
                              ? "Initializing Stripe Gateway..."
                              : "Confirming Order..."}
                          </span>
                        </>
                      ) : (
                        <>
                          <span>
                            {paymentMethod === "card"
                              ? `Pay $${grandTotal.toFixed(2)} with Card`
                              : `Place Cash on Delivery ($${grandTotal.toFixed(2)})`}
                          </span>
                          <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                            arrow_forward
                          </span>
                        </>
                      )}
                    </button>
                  )}

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