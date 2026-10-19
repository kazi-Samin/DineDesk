"use client";

import { useState } from "react";
import { GalleryPhoto } from "@/types/profile";
import { POPULAR_CUISINE_SUGGESTIONS } from "@/data/mockRestaurantProfile";

// 1. Add Cuisine Tag Modal
interface AddCuisineTagModalProps {
  isOpen: boolean;
  existingTags: string[];
  onClose: () => void;
  onAddTag: (tag: string) => void;
}

export function AddCuisineTagModal({
  isOpen,
  existingTags,
  onClose,
  onAddTag,
}: AddCuisineTagModalProps) {
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleAdd = (tagToAdd?: string) => {
    const val = (tagToAdd ?? tagInput).trim();
    if (!val) {
      setError("Please enter a cuisine name.");
      return;
    }
    if (existingTags.some((t) => t.toLowerCase() === val.toLowerCase())) {
      setError("This cuisine tag has already been added.");
      return;
    }
    onAddTag(val);
    setTagInput("");
    setError("");
    onClose();
  };

  const unusedSuggestions = POPULAR_CUISINE_SUGGESTIONS.filter(
    (s) => !existingTags.some((t) => t.toLowerCase() === s.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-xs">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl border border-outline-variant/60 shadow-xl overflow-hidden animate-scale-in">
        <div className="p-space-md border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">restaurant</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              Add Cuisine Tag
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface cursor-pointer p-1 rounded-lg"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="p-space-lg space-y-space-md">
          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold">
              Cuisine Name
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => {
                setTagInput(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                }
              }}
              placeholder="e.g. Seafood & Crab"
              className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant/70 text-on-surface font-body-md focus:outline-none focus:border-primary"
              autoFocus
            />
            {error && <p className="mt-1 text-xs text-error">{error}</p>}
          </div>

          {unusedSuggestions.length > 0 && (
            <div>
              <span className="block font-label-sm text-xs text-on-surface-variant mb-2">
                Popular Suggestions:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {unusedSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleAdd(suggestion)}
                    className="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface hover:bg-primary-fixed/50 hover:text-on-primary-fixed text-xs font-medium border border-outline-variant/40 transition-colors cursor-pointer"
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-space-md bg-surface-container-low border-t border-outline-variant/30 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container font-label-md text-sm cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleAdd()}
            className="px-5 py-2 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-md text-sm font-semibold cursor-pointer shadow-xs"
          >
            Add Badge
          </button>
        </div>
      </div>
    </div>
  );
}

// 2. Reposition Cover Modal
interface RepositionCoverModalProps {
  isOpen: boolean;
  coverImage: string;
  initialCropY: number;
  onClose: () => void;
  onSave: (cropY: number) => void;
}

export function RepositionCoverModal({
  isOpen,
  coverImage,
  initialCropY,
  onClose,
  onSave,
}: RepositionCoverModalProps) {
  const [cropY, setCropY] = useState(initialCropY);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-xs">
      <div className="bg-surface-container-lowest w-full max-w-xl rounded-2xl border border-outline-variant/60 shadow-xl overflow-hidden animate-scale-in">
        <div className="p-space-md border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">crop</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              Reposition Storefront Cover
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface cursor-pointer p-1 rounded-lg"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="p-space-lg space-y-space-md">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Adjust the vertical focal point of your restaurant cover photo for desktop and mobile displays.
          </p>

          {/* Interactive preview box */}
          <div className="relative w-full h-48 rounded-xl overflow-hidden border border-outline-variant shadow-inner bg-surface-container">
            <div
              className="w-full h-full bg-cover transition-all duration-150"
              style={{
                backgroundImage: `url('${coverImage}')`,
                backgroundPosition: `center ${cropY}%`,
              }}
            />
            <div className="absolute inset-0 border-2 border-dashed border-white/60 pointer-events-none flex items-center justify-center">
              <span className="px-3 py-1 rounded bg-black/60 text-white font-label-sm text-xs backdrop-blur-xs">
                Focal Point: {cropY}%
              </span>
            </div>
          </div>

          {/* Slider and Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium">
              <span>Top Focus (0%)</span>
              <span>Center (50%)</span>
              <span>Bottom Focus (100%)</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={cropY}
              onChange={(e) => setCropY(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-surface-container-highest rounded-lg cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setCropY(15)}
              className="px-3 py-1 rounded bg-surface-container text-xs font-medium hover:bg-surface-container-high cursor-pointer"
            >
              Top (15%)
            </button>
            <button
              type="button"
              onClick={() => setCropY(50)}
              className="px-3 py-1 rounded bg-surface-container text-xs font-medium hover:bg-surface-container-high cursor-pointer"
            >
              Center (50%)
            </button>
            <button
              type="button"
              onClick={() => setCropY(85)}
              className="px-3 py-1 rounded bg-surface-container text-xs font-medium hover:bg-surface-container-high cursor-pointer"
            >
              Bottom (85%)
            </button>
          </div>
        </div>

        <div className="p-space-md bg-surface-container-low border-t border-outline-variant/30 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container font-label-md text-sm cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onSave(cropY);
              onClose();
            }}
            className="px-5 py-2 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-md text-sm font-semibold cursor-pointer shadow-xs"
          >
            Save Alignment
          </button>
        </div>
      </div>
    </div>
  );
}

// 3. Recalibrate Pin Modal
interface RecalibratePinModalProps {
  isOpen: boolean;
  latitude: number;
  longitude: number;
  coverageRadiusKm: number;
  onClose: () => void;
  onSave: (lat: number, lng: number, radiusKm: number) => void;
}

export function RecalibratePinModal({
  isOpen,
  latitude,
  longitude,
  coverageRadiusKm,
  onClose,
  onSave,
}: RecalibratePinModalProps) {
  const [lat, setLat] = useState(latitude);
  const [lng, setLng] = useState(longitude);
  const [radius, setRadius] = useState(coverageRadiusKm);

  if (!isOpen) return null;

  const presets = [
    { label: "Downtown Detroit", lat: 42.3314, lng: -83.0458 },
    { label: "Corktown (Michigan Ave)", lat: 42.3318, lng: -83.0682 },
    { label: "Midtown Detroit", lat: 42.3556, lng: -83.0645 },
    { label: "Riverfront Detroit", lat: 42.3278, lng: -83.0375 },
    { label: "Eastern Market", lat: 42.3486, lng: -83.0396 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-xs">
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl border border-outline-variant/60 shadow-xl overflow-hidden animate-scale-in">
        <div className="p-space-md border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">location_on</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              Recalibrate Navigation Pin
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface cursor-pointer p-1 rounded-lg"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="p-space-lg space-y-space-md">
          <div>
            <span className="block font-label-sm text-xs text-on-surface-variant mb-2">
              Detroit Metro Area Grid Presets:
            </span>
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setLat(p.lat);
                    setLng(p.lng);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    Math.abs(lat - p.lat) < 0.001 && Math.abs(lng - p.lng) < 0.001
                      ? "bg-primary-container text-on-primary border-primary"
                      : "bg-surface-container text-on-surface hover:bg-surface-container-high border-outline-variant/40"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-space-md">
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold">
                Latitude (° N)
              </label>
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/70 text-on-surface font-body-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold">
                Longitude (° E)
              </label>
              <input
                type="number"
                step="0.0001"
                value={lng}
                onChange={(e) => setLng(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/70 text-on-surface font-body-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                Delivery Coverage Radius
              </label>
              <span className="font-label-sm text-primary font-bold">{radius} km</span>
            </div>
            <input
              type="range"
              min={2}
              max={15}
              step={0.5}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-surface-container-highest rounded-lg cursor-pointer"
            />
            <p className="mt-1 text-xs text-on-surface-variant">
              Couriers within this boundary are eligible for dispatch pickup.
            </p>
          </div>
        </div>

        <div className="p-space-md bg-surface-container-low border-t border-outline-variant/30 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container font-label-md text-sm cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onSave(lat, lng, radius);
              onClose();
            }}
            className="px-5 py-2 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-md text-sm font-semibold cursor-pointer shadow-xs"
          >
            Update Coordinates
          </button>
        </div>
      </div>
    </div>
  );
}

// 4. Bulk Hours Modal
interface BulkHoursModalProps {
  isOpen: boolean;
  days: string[];
  onClose: () => void;
  onApply: (
    selectedDays: string[],
    openTime: string,
    closeTime: string,
    serviceType: string
  ) => void;
}

export function BulkHoursModal({
  isOpen,
  days,
  onClose,
  onApply,
}: BulkHoursModalProps) {
  const [selectedDays, setSelectedDays] = useState<string[]>(days);
  const [openTime, setOpenTime] = useState("12:00 PM");
  const [closeTime, setCloseTime] = useState("11:30 PM");
  const [serviceType, setServiceType] = useState("Dine-in & Takeaway");

  if (!isOpen) return null;

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSelectAll = () => setSelectedDays([...days]);
  const handleSelectWeekdays = () =>
    setSelectedDays(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"]);
  const handleSelectWeekend = () => setSelectedDays(["Friday", "Saturday"]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-xs">
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl border border-outline-variant/60 shadow-xl overflow-hidden animate-scale-in">
        <div className="p-space-md border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">schedule</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              Apply Bulk Operating Hours
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface cursor-pointer p-1 rounded-lg"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="p-space-lg space-y-space-md">
          {/* Quick selectors */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-on-surface-variant">Quick select:</span>
            <button
              type="button"
              onClick={handleSelectAll}
              className="px-2 py-0.5 rounded bg-surface-container text-xs hover:bg-surface-container-high cursor-pointer"
            >
              All 7 Days
            </button>
            <button
              type="button"
              onClick={handleSelectWeekdays}
              className="px-2 py-0.5 rounded bg-surface-container text-xs hover:bg-surface-container-high cursor-pointer"
            >
              Sun-Thu
            </button>
            <button
              type="button"
              onClick={handleSelectWeekend}
              className="px-2 py-0.5 rounded bg-surface-container text-xs hover:bg-surface-container-high cursor-pointer"
            >
              Fri-Sat
            </button>
          </div>

          {/* Days Checkbox Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {days.map((day) => {
              const isChecked = selectedDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`p-2 rounded-lg text-xs font-semibold border flex items-center justify-between cursor-pointer transition-colors ${
                    isChecked
                      ? "bg-primary-container text-on-primary border-primary"
                      : "bg-surface-container-low text-on-surface border-outline-variant/60 hover:bg-surface-container"
                  }`}
                >
                  <span>{day}</span>
                  <span className="material-symbols-outlined text-sm">
                    {isChecked ? "check_circle" : "radio_button_unchecked"}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-space-md pt-2">
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold">
                Opening Time
              </label>
              <input
                type="text"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                placeholder="12:00 PM"
                className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/70 text-on-surface font-body-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold">
                Closing Time
              </label>
              <input
                type="text"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                placeholder="11:30 PM"
                className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/70 text-on-surface font-body-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold">
              Service Type Label
            </label>
            <input
              type="text"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              placeholder="e.g. Dine-in & Takeaway"
              className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/70 text-on-surface font-body-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="p-space-md bg-surface-container-low border-t border-outline-variant/30 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container font-label-md text-sm cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={selectedDays.length === 0}
            onClick={() => {
              onApply(selectedDays, openTime, closeTime, serviceType);
              onClose();
            }}
            className="px-5 py-2 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-md text-sm font-semibold cursor-pointer shadow-xs disabled:opacity-50"
          >
            Apply to {selectedDays.length} Days
          </button>
        </div>
      </div>
    </div>
  );
}

// 5. Gallery Lightbox Modal
interface GalleryLightboxModalProps {
  photo: GalleryPhoto | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export function GalleryLightboxModal({
  photo,
  onClose,
  onDelete,
}: GalleryLightboxModalProps) {
  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative max-w-3xl w-full bg-surface-container-lowest rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-3 bg-black/60 flex items-center justify-between text-white">
          <span className="font-label-md text-sm font-semibold truncate px-2">
            {photo.caption || photo.alt}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (confirm("Remove this photo from atmosphere gallery?")) {
                  onDelete(photo.id);
                  onClose();
                }
              }}
              className="p-1.5 rounded-lg bg-error/80 hover:bg-error text-white cursor-pointer"
              title="Delete Photo"
            >
              <span className="material-symbols-outlined text-base">delete</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/20 text-white cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] flex items-center justify-center bg-black/90 p-2">
          <img
            src={photo.url}
            alt={photo.alt}
            className="max-h-[65vh] w-auto max-w-full object-contain rounded-lg"
          />
        </div>

        <div className="p-3 bg-surface-container-low border-t border-outline-variant/30 flex items-center justify-between text-xs text-on-surface-variant">
          <span>{photo.alt}</span>
          <button
            type="button"
            onClick={onClose}
            className="font-semibold text-primary hover:underline cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// 6. Discard Confirmation Dialog
interface DiscardConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DiscardConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
}: DiscardConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-xs">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl border border-outline-variant/60 shadow-xl overflow-hidden animate-scale-in">
        <div className="p-space-lg space-y-space-sm text-center">
          <div className="w-12 h-12 rounded-full bg-error-container text-on-error-container mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">warning</span>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface">
            Discard Unsaved Changes?
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            You have unsaved changes to your restaurant identity, media, or schedule. Reverting will reset the form to the last saved state.
          </p>
        </div>

        <div className="p-space-md bg-surface-container-low border-t border-outline-variant/30 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-on-surface hover:bg-surface-container font-label-md text-sm cursor-pointer"
          >
            Keep Editing
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2 rounded-lg bg-error text-on-error hover:bg-error/90 font-label-md text-sm font-semibold cursor-pointer shadow-xs"
          >
            Discard Changes
          </button>
        </div>
      </div>
    </div>
  );
}
