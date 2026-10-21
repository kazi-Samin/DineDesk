"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import CustomerFooter from "@/components/customer/CustomerFooter";
import AddressFormDrawer from "@/components/customer/profile/AddressFormDrawer";
import DeleteAddressModal from "@/components/customer/profile/DeleteAddressModal";
import ProfileToast from "@/components/customer/profile/ProfileToast";
import DashboardLoader from "@/components/ui/DashboardLoader";

import { CustomerAddress } from "@/types/customerProfile";
import { INITIAL_CUSTOMER_PROFILE } from "@/data/mockCustomerProfile";
import { useSidebarToggle } from "@/hooks/useSidebarToggle";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomerAddressesPage() {
  const { user } = useAuth();
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebarToggle("dinedesk_customer_sidebar");

  const [profile, setProfile] = useState(INITIAL_CUSTOMER_PROFILE);
  const [savedSpotsCount, setSavedSpotsCount] = useState(14);
  const [loyaltyPoints, setLoyaltyPoints] = useState(1450);
  const [totalOrdersCount, setTotalOrdersCount] = useState(28);

  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isAddressDrawerOpen, setIsAddressDrawerOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [deletingAddress, setDeletingAddress] = useState<CustomerAddress | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [toast, setToast] = useState<{
    message: string | null;
    type: "success" | "error" | "info";
  }>({ message: null, type: "success" });

  const realUserName = user?.name || profile.fullName || "Valued Diner";
  const realUserEmail = user?.email || profile.email || "diner@dinedesk.com";

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev.message === message ? { ...prev, message: null } : prev));
    }, 3200);
  };

  // Synchronize telemetry, real profiles, orders, and payment-based loyalty points
  const syncTelemetryData = async () => {
    try {
      const [profileRes, addressesRes, paymentsRes] = await Promise.all([
        fetch(`/api/customer/profile`, { credentials: "include" }).catch(() => null),
        fetch(`/api/customer/addresses`, { credentials: "include" }).catch(() => null),
        fetch(`/api/customer/payments`, { credentials: "include" }).catch(() => null),
      ]);

      let loadedProfile = INITIAL_CUSTOMER_PROFILE;
      if (profileRes && profileRes.ok) {
        const pData = await profileRes.json();
        loadedProfile = { ...loadedProfile, ...pData };
      }
      setProfile(loadedProfile);

      if (addressesRes && addressesRes.ok) {
        const aData = await addressesRes.json();
        setAddresses(aData);
      }

      // Dynamic calculation for payments / orders
      let apiPaymentsCount = 0;
      if (paymentsRes && paymentsRes.ok) {
        const paymentData = await paymentsRes.json();
        const paymentsList = paymentData.payments || paymentData.sessions || [];
        apiPaymentsCount = paymentsList.length;
      }

      const storedPayments = JSON.parse(localStorage.getItem("dinedesk_stripe_payments") || "[]");
      const totalPayments = Math.max(apiPaymentsCount, storedPayments.length, 1);

      setLoyaltyPoints(totalPayments * 20);
      setTotalOrdersCount(Math.max(28, totalPayments));
      setSavedSpotsCount(Math.max(14, addresses.length));
    } catch (err) {
      console.error("Failed to sync customer telemetry ledger:", err);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    syncTelemetryData();

    const handleStorage = () => {
      syncTelemetryData();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("dinedesk-points-updated", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("dinedesk-points-updated", handleStorage);
    };
  }, [user]);

  const filteredAddresses = useMemo(() => {
    if (!searchQuery.trim()) return addresses;
    const q = searchQuery.toLowerCase();
    return addresses.filter(
      (a) =>
        a.label.toLowerCase().includes(q) ||
        a.road.toLowerCase().includes(q) ||
        a.building.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.recipientName.toLowerCase().includes(q)
    );
  }, [addresses, searchQuery]);

  const defaultAddress = useMemo(() => {
    return addresses.find((a) => a.isDefault) || addresses[0];
  }, [addresses]);

  const handleSetDefault = async (addressId: string, addressLabel: string) => {
    try {
      const res = await fetch(`/api/customer/addresses/${addressId}/default`, {
        method: "PATCH",
        credentials: "include",
      });
      if (res.ok) {
        const updated = await res.json();
        setAddresses(updated);
        showToast(`"${addressLabel}" set as your default delivery address.`);
      } else {
        showToast("Failed to update default address.", "error");
      }
    } catch (err) {
      showToast("Network error updating address.", "error");
    }
  };

  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setIsAddressDrawerOpen(true);
  };

  const handleOpenEditAddress = (address: CustomerAddress) => {
    setEditingAddress(address);
    setIsAddressDrawerOpen(true);
  };

  const handleSaveAddress = async (address: CustomerAddress) => {
    const isNew = !editingAddress;
    try {
      const endpoint = isNew ? `/api/customer/addresses` : `/api/customer/addresses/${address.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(address),
        credentials: "include",
      });

      if (res.ok) {
        const updated = await res.json();
        setAddresses(updated);
        setIsAddressDrawerOpen(false);
        setEditingAddress(null);
        showToast(
          isNew
            ? `Added "${address.label}" to your database.`
            : `Updated address "${address.label}".`
        );
      } else {
        showToast("Failed to save address to database.", "error");
      }
    } catch (err) {
      showToast("Network error saving address.", "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingAddress) return;
    const label = deletingAddress.label;
    try {
      const res = await fetch(`/api/customer/addresses/${deletingAddress.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        const updated = await res.json();
        setAddresses(updated);
        setDeletingAddress(null);
        showToast(`Removed "${label}".`);
      } else {
        showToast("Failed to delete address.", "error");
      }
    } catch (err) {
      showToast("Network error deleting address.", "error");
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await fetch(`/api/customer/addresses/export`, { credentials: "include" });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "dinedesk-addresses.csv";
        a.click();
        showToast("Downloaded addresses as CSV.", "info");
      }
    } catch (err) {
      showToast("Export failed.", "error");
    }
  };

  if (!isLoaded) {
    return (
      <div className="bg-[#f8f9f6] min-h-screen text-[#1b3b2b] flex flex-col antialiased">
        <CustomerHeader userName={realUserName} userRole="Verified Foodie" avatarUrl={profile.avatarUrl} onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <div className="flex pt-20 flex-1">
          <CustomerSidebar isOpen={isSidebarOpen} onClose={closeSidebar} onToggle={toggleSidebar} loyaltyPoints={loyaltyPoints} />
          <main className={`flex-1 flex flex-col min-h-screen w-full transition-all duration-300 ${isSidebarOpen ? "lg:pl-72" : "lg:pl-20 pl-0"}`}>
            <DashboardLoader />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9f6] min-h-screen text-[#1b3b2b] flex flex-col font-body-md antialiased selection:bg-[#1b3b2b] selection:text-white relative">
      <CustomerHeader
        userName={realUserName}
        userRole="Verified Foodie"
        avatarUrl={profile.avatarUrl}
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex pt-20 flex-1">
        <CustomerSidebar
          userName={`${realUserName.split(" ")[0]}'s Account`}
          memberSince={profile.memberSince || "Member since 2023"}
          avatarUrl={profile.avatarUrl}
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          onToggle={toggleSidebar}
          activeOrderCount={profile.stats?.activeBookings ?? 1}
          loyaltyPoints={loyaltyPoints}
        />

        <main className={`flex-1 flex flex-col min-h-screen w-full transition-all duration-300 ${isSidebarOpen ? "lg:pl-72" : "lg:pl-20 pl-0"}`}>

          {/* Top Quick Stats Banner */}
          <section className="w-full px-6 sm:px-10 py-6 bg-gradient-to-r from-white via-[#f8f9f6] to-white border-b border-[#1b3b2b]/10 shadow-xs">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div>
                <h1 className="font-heading font-extrabold text-xl text-[#1b3b2b]">
                  Welcome back, {realUserName.split(" ")[0]}
                </h1>
                <p className="text-xs font-medium text-[#1b3b2b]/70 mt-0.5">
                  {realUserEmail} {user?.phone && `• ${user.phone}`}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-[#1b3b2b]/15 shadow-sm">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1b3b2b]/60 block">
                    Total Orders
                  </span>
                  <span className="font-heading font-black text-xl text-[#1b3b2b] mt-0.5 block">
                    {totalOrdersCount}
                  </span>
                </div>
                <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-[#1b3b2b]/15 shadow-sm">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1b3b2b]/60 block">
                    Bookings
                  </span>
                  <span className="font-heading font-black text-xl text-[#C05621] mt-0.5 block">
                    {profile.stats?.activeBookings ?? 1}
                  </span>
                </div>
                <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-[#1b3b2b]/15 shadow-sm">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1b3b2b]/60 block">
                    Saved Spots
                  </span>
                  <span className="font-heading font-black text-xl text-[#1b3b2b] mt-0.5 block">
                    {savedSpotsCount}
                  </span>
                </div>
                <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-[#1b3b2b]/15 shadow-sm">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1b3b2b]/60 block">
                    Loyalty Pts
                  </span>
                  <span className="font-heading font-black text-xl text-[#C05621] mt-0.5 block">
                    {loyaltyPoints.toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Main Content Area */}
          <div className="w-full px-6 sm:px-10 py-10 max-w-7xl mx-auto flex-1 flex flex-col gap-8">
            <div className="flex flex-col w-full">

              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="font-heading font-black text-2xl sm:text-3xl text-[#1b3b2b] tracking-tight">
                    Saved Addresses
                  </h1>
                  <p className="text-xs font-medium text-[#1b3b2b]/70 mt-1">
                    Manage where your food gets delivered. We will use your default address at checkout.
                  </p>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/80 hover:bg-white text-xs font-bold text-[#1b3b2b] rounded-xl border border-[#1b3b2b]/20 transition-all cursor-pointer shadow-xs"
                    title="Export addresses as CSV"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    <span>Export CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenAddAddress}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#1b3b2b] hover:bg-[#1b3b2b]/90 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                    <span>Add New Address</span>
                  </button>
                </div>
              </div>

              {/* Informative Default Banner & Search Bar */}
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#1b3b2b]/15 shadow-xl">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#1b3b2b]/10 text-[#1b3b2b] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-2xl">local_shipping</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#1b3b2b]/60 font-extrabold uppercase tracking-wider block">
                      Default Delivery Address
                    </span>
                    <p className="text-xs text-[#1b3b2b] font-bold mt-0.5">
                      {defaultAddress ? (
                        <>
                          {defaultAddress.label} — {defaultAddress.road}, {defaultAddress.city}
                        </>
                      ) : (
                        "No default address set"
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-60">
                    <input
                      type="text"
                      placeholder="Search address..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-[#f8f9f6] text-xs font-medium rounded-2xl border border-[#1b3b2b]/20 text-[#1b3b2b] placeholder:text-[#1b3b2b]/50 focus:outline-none focus:border-[#1b3b2b] shadow-inner"
                    />
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#1b3b2b]/50 pointer-events-none">
                      search
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-[#1b3b2b]/70 px-2 shrink-0">
                    {addresses.length} {addresses.length === 1 ? "address" : "addresses"}
                  </span>
                </div>
              </div>

              {/* Addresses Cards Grid */}
              {filteredAddresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {filteredAddresses.map((addr) => {
                    const isDefault = addr.isDefault;
                    const categoryIcon =
                      addr.category === "office"
                        ? "apartment"
                        : addr.category === "home"
                          ? "home"
                          : "location_on";

                    return (
                      <div
                        key={addr.id}
                        className={`bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-xl border transition-all flex flex-col justify-between gap-5 hover:border-[#1b3b2b] ${isDefault
                            ? "border-[#1b3b2b] ring-2 ring-[#1b3b2b]/20"
                            : "border-[#1b3b2b]/15"
                          }`}
                      >
                        <div className="flex flex-col gap-3">
                          {/* Card Top */}
                          <div className="flex items-center justify-between pb-3 border-b border-[#1b3b2b]/10">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-base text-[#1b3b2b]">
                                {categoryIcon}
                              </span>
                              <span className="text-[10px] font-extrabold text-[#1b3b2b]/70 uppercase tracking-widest">
                                {addr.category || "Address"}
                              </span>
                            </div>

                            {isDefault ? (
                              <span className="bg-[#1b3b2b] text-white px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                <span className="material-symbols-outlined text-xs">check</span>
                                Default
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetDefault(addr.id, addr.label)}
                                className="text-xs font-bold text-[#C05621] hover:underline cursor-pointer"
                              >
                                Set as default
                              </button>
                            )}
                          </div>

                          {/* Address Details */}
                          <div>
                            <h3 className="font-heading font-extrabold text-base text-[#1b3b2b]">
                              {addr.label}
                            </h3>
                            <p className="text-xs text-[#1b3b2b]/70 font-medium mt-0.5">
                              {addr.recipientName} {addr.contactNumber && `• ${addr.contactNumber}`}
                            </p>
                          </div>

                          <div className="text-xs text-[#1b3b2b] flex flex-col gap-1 leading-relaxed font-medium bg-[#f8f9f6] p-4 rounded-2xl border border-[#1b3b2b]/10">
                            <p className="font-bold text-[#1b3b2b]">
                              {addr.building}, {addr.road}
                            </p>
                            {addr.apartment && (
                              <p className="text-[#1b3b2b]/70">
                                {addr.apartment}
                              </p>
                            )}
                            <p className="text-[#1b3b2b]/70">
                              {addr.city} {addr.postalCode ? `— ${addr.postalCode}` : ""}
                            </p>
                          </div>

                          {/* Delivery Notes */}
                          {addr.deliveryInstructions && (
                            <div className="p-3.5 bg-[#f8f9f6] rounded-2xl text-xs text-[#1b3b2b]/80 flex items-start gap-2 border border-[#1b3b2b]/10 font-medium">
                              <span className="material-symbols-outlined text-sm text-[#C05621] shrink-0 mt-0.5">
                                notes
                              </span>
                              <span className="line-clamp-2">
                                {addr.deliveryInstructions}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Card Actions */}
                        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#1b3b2b]/10">
                          <button
                            type="button"
                            onClick={() => handleOpenEditAddress(addr)}
                            className="px-4 py-2 rounded-xl bg-[#f8f9f6] hover:bg-[#1b3b2b]/10 text-xs text-[#1b3b2b] transition-all flex items-center gap-1.5 font-bold cursor-pointer border border-[#1b3b2b]/20"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingAddress(addr)}
                            className="px-4 py-2 rounded-xl hover:bg-red-50 text-xs text-red-600 hover:text-red-800 transition-all flex items-center gap-1.5 font-bold cursor-pointer border border-transparent"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-16 text-center border border-[#1b3b2b]/15 my-6 shadow-xl flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#1b3b2b]/10 flex items-center justify-center text-[#1b3b2b] mb-4">
                    <span className="material-symbols-outlined text-3xl">location_off</span>
                  </div>
                  <h3 className="font-heading font-extrabold text-lg text-[#1b3b2b]">
                    {searchQuery ? "No matching addresses" : "No saved addresses yet"}
                  </h3>
                  <p className="text-xs font-medium text-[#1b3b2b]/70 mt-1.5 max-w-sm">
                    {searchQuery
                      ? "Try searching for a different keyword or reset the search."
                      : "Add your home or office address to make ordering faster and seamless."}
                  </p>
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="mt-5 px-5 py-2.5 bg-[#f8f9f6] text-xs font-bold rounded-xl hover:bg-[#1b3b2b]/10 text-[#1b3b2b] cursor-pointer border border-[#1b3b2b]/20"
                    >
                      Clear search
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleOpenAddAddress}
                      className="mt-6 px-6 py-3 bg-[#1b3b2b] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl hover:bg-[#1b3b2b]/90 transition-all shadow-md cursor-pointer"
                    >
                      + Add New Address
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <CustomerFooter />
        </main>
      </div>

      {/* Address Form Drawer / Modal */}
      <AddressFormDrawer
        isOpen={isAddressDrawerOpen}
        editingAddress={editingAddress}
        onClose={() => {
          setIsAddressDrawerOpen(false);
          setEditingAddress(null);
        }}
        onSave={handleSaveAddress}
      />

      {/* Delete Address Modal */}
      <DeleteAddressModal
        isOpen={Boolean(deletingAddress)}
        address={deletingAddress}
        onClose={() => setDeletingAddress(null)}
        onConfirm={handleConfirmDelete}
      />

      <AnimatePresence>
        {toast.message && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-8 right-8 z-50 bg-[#1b3b2b] text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 text-xs font-extrabold tracking-wide"
          >
            <span className="material-symbols-outlined text-amber-400 text-lg">
              check_circle
            </span>
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}