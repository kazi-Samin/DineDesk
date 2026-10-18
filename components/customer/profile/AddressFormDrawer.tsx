"use client";

import { useEffect, useState } from "react";
import { CustomerAddress, AddressCategory } from "@/types/customerProfile";
import { getCustomerProfile } from "@/services/mockCustomerProfileService";

interface AddressFormDrawerProps {
  isOpen: boolean;
  editingAddress: CustomerAddress | null;
  onClose: () => void;
  onSave: (address: CustomerAddress) => void;
}

interface FormErrors {
  label?: string;
  recipientName?: string;
  contactNumber?: string;
  building?: string;
  road?: string;
  city?: string;
}

export default function AddressFormDrawer({
  isOpen,
  editingAddress,
  onClose,
  onSave,
}: AddressFormDrawerProps) {
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState<AddressCategory>("home");
  const [recipientName, setRecipientName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [building, setBuilding] = useState("");
  const [road, setRoad] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("Dhaka");
  const [postalCode, setPostalCode] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Sync state whenever drawer opens or editing address changes
  useEffect(() => {
    if (editingAddress) {
      setLabel(editingAddress.label);
      setCategory(editingAddress.category || "home");
      setRecipientName(editingAddress.recipientName);
      setContactNumber(editingAddress.contactNumber);
      setBuilding(editingAddress.building);
      setRoad(editingAddress.road);
      setApartment(editingAddress.apartment || "");
      setCity(editingAddress.city);
      setPostalCode(editingAddress.postalCode);
      setDeliveryInstructions(editingAddress.deliveryInstructions || "");
      setIsDefault(editingAddress.isDefault);
    } else {
      const currentProfile = getCustomerProfile();
      setLabel("");
      setCategory("home");
      setRecipientName(currentProfile.fullName || "");
      setContactNumber(currentProfile.phone || "");
      setBuilding("");
      setRoad("");
      setApartment("");
      setCity("Dhaka");
      setPostalCode("1213");
      setDeliveryInstructions("");
      setIsDefault(false);
    }
    setErrors({});
  }, [editingAddress, isOpen]);

  // Handle escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!label.trim()) {
      errs.label = "Address label is required (e.g. Home, Studio).";
    }
    if (!recipientName.trim()) {
      errs.recipientName = "Recipient name is required.";
    }
    if (!contactNumber.trim()) {
      errs.contactNumber = "Contact phone number is required.";
    } else if (!/^[+0-9\s-]{8,18}$/.test(contactNumber.trim())) {
      errs.contactNumber = "Enter a valid phone number (e.g. +880 1711-234567).";
    }
    if (!building.trim()) {
      errs.building = "House / building details are required.";
    }
    if (!road.trim()) {
      errs.road = "Road / area details are required.";
    }
    if (!city.trim()) {
      errs.city = "City is required.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    let subtitle = "Residential Hub • Verified Delivery";
    if (category === "office") {
      subtitle = "Corporate Office • Direct Desk Dispatch";
    } else if (category === "family") {
      subtitle = "Family Residence";
    } else if (category === "custom") {
      subtitle = "Custom Delivery Location";
    }

    const payload: CustomerAddress = {
      id: editingAddress?.id || `addr-${Date.now()}`,
      label: label.trim(),
      category,
      subtitle: editingAddress?.subtitle || subtitle,
      recipientName: recipientName.trim(),
      contactNumber: contactNumber.trim(),
      building: building.trim(),
      road: road.trim(),
      apartment: apartment.trim() || undefined,
      city: city.trim(),
      postalCode: postalCode.trim() || "1212",
      deliveryInstructions: deliveryInstructions.trim() || undefined,
      isDefault,
    };

    onSave(payload);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="address-drawer-title"
    >
      <div
        id="address-form-drawer"
        className="relative w-full max-w-xl bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-outline-variant/30 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="p-space-lg bg-surface-container-low flex items-start justify-between border-b border-outline-variant/30">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-xl">
                {editingAddress ? "edit_location_alt" : "add_location_alt"}
              </span>
            </div>
            <div className="flex flex-col">
              <h2
                id="address-drawer-title"
                className="font-headline-sm text-headline-sm text-primary font-semibold"
              >
                {editingAddress ? "Edit Delivery Address" : "Add New Delivery Address"}
              </h2>
              <p className="font-body-sm text-xs text-on-surface-variant">
                Configure your drop-off location and courier instructions across Dhaka.
              </p>
            </div>
          </div>
          <button
            className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
            onClick={onClose}
            type="button"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-space-lg flex flex-col gap-space-md scrollbar-none">
          {/* Category Pill Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-sm text-label-sm text-on-surface font-semibold">
              Location Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "home", label: "Home", icon: "home" },
                { id: "office", label: "Office", icon: "apartment" },
                { id: "family", label: "Family", icon: "cottage" },
                { id: "custom", label: "Custom", icon: "pin_drop" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id as AddressCategory)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                    category === cat.id
                      ? "bg-primary-container text-on-primary border-primary-container shadow-xs font-semibold"
                      : "bg-surface-container-low text-on-surface-variant border-outline-variant/40 hover:bg-surface-container hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {cat.icon}
                  </span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Address Identifier & Recipient */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface flex items-center justify-between font-semibold">
                <span>Address Identifier *</span>
                {errors.label && (
                  <span className="text-error text-[11px] font-medium">
                    {errors.label}
                  </span>
                )}
              </label>
              <input
                className={`px-space-md py-2.5 bg-surface-container-low rounded-lg border font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container transition-colors shadow-inner ${
                  errors.label
                    ? "border-error ring-1 ring-error"
                    : "border-outline-variant/40"
                }`}
                placeholder="e.g. Banani Residence, Studio"
                type="text"
                value={label}
                onChange={(e) => {
                  setLabel(e.target.value);
                  if (errors.label) setErrors({ ...errors, label: undefined });
                }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface flex items-center justify-between font-semibold">
                <span>Recipient Name *</span>
                {errors.recipientName && (
                  <span className="text-error text-[11px] font-medium">
                    {errors.recipientName}
                  </span>
                )}
              </label>
              <input
                className={`px-space-md py-2.5 bg-surface-container-low rounded-lg border font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container transition-colors shadow-inner ${
                  errors.recipientName
                    ? "border-error ring-1 ring-error"
                    : "border-outline-variant/40"
                }`}
                placeholder="e.g. Tahmid Rahman"
                type="text"
                value={recipientName}
                onChange={(e) => {
                  setRecipientName(e.target.value);
                  if (errors.recipientName)
                    setErrors({ ...errors, recipientName: undefined });
                }}
              />
            </div>
          </div>

          {/* Contact & Building */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface flex items-center justify-between font-semibold">
                <span>Contact Phone *</span>
                {errors.contactNumber && (
                  <span className="text-error text-[11px] font-medium">
                    {errors.contactNumber}
                  </span>
                )}
              </label>
              <input
                className={`px-space-md py-2.5 bg-surface-container-low rounded-lg border font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container transition-colors shadow-inner ${
                  errors.contactNumber
                    ? "border-error ring-1 ring-error"
                    : "border-outline-variant/40"
                }`}
                placeholder="+880 1711-234567"
                type="tel"
                value={contactNumber}
                onChange={(e) => {
                  setContactNumber(e.target.value);
                  if (errors.contactNumber)
                    setErrors({ ...errors, contactNumber: undefined });
                }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface flex items-center justify-between font-semibold">
                <span>House / Building *</span>
                {errors.building && (
                  <span className="text-error text-[11px] font-medium">
                    {errors.building}
                  </span>
                )}
              </label>
              <input
                className={`px-space-md py-2.5 bg-surface-container-low rounded-lg border font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container transition-colors shadow-inner ${
                  errors.building
                    ? "border-error ring-1 ring-error"
                    : "border-outline-variant/40"
                }`}
                placeholder="House 42, Floor 5"
                type="text"
                value={building}
                onChange={(e) => {
                  setBuilding(e.target.value);
                  if (errors.building)
                    setErrors({ ...errors, building: undefined });
                }}
              />
            </div>
          </div>

          {/* Area / Road & Apartment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface flex items-center justify-between font-semibold">
                <span>Area / Road *</span>
                {errors.road && (
                  <span className="text-error text-[11px] font-medium">
                    {errors.road}
                  </span>
                )}
              </label>
              <input
                className={`px-space-md py-2.5 bg-surface-container-low rounded-lg border font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container transition-colors shadow-inner ${
                  errors.road
                    ? "border-error ring-1 ring-error"
                    : "border-outline-variant/40"
                }`}
                placeholder="Road 11, Block D"
                type="text"
                value={road}
                onChange={(e) => {
                  setRoad(e.target.value);
                  if (errors.road) setErrors({ ...errors, road: undefined });
                }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface font-semibold">
                Apartment / Suite (Optional)
              </label>
              <input
                className="px-space-md py-2.5 bg-surface-container-low rounded-lg border border-outline-variant/40 font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container transition-colors shadow-inner"
                placeholder="Flat 4B, South Wing"
                type="text"
                value={apartment}
                onChange={(e) => setApartment(e.target.value)}
              />
            </div>
          </div>

          {/* City & Postal Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface flex items-center justify-between font-semibold">
                <span>City *</span>
                {errors.city && (
                  <span className="text-error text-[11px] font-medium">
                    {errors.city}
                  </span>
                )}
              </label>
              <input
                className={`px-space-md py-2.5 bg-surface-container-low rounded-lg border font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container transition-colors shadow-inner ${
                  errors.city
                    ? "border-error ring-1 ring-error"
                    : "border-outline-variant/40"
                }`}
                placeholder="Dhaka"
                type="text"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  if (errors.city) setErrors({ ...errors, city: undefined });
                }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface font-semibold">
                Postal Code
              </label>
              <input
                className="px-space-md py-2.5 bg-surface-container-low rounded-lg border border-outline-variant/40 font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container transition-colors shadow-inner"
                placeholder="1213"
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </div>
          </div>

          {/* Rider Delivery Directives */}
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm text-on-surface font-semibold">
              Rider Delivery Instructions
            </label>
            <input
              className="px-space-md py-2.5 bg-surface-container-low rounded-lg border border-outline-variant/40 font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container transition-colors shadow-inner"
              placeholder="e.g. Leave with building security guard at main gate, call upon arrival."
              type="text"
              value={deliveryInstructions}
              onChange={(e) => setDeliveryInstructions(e.target.value)}
            />
          </div>

          {/* Default Checkbox */}
          <div className="flex items-center gap-space-sm pt-space-xs bg-surface-container-low/50 p-space-sm rounded-lg border border-outline-variant/20">
            <input
              className="w-4 h-4 rounded text-primary border-outline-variant focus:ring-0 cursor-pointer"
              id="default-addr-chk"
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
            />
            <label
              className="font-body-sm text-body-sm text-on-surface cursor-pointer select-none font-medium"
              htmlFor="default-addr-chk"
            >
              Set as my primary default delivery address
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-space-sm pt-space-sm border-t border-outline-variant/20 mt-space-xs">
            <button
              className="px-space-md py-2 font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="px-space-lg py-2.5 bg-primary-container text-on-primary rounded-xl font-label-md text-label-md font-semibold hover:bg-primary shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              type="submit"
            >
              <span className="material-symbols-outlined text-base">save</span>
              {editingAddress ? "Update Address" : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
