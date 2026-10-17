"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import CustomerFooter from "@/components/customer/CustomerFooter";
import AddressFormDrawer from "@/components/customer/profile/AddressFormDrawer";
import DeleteAddressModal from "@/components/customer/profile/DeleteAddressModal";
import ProfileToast from "@/components/customer/profile/ProfileToast";

import { CustomerAddress } from "@/types/customerProfile";
import {
  getCustomerProfile,
  getCustomerAddresses,
  setDefaultCustomerAddress,
  deleteCustomerAddress,
  upsertCustomerAddress,
  exportAddressesToCSV,
} from "@/services/mockCustomerProfileService";
import { INITIAL_CUSTOMER_PROFILE } from "@/data/mockCustomerProfile";
import { getSavedRestaurants, getSavedDishes } from "@/services/mockCustomerFavoritesService";

export default function CustomerAddressesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(INITIAL_CUSTOMER_PROFILE);
  const [savedSpotsCount, setSavedSpotsCount] = useState(14);

  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isAddressDrawerOpen, setIsAddressDrawerOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [deletingAddress, setDeletingAddress] = useState<CustomerAddress | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [toast, setToast] = useState<{
    message: string | null;
    type: "success" | "error" | "info";
  }>({ message: null, type: "success" });

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev.message === message ? { ...prev, message: null } : prev));
    }, 3000);
  };

  useEffect(() => {
    const loadedProfile = getCustomerProfile();
    const loadedAddresses = getCustomerAddresses();
    const savedRest = getSavedRestaurants();
    const savedDish = getSavedDishes();

    setProfile(loadedProfile);
    setAddresses(loadedAddresses);
    setSavedSpotsCount(savedRest.length + savedDish.length || 14);
  }, []);

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

  const handleSetDefault = (addressId: string, addressLabel: string) => {
    const updated = setDefaultCustomerAddress(addresses, addressId);
    setAddresses(updated);
    showToast(`"${addressLabel}" set as your default delivery address.`);
  };

  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setIsAddressDrawerOpen(true);
  };

  const handleOpenEditAddress = (address: CustomerAddress) => {
    setEditingAddress(address);
    setIsAddressDrawerOpen(true);
  };

  const handleSaveAddress = (address: CustomerAddress) => {
    const isNew = !editingAddress;
    const updated = upsertCustomerAddress(addresses, address);
    setAddresses(updated);
    setIsAddressDrawerOpen(false);
    setEditingAddress(null);
    showToast(
      isNew
        ? `Added "${address.label}" to your saved addresses.`
        : `Updated address "${address.label}".`
    );
  };

  const handleConfirmDelete = () => {
    if (!deletingAddress) return;
    const label = deletingAddress.label;
    const updated = deleteCustomerAddress(addresses, deletingAddress.id);
    setAddresses(updated);
    setDeletingAddress(null);
    showToast(`Removed "${label}".`);
  };

  const handleExportCSV = () => {
    exportAddressesToCSV(addresses);
    showToast("Downloaded addresses as CSV.", "info");
  };

  return (
    <div className="bg-background min-h-screen text-on-surface flex flex-col font-body-md antialiased">
      <CustomerHeader
        userName={profile.fullName || "Tahmid Rahman"}
        userRole="Verified Foodie"
        avatarUrl={profile.avatarUrl}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex pt-16 flex-1">
        <CustomerSidebar
          userName={`${profile.fullName.split(" ")[0]}'s Account`}
          memberSince="Member since 2023"
          avatarUrl={profile.avatarUrl}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeOrderCount={1}
          loyaltyPoints={1450}
        />

        <main className="pl-0 lg:pl-72 flex-1 flex flex-col min-h-screen w-full">
          {/* Top Quick Stats */}
          <section className="w-full px-6 py-5 bg-surface-container-low border-b border-outline-variant/30">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-on-surface">
                  Welcome back, {profile.fullName.split(" ")[0] || "Tahmid"}
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {profile.email} • {profile.phone}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-surface-container-lowest px-4 py-2.5 rounded-lg border border-outline-variant shadow-2xs">
                  <span className="text-[11px] font-medium text-on-surface-variant block uppercase tracking-wider">
                    Total Orders
                  </span>
                  <span className="text-lg font-bold text-primary mt-0.5 block">
                    {profile.stats?.totalOrders ?? 28}
                  </span>
                </div>
                <div className="bg-surface-container-lowest px-4 py-2.5 rounded-lg border border-outline-variant shadow-2xs">
                  <span className="text-[11px] font-medium text-on-surface-variant block uppercase tracking-wider">
                    Bookings
                  </span>
                  <span className="text-lg font-bold text-secondary mt-0.5 block">
                    {profile.stats?.activeBookings ?? 1}
                  </span>
                </div>
                <div className="bg-surface-container-lowest px-4 py-2.5 rounded-lg border border-outline-variant shadow-2xs">
                  <span className="text-[11px] font-medium text-on-surface-variant block uppercase tracking-wider">
                    Saved Spots
                  </span>
                  <span className="text-lg font-bold text-primary mt-0.5 block">
                    {savedSpotsCount}
                  </span>
                </div>
                <div className="bg-surface-container-lowest px-4 py-2.5 rounded-lg border border-outline-variant shadow-2xs">
                  <span className="text-[11px] font-medium text-on-surface-variant block uppercase tracking-wider">
                    Points
                  </span>
                  <span className="text-lg font-bold text-primary-container mt-0.5 block">
                    {profile.stats?.loyaltyPoints?.toLocaleString() ?? "1,450"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Main Content Area */}
          <div className="w-full px-6 py-8 max-w-6xl mx-auto flex-1">
            <div className="flex flex-col w-full">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                    Saved Addresses
                  </h1>
                  <p className="text-sm text-on-surface-variant mt-1">
                    Manage where your food gets delivered. We will use your default address at checkout.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-surface-container-lowest hover:bg-surface-container text-xs text-on-surface font-medium rounded-lg border border-outline-variant transition-colors cursor-pointer shadow-2xs"
                    title="Export addresses as CSV"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    <span>Export CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenAddAddress}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-container hover:bg-primary text-on-primary text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                    <span>Add New Address</span>
                  </button>
                </div>
              </div>

              {/* Informative Default Banner */}
              <div className="bg-surface-container-lowest rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-outline-variant shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-lg">local_shipping</span>
                  </div>
                  <div>
                    <span className="text-xs text-on-surface-variant font-medium block">
                      Default Delivery Address
                    </span>
                    <p className="text-sm text-on-surface font-semibold">
                      {defaultAddress ? (
                        <>
                          {defaultAddress.label} • {defaultAddress.road}, {defaultAddress.city}
                        </>
                      ) : (
                        "No default address set"
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search address..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-surface-container-low text-xs rounded-md border border-outline-variant text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary-container"
                    />
                    <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant pointer-events-none">
                      search
                    </span>
                  </div>
                  <span className="text-xs text-on-surface-variant font-medium px-2">
                    {addresses.length} {addresses.length === 1 ? "address" : "addresses"}
                  </span>
                </div>
              </div>

              {/* Addresses Cards Grid */}
              {filteredAddresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
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
                        className={`bg-surface-container-lowest rounded-xl p-5 shadow-2xs border transition-all flex flex-col justify-between gap-4 hover:shadow-xs ${
                          isDefault
                            ? "border-primary-container ring-1 ring-primary-container/20"
                            : "border-outline-variant"
                        }`}
                      >
                        <div className="flex flex-col gap-2.5">
                          {/* Card Top */}
                          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-base text-primary">
                                {categoryIcon}
                              </span>
                              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                                {addr.category || "Address"}
                              </span>
                            </div>

                            {isDefault ? (
                              <span className="bg-primary-fixed/80 text-on-primary-fixed px-2 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">check</span>
                                Default
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetDefault(addr.id, addr.label)}
                                className="text-xs text-on-surface-variant hover:text-primary underline cursor-pointer"
                              >
                                Set as default
                              </button>
                            )}
                          </div>

                          {/* Address Details */}
                          <div>
                            <h3 className="text-base font-bold text-primary">
                              {addr.label}
                            </h3>
                            <p className="text-xs text-on-surface-variant mt-0.5">
                              {addr.recipientName} • {addr.contactNumber}
                            </p>
                          </div>

                          <div className="text-xs text-on-surface flex flex-col gap-0.5 leading-relaxed">
                            <p className="font-medium">
                              {addr.building}, {addr.road}
                            </p>
                            {addr.apartment && (
                              <p className="text-on-surface-variant">
                                {addr.apartment}
                              </p>
                            )}
                            <p className="text-on-surface-variant">
                              {addr.city} {addr.postalCode ? `— ${addr.postalCode}` : ""}
                            </p>
                          </div>

                          {/* Delivery Notes */}
                          {addr.deliveryInstructions && (
                            <div className="p-2.5 bg-surface-container-low rounded-lg text-xs text-on-surface-variant flex items-start gap-2 border border-outline-variant/40">
                              <span className="material-symbols-outlined text-sm text-secondary shrink-0 mt-0.5">
                                notes
                              </span>
                              <span className="line-clamp-2">
                                {addr.deliveryInstructions}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Card Actions */}
                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/30">
                          <button
                            type="button"
                            onClick={() => handleOpenEditAddress(addr)}
                            className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-xs text-primary transition-colors flex items-center gap-1 font-medium cursor-pointer border border-outline-variant"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingAddress(addr)}
                            className="px-3 py-1.5 rounded-lg hover:bg-error-container hover:text-on-error-container text-xs text-secondary transition-colors flex items-center gap-1 font-medium cursor-pointer border border-transparent"
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
                <div className="bg-surface-container-lowest rounded-2xl p-12 text-center border border-outline-variant/30 my-4 shadow-2xs flex flex-col items-center">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/60 mb-3">
                    location_off
                  </span>
                  <h3 className="text-lg font-bold text-primary">
                    {searchQuery ? "No matching addresses" : "No saved addresses yet"}
                  </h3>
                  <p className="text-sm text-on-surface-variant mt-1.5 max-w-sm">
                    {searchQuery
                      ? "Try searching for a different keyword or reset the search."
                      : "Add your home or office address to make ordering faster."}
                  </p>
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="mt-4 px-4 py-2 bg-surface-container-low text-xs font-semibold rounded-xl hover:bg-surface-container cursor-pointer"
                    >
                      Clear search
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleOpenAddAddress}
                      className="mt-5 px-5 py-2.5 bg-primary-container text-on-primary text-xs font-semibold rounded-xl hover:bg-primary transition-colors cursor-pointer"
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

      <ProfileToast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: null, type: "success" })}
      />
    </div>
  );
}
