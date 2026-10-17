"use client";

import { useEffect, useState } from "react";
import { CustomerAddress, AddressCategory } from "@/types/customerProfile";

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
      setLabel("");
      setCategory("home");
      setRecipientName("Tahmid Rahman");
      setContactNumber("+880 1712-345678");
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

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!label.trim()) {
      errs.label = "Address identifier / label is required.";
    }
    if (!recipientName.trim()) {
      errs.recipientName = "Recipient name is required.";
    }
    if (!contactNumber.trim()) {
      errs.contactNumber = "Contact number is required.";
    } else if (!/^[+0-9\s-]{8,18}$/.test(contactNumber.trim())) {
      errs.contactNumber = "Enter a valid phone number (e.g. +880 1712-345678).";
    }
    if (!building.trim()) {
      errs.building = "House / building information is required.";
    }
    if (!road.trim()) {
      errs.road = "Area / road details are required.";
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

    let subtitle = "Residential Hub • Verified GPS";
    if (category === "office") {
      subtitle = "Corporate Office • Freight Elevator Access";
    } else if (category === "family") {
      subtitle = "Weekend Residence";
    } else if (category === "custom") {
      subtitle = "Custom Delivery Coordinate";
    }

    const payload: CustomerAddress = {
      id: editingAddress?.id || `addr-custom-${Date.now()}`,
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
      id="address-form-drawer"
      className="p-space-lg bg-surface-container-low rounded-xl border border-outline-variant/40 flex flex-col gap-space-md transition-all animate-in fade-in slide-in-from-top-2"
    >
      <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/20">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-container text-lg">
            {editingAddress ? "edit_location_alt" : "add_location_alt"}
          </span>
          <span className="font-headline-sm text-body-lg text-primary font-semibold">
            {editingAddress ? "Edit Coordinate" : "Configure Coordinate"}
          </span>
        </div>
        <button
          className="text-on-surface-variant hover:text-on-surface p-1 rounded-md transition-colors"
          onClick={onClose}
          type="button"
          aria-label="Close form"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
        {/* Category Pill Selection */}
        <div className="flex flex-col gap-1.5">
          <label className="font-label-sm text-label-sm text-on-surface">
            Coordinate Category &amp; Icon
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
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                  category === cat.id
                    ? "bg-primary-container text-on-primary border-primary-container shadow-xs font-semibold"
                    : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/50 hover:bg-surface-container-high"
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
            <label className="font-label-sm text-label-sm text-on-surface flex items-center justify-between">
              <span>Address Identifier *</span>
              {errors.label && (
                <span className="text-error text-[11px] font-medium">
                  {errors.label}
                </span>
              )}
            </label>
            <input
              className={`px-space-md py-2 bg-surface-container-lowest rounded-md border font-body-sm text-body-sm focus:outline-none focus:border-primary-container shadow-2xs ${
                errors.label
                  ? "border-error focus:border-error"
                  : "border-outline-variant/60"
              }`}
              placeholder="e.g. Studio, Vacation Home"
              type="text"
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                if (errors.label) setErrors({ ...errors, label: undefined });
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm text-on-surface flex items-center justify-between">
              <span>Recipient Name *</span>
              {errors.recipientName && (
                <span className="text-error text-[11px] font-medium">
                  {errors.recipientName}
                </span>
              )}
            </label>
            <input
              className={`px-space-md py-2 bg-surface-container-lowest rounded-md border font-body-sm text-body-sm focus:outline-none focus:border-primary-container shadow-2xs ${
                errors.recipientName
                  ? "border-error focus:border-error"
                  : "border-outline-variant/60"
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
            <label className="font-label-sm text-label-sm text-on-surface flex items-center justify-between">
              <span>Contact Number *</span>
              {errors.contactNumber && (
                <span className="text-error text-[11px] font-medium">
                  {errors.contactNumber}
                </span>
              )}
            </label>
            <input
              className={`px-space-md py-2 bg-surface-container-lowest rounded-md border font-body-sm text-body-sm focus:outline-none focus:border-primary-container shadow-2xs ${
                errors.contactNumber
                  ? "border-error focus:border-error"
                  : "border-outline-variant/60"
              }`}
              placeholder="+880 1712-345678"
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
            <label className="font-label-sm text-label-sm text-on-surface flex items-center justify-between">
              <span>House / Building *</span>
              {errors.building && (
                <span className="text-error text-[11px] font-medium">
                  {errors.building}
                </span>
              )}
            </label>
            <input
              className={`px-space-md py-2 bg-surface-container-lowest rounded-md border font-body-sm text-body-sm focus:outline-none focus:border-primary-container shadow-2xs ${
                errors.building
                  ? "border-error focus:border-error"
                  : "border-outline-variant/60"
              }`}
              placeholder="House 42, Tower 71"
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
            <label className="font-label-sm text-label-sm text-on-surface flex items-center justify-between">
              <span>Area / Road *</span>
              {errors.road && (
                <span className="text-error text-[11px] font-medium">
                  {errors.road}
                </span>
              )}
            </label>
            <input
              className={`px-space-md py-2 bg-surface-container-lowest rounded-md border font-body-sm text-body-sm focus:outline-none focus:border-primary-container shadow-2xs ${
                errors.road
                  ? "border-error focus:border-error"
                  : "border-outline-variant/60"
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
            <label className="font-label-sm text-label-sm text-on-surface">
              Apartment / Suite (Optional)
            </label>
            <input
              className="px-space-md py-2 bg-surface-container-lowest rounded-md border border-outline-variant/60 font-body-sm text-body-sm focus:outline-none focus:border-primary-container shadow-2xs"
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
            <label className="font-label-sm text-label-sm text-on-surface flex items-center justify-between">
              <span>City *</span>
              {errors.city && (
                <span className="text-error text-[11px] font-medium">
                  {errors.city}
                </span>
              )}
            </label>
            <input
              className={`px-space-md py-2 bg-surface-container-lowest rounded-md border font-body-sm text-body-sm focus:outline-none focus:border-primary-container shadow-2xs ${
                errors.city
                  ? "border-error focus:border-error"
                  : "border-outline-variant/60"
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
            <label className="font-label-sm text-label-sm text-on-surface">
              Postal Code
            </label>
            <input
              className="px-space-md py-2 bg-surface-container-lowest rounded-md border border-outline-variant/60 font-body-sm text-body-sm focus:outline-none focus:border-primary-container shadow-2xs"
              placeholder="1213"
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
            />
          </div>
        </div>

        {/* Rider Directives */}
        <div className="flex flex-col gap-1">
          <label className="font-label-sm text-label-sm text-on-surface">
            Rider Delivery Directives
          </label>
          <input
            className="px-space-md py-2 bg-surface-container-lowest rounded-md border border-outline-variant/60 font-body-sm text-body-sm focus:outline-none focus:border-primary-container shadow-2xs"
            placeholder="Gate passcode, building landmarks, concierge hold..."
            type="text"
            value={deliveryInstructions}
            onChange={(e) => setDeliveryInstructions(e.target.value)}
          />
        </div>

        {/* Default Checkbox */}
        <div className="flex items-center gap-space-sm pt-space-xs">
          <input
            className="w-4 h-4 rounded text-primary border-outline-variant focus:ring-0 cursor-pointer"
            id="default-addr-chk"
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
          />
          <label
            className="font-body-sm text-body-sm text-on-surface cursor-pointer select-none"
            htmlFor="default-addr-chk"
          >
            Set as my primary delivery coordinate
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-space-sm pt-space-xs border-t border-outline-variant/20">
          <button
            className="px-space-md py-1.5 font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="px-space-lg py-2 bg-primary-container text-on-primary rounded-lg font-label-md text-label-md font-semibold hover:bg-primary shadow-xs transition-all flex items-center gap-1.5"
            type="submit"
          >
            <span className="material-symbols-outlined text-base">save</span>
            {editingAddress ? "Update Coordinate" : "Save Address Entry"}
          </button>
        </div>
      </form>
    </div>
  );
}
