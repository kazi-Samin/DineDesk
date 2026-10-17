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

  // Addresses state
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isAddressDrawerOpen, setIsAddressDrawerOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [deletingAddress, setDeletingAddress] = useState<CustomerAddress | null>(null);

  // Search filter inside addresses
  const [searchQuery, setSearchQuery] = useState("");

  // Toast feedback
  const [toast, setToast] = useState<{
    message: string | null;
    type: "success" | "error" | "info";
  }>({ message: null, type: "success" });

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev.message === message ? { ...prev, message: null } : prev));
    }, 3200);
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

  // Filtered addresses by search query
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

  // Set default address
  const handleSetDefault = (addressId: string, addressLabel: string) => {
    const updated = setDefaultCustomerAddress(addresses, addressId);
    setAddresses(updated);
    showToast(`"${addressLabel}" is now set as your default delivery address.`);
  };

  // Open drawer to add
  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setIsAddressDrawerOpen(true);
  };

  // Open drawer to edit
  const handleOpenEditAddress = (address: CustomerAddress) => {
    setEditingAddress(address);
    setIsAddressDrawerOpen(true);
  };

  // Save address from drawer
  const handleSaveAddress = (address: CustomerAddress) => {
    const isNew = !editingAddress;
    const updated = upsertCustomerAddress(addresses, address);
    setAddresses(updated);
    setIsAddressDrawerOpen(false);
    setEditingAddress(null);
    showToast(
      isNew
        ? `Added "${address.label}" to your saved delivery addresses.`
        : `Updated delivery address "${address.label}".`
    );
  };

  // Confirm delete address
  const handleConfirmDelete = () => {
    if (!deletingAddress) return;
    const label = deletingAddress.label;
    const updated = deleteCustomerAddress(addresses, deletingAddress.id);
    setAddresses(updated);
    setDeletingAddress(null);
    showToast(`Removed "${label}" from saved addresses.`);
  };

  // Export to CSV
  const handleExportCSV = () => {
    exportAddressesToCSV(addresses);
    showToast("Exported saved addresses to CSV.", "info");
  };

  return (
    <div className="bg-background min-h-screen text-on-surface flex flex-col font-body-md antialiased">
      {/* Customer Header */}
      <CustomerHeader
        userName={profile.fullName || "Tahmid Rahman"}
        userRole="Verified Foodie"
        avatarUrl={profile.avatarUrl}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex pt-16 flex-1">
        {/* Customer Sidebar */}
        <CustomerSidebar
          userName={`${profile.fullName.split(" ")[0]}'s Account`}
          memberSince="Patron since 2023"
          avatarUrl={profile.avatarUrl}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeOrderCount={1}
          loyaltyPoints={1450}
        />

        {/* Main Content Area */}
        <main className="pl-0 lg:pl-72 flex-1 flex flex-col min-h-screen w-full">
          {/* Customer Welcome & Patron Stats */}
          <section className="w-full px-space-xl py-space-lg bg-surface-container-low shadow-[0_1px_4px_rgba(0,0,0,0.02)] border-b border-outline-variant/30">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-space-lg">
              <div className="flex flex-col gap-1">
                <span className="font-display-mobile md:font-headline-lg text-headline-lg text-on-surface font-medium">
                  Welcome back, {profile.fullName.split(" ")[0] || "Tahmid"}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {profile.email} • {profile.phone}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md">
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.02)] border border-outline-variant/30">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block font-medium">
                    Total Orders
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">
                    28
                  </span>
                </div>
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.02)] border border-outline-variant/30">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block font-medium">
                    Active Bookings
                  </span>
                  <span className="font-headline-sm text-headline-sm text-secondary font-bold">
                    1
                  </span>
                </div>
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.02)] border border-outline-variant/30">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block font-medium">
                    Saved Spots
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">
                    {savedSpotsCount}
                  </span>
                </div>
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.02)] border border-outline-variant/30">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block font-medium">
                    Loyalty Points
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary-container font-bold">
                    1,450 pts
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Addresses Core Container */}
          <div className="w-full px-space-xl py-space-lg max-w-7xl mx-auto flex-1">
            <div className="flex flex-col w-full">
              {/* Header: Title & Action CTAs */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg pb-space-md border-b border-outline-variant/30">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-space-sm">
                    <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest font-semibold">
                      Logistics &amp; Dispatch
                    </span>
                    <span className="text-on-surface-variant/40">•</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                      Delivery Locations
                    </span>
                  </div>
                  <h1 className="font-display text-display text-primary tracking-tight font-medium">
                    Saved Delivery Addresses
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-2xl">
                    Manage your default delivery dispatch points, gate codes, and courier drop-off instructions across Dhaka.
                  </p>
                </div>

                <div className="flex items-center gap-space-sm flex-wrap self-start md:self-auto shrink-0">
                  <Link
                    href="/dashboard/customer/profile"
                    className="inline-flex items-center gap-1.5 px-space-md py-2 bg-surface-container-low hover:bg-surface-container text-on-surface rounded-xl font-label-md text-label-md transition-colors border border-outline-variant/40"
                  >
                    <span className="material-symbols-outlined text-base">person</span>
                    <span>Personal Profile</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="inline-flex items-center gap-1.5 px-space-md py-2 bg-surface-container-low hover:bg-surface-container text-on-surface rounded-xl font-label-md text-label-md transition-colors border border-outline-variant/40 cursor-pointer"
                    title="Export addresses as CSV spreadsheet"
                  >
                    <span className="material-symbols-outlined text-base">download</span>
                    <span>Export CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenAddAddress}
                    className="inline-flex items-center gap-1.5 px-space-lg py-2 bg-primary-container hover:bg-primary text-on-primary rounded-xl font-label-md text-label-md shadow-sm transition-all font-semibold cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">add_location_alt</span>
                    <span>+ Add New Address</span>
                  </button>
                </div>
              </div>

              {/* Informative Summary Banner */}
              <div className="bg-surface-container-low rounded-xl p-space-md mb-space-lg flex flex-col sm:flex-row sm:items-center justify-between gap-space-md border border-outline-variant/20 shadow-xs">
                <div className="flex items-center gap-space-md">
                  <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-xl">moped</span>
                  </div>
                  <div>
                    <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold block">
                      Active Dispatch Zone
                    </span>
                    <p className="font-body-md text-body-md text-on-surface font-medium">
                      {defaultAddress ? (
                        <>
                          <strong>{defaultAddress.label}</strong> ({defaultAddress.city}) — Gourmet courier runs default to this location.
                        </>
                      ) : (
                        "No default address set. Add an address to enable one-click delivery."
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-space-sm self-end sm:self-auto shrink-0">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Filter addresses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-surface-container-lowest text-xs rounded-lg border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary-container"
                    />
                    <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant pointer-events-none">
                      search
                    </span>
                  </div>
                  <span className="px-2.5 py-1 bg-surface-container-lowest rounded-lg font-label-sm text-label-sm text-primary font-semibold border border-outline-variant/30">
                    {addresses.length} {addresses.length === 1 ? "Address" : "Addresses"}
                  </span>
                </div>
              </div>

              {/* Addresses Cards Grid */}
              {filteredAddresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg mb-space-xl">
                  {filteredAddresses.map((addr) => {
                    const isDefault = addr.isDefault;
                    const categoryIcon =
                      addr.category === "office"
                        ? "work"
                        : addr.category === "home"
                        ? "home"
                        : "location_city";

                    return (
                      <div
                        key={addr.id}
                        className={`bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border transition-all flex flex-col justify-between gap-space-md hover:shadow-md ${
                          isDefault
                            ? "border-primary-container ring-1 ring-primary-container/20"
                            : "border-outline-variant/30"
                        }`}
                      >
                        {/* Card Header */}
                        <div className="flex flex-col gap-space-xs">
                          <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/20">
                            <div className="flex items-center gap-1.5">
                              <span className="p-1 rounded-md bg-surface-container text-primary">
                                <span className="material-symbols-outlined text-base">
                                  {categoryIcon}
                                </span>
                              </span>
                              <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                                {addr.category || "Location"}
                              </span>
                            </div>

                            {isDefault ? (
                              <span className="bg-primary-fixed text-on-primary-fixed px-2 py-0.5 rounded-md font-label-sm text-label-sm flex items-center gap-1 font-semibold">
                                <span className="material-symbols-outlined text-xs">check</span>
                                Default
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetDefault(addr.id, addr.label)}
                                className="text-xs text-on-surface-variant hover:text-primary underline underline-offset-2 cursor-pointer font-medium"
                              >
                                Set as Default
                              </button>
                            )}
                          </div>

                          {/* Address Title & Recipient */}
                          <div className="mt-1">
                            <h3 className="font-headline-sm text-headline-sm text-primary font-semibold">
                              {addr.label}
                            </h3>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">
                              {addr.recipientName} • {addr.contactNumber}
                            </p>
                          </div>

                          {/* Street & Area Details */}
                          <div className="mt-2 text-on-surface font-body-sm text-body-sm flex flex-col gap-0.5 leading-relaxed">
                            <p className="font-medium text-primary">
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

                          {/* Delivery Instructions Note */}
                          {addr.deliveryInstructions && (
                            <div className="mt-2 p-2.5 bg-surface-container-low rounded-lg text-xs text-on-surface-variant flex items-start gap-1.5 border border-outline-variant/20">
                              <span className="material-symbols-outlined text-sm text-secondary shrink-0 mt-0.5">
                                notes
                              </span>
                              <span className="line-clamp-2">
                                {addr.deliveryInstructions}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Card Footer Actions */}
                        <div className="flex items-center justify-between pt-space-sm border-t border-outline-variant/20 mt-space-xs">
                          <button
                            type="button"
                            onClick={() => handleOpenEditAddress(addr)}
                            className="inline-flex items-center gap-1 px-space-md py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container font-label-md text-label-md text-primary transition-colors font-medium cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingAddress(addr)}
                            className="inline-flex items-center gap-1 px-space-md py-1.5 rounded-lg hover:bg-error-container hover:text-on-error-container font-label-md text-label-md text-secondary transition-colors font-medium cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Empty State */
                <div className="bg-surface-container-lowest rounded-xl p-12 text-center border border-outline-variant/30 my-6 shadow-xs flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-space-md">
                    <span className="material-symbols-outlined text-3xl text-on-surface-variant">
                      location_off
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-primary font-medium">
                    {searchQuery ? "No matching addresses found" : "No Saved Delivery Addresses"}
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-md">
                    {searchQuery
                      ? `No saved addresses matched "${searchQuery}". Try clearing your search.`
                      : "Add your home, office, or dining venue addresses for smooth one-click meal dispatch."}
                  </p>
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="mt-space-lg px-space-lg py-2.5 bg-surface-container-high hover:bg-surface-container text-on-surface rounded-xl font-label-md text-label-md transition-colors font-medium cursor-pointer"
                    >
                      Clear Search
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleOpenAddAddress}
                      className="mt-space-lg px-space-lg py-2.5 bg-primary-container text-on-primary rounded-xl font-label-md text-label-md shadow-sm hover:bg-primary transition-colors font-semibold cursor-pointer"
                    >
                      + Add Your First Address
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Customer Footer */}
          <CustomerFooter />
        </main>
      </div>

      {/* Address Form Drawer */}
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

      {/* Profile Toast */}
      <ProfileToast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: null, type: "success" })}
      />
    </div>
  );
}
