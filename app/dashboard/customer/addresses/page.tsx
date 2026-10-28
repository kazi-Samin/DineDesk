"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import CustomerFooter from "@/components/customer/CustomerFooter";
import AddressFormDrawer from "@/components/customer/profile/AddressFormDrawer";
import DeleteAddressModal from "@/components/customer/profile/DeleteAddressModal";
import DashboardLoader from "@/components/ui/DashboardLoader";

import { CustomerAddress, CustomerProfileData } from "@/types/customerProfile";
import { useSidebarToggle } from "@/hooks/useSidebarToggle";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://dine-desk-backend.vercel.app";

const getAuthToken = () => {
  if (typeof window === "undefined") return "";
  return (
    localStorage.getItem("dinedesk_auth_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("dinedesk_token") ||
    localStorage.getItem("auth_token") ||
    ""
  );
};

const EMPTY_PROFILE: CustomerProfileData = {
  fullName: "Diner",
  email: "",
  phone: "",
  avatarUrl: "",
  roleBadge: "Verified Foodie",
  memberSince: "Member since 2026",
  language: "en",
  dietaryPreferences: [],
  isEmailVerified: false,
  isPhoneVerified: false,
  passwordLastChangedDays: 0,
  twoFactorPhone: "",
  stats: {
    totalOrders: 0,
    activeBookings: 0,
    savedSpots: 0,
    loyaltyPoints: 0,
  },
};

export default function CustomerAddressesPage() {
  const { user } = useAuth();
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebarToggle(
    "dinedesk_customer_sidebar"
  );

  const [profile, setProfile] = useState<CustomerProfileData>(EMPTY_PROFILE);
  const [savedSpotsCount, setSavedSpotsCount] = useState(0);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  const [activeBookingsCount, setActiveBookingsCount] = useState(0);

  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isAddressDrawerOpen, setIsAddressDrawerOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(
    null
  );
  const [deletingAddress, setDeletingAddress] = useState<CustomerAddress | null>(
    null
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [toast, setToast] = useState<{
    message: string | null;
    type: "success" | "error" | "info";
  }>({ message: null, type: "success" });

  const realUserName = user?.name || profile.fullName || "Diner";
  const realUserEmail = user?.email || profile.email || "";

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) =>
        prev.message === message ? { ...prev, message: null } : prev
      );
    }, 3200);
  };

  const syncDatabaseData = useCallback(async () => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const [profileRes, ordersRes, resApi, favsRes, addressesRes] =
        await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/users/profile`, {
            method: "GET",
            headers,
            credentials: "include",
          }).catch(() => null),

          fetch(`${API_BASE_URL}/api/v1/orders/my`, {
            method: "GET",
            headers,
            credentials: "include",
          }).catch(() => null),

          fetch(`${API_BASE_URL}/api/v1/reservations`, {
            method: "GET",
            headers,
            credentials: "include",
          }).catch(() => null),

          fetch(`${API_BASE_URL}/api/v1/favorites`, {
            method: "GET",
            headers,
            credentials: "include",
          }).catch(() => null),

          fetch(`${API_BASE_URL}/api/v1/users/addresses`, {
            method: "GET",
            headers,
            credentials: "include",
          }).catch(() => null),
        ]);

      // 1. Process Profile & Loyalty Points
      let currentFullName = user?.name || "Diner";
      let currentEmail = user?.email || "";
      let currentPhone = user?.phone || "";
      let currentAvatar =
        user?.avatarUrl || (user as any)?.image || (user as any)?.avatar || "";
      let dbLoyaltyPoints = 0;

      if (profileRes && profileRes.ok) {
        const data = await profileRes.json();
        const userData = data.user || data.data || data;
        if (userData) {
          currentFullName =
            userData.fullName || userData.name || currentFullName;
          currentEmail = userData.email || currentEmail;
          currentPhone = userData.phone || currentPhone;
          currentAvatar =
            userData.avatarUrl || userData.image || currentAvatar;
          if (typeof userData.loyaltyPoints === "number") {
            dbLoyaltyPoints = userData.loyaltyPoints;
          }
        }
      }

      // 2. Process Live Database Orders (Strict single source of truth)
      let rawOrders: any[] = [];
      if (ordersRes && ordersRes.ok) {
        const apiData = await ordersRes.json();
        rawOrders = apiData.data || apiData.orders || [];
      }

      const validOrders = rawOrders.filter((ord: any) => {
        const st = String(ord.status || "").toLowerCase();
        return !st.includes("cancel");
      });

      const totalValidOrders = validOrders.length;
      const activeOrders = validOrders.filter((ord: any) => {
        const st = String(ord.status || "").toLowerCase();
        return st !== "delivered" && st !== "completed";
      }).length;

      // 3. Process Live Reservations
      let rawReservations: any[] = [];
      if (resApi && resApi.ok) {
        const apiData = await resApi.json();
        rawReservations =
          apiData.reservations || apiData.data || apiData || [];
      }

      const activeBookings = rawReservations.filter((r: any) => {
        const st = String(r.status || "").toLowerCase();
        return st === "confirmed" || st === "upcoming" || st === "pending";
      }).length;

      // 4. Process Live Favorites
      let liveFavoritesCount = 0;
      if (favsRes && favsRes.ok) {
        const favsData = await favsRes.json();
        const favList = favsData.data || favsData.menus || favsData.favorites || [];
        liveFavoritesCount = favList.length;
      }

      // 5. Process Live Saved Addresses
      if (addressesRes && addressesRes.ok) {
        const addrData = await addressesRes.json();
        const addressList = addrData.data || addrData.addresses || addrData || [];
        if (Array.isArray(addressList)) {
          setAddresses(addressList);
        }
      }

      const calculatedLoyalty =
        dbLoyaltyPoints > 0 ? dbLoyaltyPoints : totalValidOrders * 20;

      setProfile({
        ...EMPTY_PROFILE,
        fullName: currentFullName,
        email: currentEmail,
        phone: currentPhone,
        avatarUrl: currentAvatar,
        stats: {
          totalOrders: totalValidOrders,
          activeBookings,
          savedSpots: liveFavoritesCount,
          loyaltyPoints: calculatedLoyalty,
        },
      });

      setTotalOrdersCount(totalValidOrders);
      setActiveOrdersCount(activeOrders);
      setActiveBookingsCount(activeBookings);
      setSavedSpotsCount(liveFavoritesCount);
      setLoyaltyPoints(calculatedLoyalty);
    } catch (err) {
      console.error("Failed to sync live address and dashboard data:", err);
    } finally {
      setIsLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    syncDatabaseData();

    const handleSync = () => syncDatabaseData();
    window.addEventListener("profile-updated", handleSync);
    window.addEventListener("booking-updated", handleSync);
    window.addEventListener("order-updated", handleSync);

    return () => {
      window.removeEventListener("profile-updated", handleSync);
      window.removeEventListener("booking-updated", handleSync);
      window.removeEventListener("order-updated", handleSync);
    };
  }, [syncDatabaseData]);

  const filteredAddresses = useMemo(() => {
    if (!searchQuery.trim()) return addresses;
    const q = searchQuery.toLowerCase();
    return addresses.filter(
      (a) =>
        (a.label && a.label.toLowerCase().includes(q)) ||
        (a.road && a.road.toLowerCase().includes(q)) ||
        (a.building && a.building.toLowerCase().includes(q)) ||
        (a.city && a.city.toLowerCase().includes(q)) ||
        (a.recipientName && a.recipientName.toLowerCase().includes(q))
    );
  }, [addresses, searchQuery]);

  const defaultAddress = useMemo(() => {
    return addresses.find((a) => a.isDefault) || addresses[0];
  }, [addresses]);

  const handleSetDefault = async (addressId: string, addressLabel: string) => {
    try {
      const token = getAuthToken();
      const res = await fetch(
        `${API_BASE_URL}/api/v1/users/addresses/${addressId}/default`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
        }
      );

      if (res.ok) {
        const updatedResponse = await res.json();
        const updatedList =
          updatedResponse.data ||
          updatedResponse.addresses ||
          updatedResponse;

        if (Array.isArray(updatedList)) {
          setAddresses(updatedList);
        } else {
          setAddresses((prev) =>
            prev.map((a) => ({
              ...a,
              isDefault: a.id === addressId,
            }))
          );
        }
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
      const token = getAuthToken();
      const endpoint = isNew
        ? `${API_BASE_URL}/api/v1/users/addresses`
        : `${API_BASE_URL}/api/v1/users/addresses/${address.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(address),
        credentials: "include",
      });

      if (res.ok) {
        const responseData = await res.json();
        const updatedList =
          responseData.data || responseData.addresses || responseData;

        if (Array.isArray(updatedList)) {
          setAddresses(updatedList);
        } else {
          syncDatabaseData();
        }

        setIsAddressDrawerOpen(false);
        setEditingAddress(null);
        showToast(
          isNew
            ? `Added "${address.label}" to your saved addresses.`
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
      const token = getAuthToken();
      const res = await fetch(
        `${API_BASE_URL}/api/v1/users/addresses/${deletingAddress.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
        }
      );

      if (res.ok) {
        const responseData = await res.json();
        const updatedList =
          responseData.data || responseData.addresses || responseData;

        if (Array.isArray(updatedList)) {
          setAddresses(updatedList);
        } else {
          setAddresses((prev) =>
            prev.filter((a) => a.id !== deletingAddress.id)
          );
        }
        setDeletingAddress(null);
        showToast(`Removed "${label}".`);
      } else {
        showToast("Failed to delete address.", "error");
      }
    } catch (err) {
      showToast("Network error deleting address.", "error");
    }
  };

  const handleExportCSV = () => {
    if (addresses.length === 0) {
      showToast("No addresses available to export.", "info");
      return;
    }

    try {
      const headers = [
        "Label",
        "Recipient Name",
        "Contact Number",
        "Category",
        "Building",
        "Road",
        "Apartment",
        "City",
        "Postal Code",
        "Delivery Instructions",
        "Default",
      ];

      const rows = addresses.map((addr) => [
        `"${addr.label || ""}"`,
        `"${addr.recipientName || ""}"`,
        `"${addr.contactNumber || ""}"`,
        `"${addr.category || ""}"`,
        `"${addr.building || ""}"`,
        `"${addr.road || ""}"`,
        `"${addr.apartment || ""}"`,
        `"${addr.city || ""}"`,
        `"${addr.postalCode || ""}"`,
        `"${(addr.deliveryInstructions || "").replace(/"/g, '""')}"`,
        addr.isDefault ? "Yes" : "No",
      ]);

      const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `dinedesk-addresses-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast("Exported addresses successfully.", "success");
    } catch (err) {
      showToast("Failed to export addresses.", "error");
    }
  };

  if (!isLoaded) {
    return (
      <div className="bg-[#f8f9f6] min-h-screen text-[#1b3b2b] flex flex-col antialiased">
        <CustomerHeader
          userName={realUserName}
          userRole={profile.roleBadge}
          avatarUrl={profile.avatarUrl}
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />
        <div className="flex pt-20 flex-1">
          <CustomerSidebar
            isOpen={isSidebarOpen}
            onClose={closeSidebar}
            onToggle={toggleSidebar}
            loyaltyPoints={loyaltyPoints}
            upcomingReservationsCount={activeBookingsCount}
            activeOrdersCount={totalOrdersCount}
            activeOrderCount={activeOrdersCount}
          />
          <main
            className={`flex-1 flex flex-col min-h-screen w-full transition-all duration-300 ${isSidebarOpen ? "lg:pl-72" : "lg:pl-20 pl-0"
              }`}
          >
            <DashboardLoader />
          </main>
        </div>
      </div>
    );
  }

  const cleanFirstName = profile.fullName.split(" ")[0] || "Diner";

  return (
    <div className="bg-[#f8f9f6] min-h-screen text-[#1b3b2b] flex flex-col font-body-md antialiased selection:bg-[#1b3b2b] selection:text-white relative">
      <CustomerHeader
        userName={realUserName}
        userRole={profile.roleBadge}
        avatarUrl={profile.avatarUrl}
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex pt-20 flex-1">
        <CustomerSidebar
          userName={cleanFirstName}
          memberSince={profile.memberSince}
          avatarUrl={profile.avatarUrl}
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          onToggle={toggleSidebar}
          activeOrderCount={activeOrdersCount}
          activeOrdersCount={totalOrdersCount}
          upcomingReservationsCount={activeBookingsCount}
          loyaltyPoints={loyaltyPoints}
        />

        <main
          className={`flex-1 flex flex-col min-h-screen w-full transition-all duration-300 ${isSidebarOpen ? "lg:pl-72" : "lg:pl-20 pl-0"
            }`}
        >
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
                  Welcome back, {cleanFirstName}
                </h1>
                <p className="text-xs font-medium text-[#1b3b2b]/70 mt-0.5">
                  {realUserEmail} {profile.phone && `• ${profile.phone}`}
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
                    {activeBookingsCount}
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
                    Manage where your food gets delivered. Your default address
                    will be selected automatically at checkout.
                  </p>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/80 hover:bg-white text-xs font-bold text-[#1b3b2b] rounded-xl border border-[#1b3b2b]/20 transition-all cursor-pointer shadow-xs"
                    title="Export addresses as CSV"
                  >
                    <span className="material-symbols-outlined text-sm">
                      download
                    </span>
                    <span>Export CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenAddAddress}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#1b3b2b] hover:bg-[#1b3b2b]/90 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">
                      add
                    </span>
                    <span>Add New Address</span>
                  </button>
                </div>
              </div>

              {/* Informative Default Banner & Search Bar */}
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#1b3b2b]/15 shadow-xl">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#1b3b2b]/10 text-[#1b3b2b] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-2xl">
                      local_shipping
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#1b3b2b]/60 font-extrabold uppercase tracking-wider block">
                      Default Delivery Address
                    </span>
                    <p className="text-xs text-[#1b3b2b] font-bold mt-0.5">
                      {defaultAddress ? (
                        <>
                          {defaultAddress.label} — {defaultAddress.road},{" "}
                          {defaultAddress.city}
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
                    {addresses.length}{" "}
                    {addresses.length === 1 ? "address" : "addresses"}
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
                                <span className="material-symbols-outlined text-xs">
                                  check
                                </span>
                                Default
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  handleSetDefault(addr.id, addr.label)
                                }
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
                              {addr.recipientName}{" "}
                              {addr.contactNumber &&
                                `• ${addr.contactNumber}`}
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
                              {addr.city}{" "}
                              {addr.postalCode ? `— ${addr.postalCode}` : ""}
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
                            <span className="material-symbols-outlined text-sm">
                              edit
                            </span>
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingAddress(addr)}
                            className="px-4 py-2 rounded-xl hover:bg-red-50 text-xs text-red-600 hover:text-red-800 transition-all flex items-center gap-1.5 font-bold cursor-pointer border border-transparent"
                          >
                            <span className="material-symbols-outlined text-sm">
                              delete
                            </span>
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
                    <span className="material-symbols-outlined text-3xl">
                      location_off
                    </span>
                  </div>
                  <h3 className="font-heading font-extrabold text-lg text-[#1b3b2b]">
                    {searchQuery
                      ? "No matching addresses"
                      : "No saved addresses yet"}
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