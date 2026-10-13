"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { placeOrder } from "@/services/mockOrderService";
import { SAVED_ADDRESSES, DEFAULT_CONTACT } from "@/data/mockCartData";
import { FulfillmentMode, PaymentMethod, DeliveryAddress, CustomerContact, OrderConfirmation } from "@/types/order";

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
  const [confirmedOrder, setConfirmedOrder] = useState<OrderConfirmation | null>(null);

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
    setIsPlacingOrder(true);
    try {
      const orderRes = await placeOrder({
        fulfillmentMode,
        restaurantId: cart.restaurantId,
        restaurantName: cart.restaurantName,
        items: cart.items,
        address:
          fulfillmentMode === "delivery"
            ? {
                id: selectedAddressId,
                type: "custom",
                label: "Delivery Address",
                street: streetAddress,
                apartment,
                floor,
                instructions,
              }
            : undefined,
        contact,
        paymentMethod,
        cardDetails:
          paymentMethod === "card"
            ? { cardholderName, cardNumber, expDate, cvc }
            : undefined,
        appliedCoupon: cart.appliedCoupon,
        subtotal: cart.subtotal,
        deliveryFee: fulfillmentMode === "delivery" ? cart.deliveryFee : 0,
        packagingFee: cart.packagingFee,
        tax: cart.tax,
        discount: cart.discount,
        total:
          fulfillmentMode === "delivery"
            ? cart.total
            : Math.max(0, cart.subtotal + cart.packagingFee + cart.tax - cart.discount),
      });

      setConfirmedOrder(orderRes);
      clearCart();
      router.push(`/order-confirmation/${orderRes.orderId}`);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Render Confirmation State if Order is Placed
  if (confirmedOrder) {
    return (
      <main className="w-full pt-20 bg-surface min-h-screen">
        <div className="max-w-[800px] mx-auto px-margin py-space-xl">
          <div className="bg-surface-container-lowest p-space-xl rounded-xl shadow-md border border-outline-variant flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-primary-container mb-space-md">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">
              Order Dispatched
            </span>
            <h1 className="font-headline-lg text-headline-lg text-primary mt-1">
              Thank You for Dining with DineDesk!
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md mt-2">
              Your order has been transmitted directly to{" "}
              <span className="font-semibold text-on-surface">{confirmedOrder.restaurantName}</span>.
            </p>

            {/* Order Meta Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm w-full my-space-lg p-space-md bg-surface-container-low rounded-lg text-left">
              <div>
                <p className="text-[11px] font-label-sm text-on-surface-variant uppercase">
                  Order ID
                </p>
                <p className="font-headline-sm text-primary font-bold">
                  {confirmedOrder.orderId}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-label-sm text-on-surface-variant uppercase">
                  Estimated Arrival
                </p>
                <p className="font-headline-sm text-primary font-bold">
                  {confirmedOrder.estimatedDeliveryTime}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-label-sm text-on-surface-variant uppercase">
                  Total Paid
                </p>
                <p className="font-headline-sm text-primary font-bold">
                  ৳{confirmedOrder.total.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Items summary */}
            <div className="w-full text-left border-t border-outline-variant/60 pt-space-md space-y-2">
              <h4 className="font-label-md font-semibold text-on-surface uppercase tracking-wider">
                Dishes in Order
              </h4>
              {confirmedOrder.items.map((item) => (
                <div key={item.id} className="flex justify-between text-body-sm text-on-surface">
                  <span>
                    {item.quantity}× {item.name}
                  </span>
                  <span className="font-semibold">
                    ৳{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-space-md mt-space-xl">
              <Link
                href="/explore"
                className="px-space-xl py-space-md bg-primary-container text-on-primary rounded font-label-lg font-semibold hover:bg-primary transition-colors"
              >
                Explore More Restaurants
              </Link>
              <Link
                href="/"
                className="px-space-lg py-space-md bg-surface-container-high text-primary rounded font-label-md hover:bg-surface-container-highest transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

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
                  {cart.restaurantName}
                </span>
                <span>/</span>
                <span className="text-primary font-semibold">Table &amp; Delivery Checkout</span>
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
                      className={`fulfillment-tab flex items-center justify-center gap-space-xs py-space-sm px-space-md rounded font-label-md text-label-md transition-all cursor-pointer ${
                        fulfillmentMode === "delivery"
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
                      className={`fulfillment-tab flex items-center justify-center gap-space-xs py-space-sm px-space-md rounded font-label-md text-label-md transition-all cursor-pointer ${
                        fulfillmentMode === "takeaway"
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
                      className={`fulfillment-tab flex items-center justify-center gap-space-xs py-space-sm px-space-md rounded font-label-md text-label-md transition-all cursor-pointer ${
                        fulfillmentMode === "dinein"
                          ? "bg-surface-container-lowest text-primary-container font-semibold shadow-sm"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                      onClick={() => setFulfillmentMode("dinein")}
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
                          Delivery Coordinates
                        </h3>
                      </div>
                      <span className="font-label-sm text-label-sm text-primary-container flex items-center gap-1 font-semibold">
                        <span className="material-symbols-outlined text-sm">my_location</span>{" "}
                        Banani Express Hub
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
                            className={`relative flex flex-col p-space-md rounded cursor-pointer transition-all group ${
                              isSelected
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
                              className={`mt-space-sm font-label-sm text-[10px] uppercase tracking-wider ${
                                addr.isDefault
                                  ? "text-primary font-bold"
                                  : "text-on-surface-variant"
                              }`}
                            >
                              {addr.isDefault ? "Default Destination" : "Secondary"}
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
                      {/* Location Map Preview with GPS pin */}
                      <div className="md:col-span-5 flex flex-col">
                        <label className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-space-xs">
                          Location Coordinates
                        </label>
                        <div className="relative w-full h-full min-h-[170px] bg-surface-container rounded overflow-hidden flex flex-col justify-end p-space-sm shadow-inner">
                          <div className="absolute inset-0 bg-primary/10 pointer-events-none"></div>
                          {/* Center Marker Simulation */}
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

                {/* Section 3: Contact Details & Orderer */}
                <div className="bg-surface-container-lowest p-space-lg rounded shadow-sm">
                  <div className="flex items-center gap-space-sm mb-space-md">
                    <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">
                      {fulfillmentMode === "delivery" ? "Step 03" : "Step 02"}
                    </span>
                    <h3 className="font-headline-md text-headline-md text-on-surface">
                      Recipient &amp; Orderer
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
                        Email Invoice
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
                      <span>PCI-DSS Tier-1</span>
                    </div>
                  </div>

                  {/* Radio Options Stack */}
                  <div className="space-y-space-md">
                    {/* Option 1: Credit / Debit Card */}
                    <div
                      onClick={() => setPaymentMethod("card")}
                      className={`p-space-md rounded cursor-pointer transition-colors ${
                        paymentMethod === "card"
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
                              Instant processing for international and local cards
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
                      {/* Nested Card Form Fields */}
                      {paymentMethod === "card" && (
                        <div className="mt-space-md pt-space-md space-y-space-sm border-t border-outline-variant/40">
                          <div>
                            <label className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-space-xs">
                              Cardholder Name
                            </label>
                            <input
                              className="w-full bg-surface-container-lowest rounded py-space-sm px-space-md font-body-sm text-body-sm text-on-surface focus:outline-none"
                              type="text"
                              value={cardholderName}
                              onChange={(e) => setCardholderName(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-space-xs">
                              Card Number
                            </label>
                            <div className="relative">
                              <input
                                className="w-full bg-surface-container-lowest rounded py-space-sm pl-10 pr-space-md font-body-sm text-body-sm text-on-surface focus:outline-none"
                                placeholder="4242 •••• •••• 4242"
                                type="text"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                              />
                              <span className="material-symbols-outlined text-base absolute left-2.5 top-2.5 text-on-surface-variant">
                                credit_card
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-space-md">
                            <div>
                              <label className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-space-xs">
                                Exp Date (MM/YY)
                              </label>
                              <input
                                className="w-full bg-surface-container-lowest rounded py-space-sm px-space-md font-body-sm text-body-sm text-on-surface focus:outline-none"
                                placeholder="08/28"
                                type="text"
                                value={expDate}
                                onChange={(e) => setExpDate(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-space-xs">
                                CVC / CVV
                              </label>
                              <input
                                className="w-full bg-surface-container-lowest rounded py-space-sm px-space-md font-body-sm text-body-sm text-on-surface focus:outline-none"
                                maxLength={4}
                                placeholder="•••"
                                type="password"
                                value={cvc}
                                onChange={(e) => setCvc(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Option 2: Cash on Delivery */}
                    <div
                      onClick={() => setPaymentMethod("cod")}
                      className={`p-space-md rounded cursor-pointer transition-colors ${
                        paymentMethod === "cod"
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
                              Pay with exact cash or personal digital wallet upon arrival
                            </p>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-xl text-on-surface-variant">
                          payments
                        </span>
                      </label>
                    </div>

                    {/* Option 3: Direct Mobile Wallet (bKash / Nagad) */}
                    <div
                      onClick={() => setPaymentMethod("mfs")}
                      className={`p-space-md rounded cursor-pointer transition-colors ${
                        paymentMethod === "mfs"
                          ? "bg-surface-container-low border border-primary-container/30"
                          : "bg-surface-container-lowest hover:bg-surface-container-low"
                      }`}
                    >
                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-space-sm">
                          <input
                            checked={paymentMethod === "mfs"}
                            onChange={() => setPaymentMethod("mfs")}
                            className="w-4 h-4 text-primary-container accent-primary-container"
                            name="payment_method"
                            type="radio"
                            value="mfs"
                          />
                          <div>
                            <p className="font-label-lg text-label-lg font-semibold text-on-surface">
                              bKash / Nagad Direct Mobile Wallet
                            </p>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">
                              Pay via instant OTP &amp; PIN gateway redirect
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-space-xs">
                          <span className="px-2 py-0.5 bg-secondary-fixed text-on-secondary-fixed font-bold text-[10px] tracking-wider rounded">
                            bKash
                          </span>
                          <span className="px-2 py-0.5 bg-surface-container text-secondary font-bold text-[10px] tracking-wider rounded">
                            Nagad
                          </span>
                        </div>
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
                  {/* Applied coupon banner */}
                  {cart.appliedCoupon && (
                    <div className="mt-space-sm flex items-center justify-between bg-primary-fixed text-on-primary-fixed px-space-sm py-1.5 rounded text-xs font-label-sm">
                      <span className="flex items-center gap-1 font-semibold">
                        <span className="material-symbols-outlined text-sm">local_offer</span>
                        <span>FIRSTDINE applied (-৳200 discount!)</span>
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

                  {/* Itemized mini preview */}
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
                          ৳{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Financial Ledger */}
                  <div className="pt-space-md space-y-space-xs font-body-sm text-body-sm">
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span>Subtotal</span>
                      <span className="tabular-nums">৳{cart.subtotal.toLocaleString()}</span>
                    </div>
                    {fulfillmentMode === "delivery" && (
                      <div className="flex items-center justify-between text-on-surface-variant">
                        <span>Delivery Fee</span>
                        <span className="tabular-nums">৳{cart.deliveryFee.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span>Restaurant Packaging</span>
                      <span className="tabular-nums">৳{cart.packagingFee.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span>VAT / Govt Tax (5%)</span>
                      <span className="tabular-nums">৳{cart.tax.toLocaleString()}</span>
                    </div>
                    {cart.appliedCoupon && (
                      <div className="flex items-center justify-between text-secondary font-medium">
                        <span>First Dine Voucher</span>
                        <span className="tabular-nums">-৳{cart.discount.toLocaleString()}</span>
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
                            ৳{(grandTotal + cart.discount).toLocaleString()}
                          </span>
                        )}
                        <span className="font-headline-md text-headline-md font-bold text-primary-container tabular-nums">
                          ৳{grandTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Big Primary Action Button */}
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
                        <span>Confirming Order...</span>
                      </>
                    ) : (
                      <>
                        <span>Place Order &amp; Pay ৳{grandTotal.toLocaleString()}</span>
                        <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                          arrow_forward
                        </span>
                      </>
                    )}
                  </button>

                  {/* Trust and Security Badges */}
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

                {/* Kitchen Chronicle & Note Card */}
                <div className="bg-surface-container-low p-space-md rounded flex items-start gap-space-sm">
                  <span className="material-symbols-outlined text-secondary text-xl shrink-0 mt-0.5">
                    restaurant
                  </span>
                  <div>
                    <p className="font-label-sm text-label-sm font-semibold text-on-surface">
                      Fresh Preparation Notice
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Sultan&apos;s Heritage starts slow-cooking mutton batches at dawn. Every box is
                      sealed under temperature check.
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
