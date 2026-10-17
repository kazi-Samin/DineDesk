"use client";

import { useState, useEffect, useRef } from "react";
import {
  MenuItem,
  MenuItemFormInput,
  MenuCategory,
} from "@/types/menu";

interface AddEditDishModalProps {
  isOpen: boolean;
  editingItem: MenuItem | null;
  onClose: () => void;
  onSave: (data: MenuItemFormInput, id?: string) => void;
}

const CATEGORIES: MenuCategory[] = [
  "Heritage Mains",
  "Starters & Kebabs",
  "Desserts",
  "Traditional Refreshers",
  "Chef's Tasting Sets",
];

const DEFAULT_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAnJqvvt5EBgy4uJqz-HLn3H7c9Tly3PZYiCMVF8Jhfym9_phUBe7AiCQOpS3zFaR0YJxosB1D5X4FAVajRn-BgNUDoPfuRVIaEZRAXu_HGbnkYcMmqp89wStKLIEoyOjxwd_i53pPEVpOve-casivoYnEcs3WBo-EnPV8noYbjjjxKZZ_Qm47-y-Qx5WoqUHqsvduaAP7Yy4jGG5E9CE-9VKGQczjyh2OrpO2dLfWtjoGYiC1eP_j1BQ";

export default function AddEditDishModal({
  isOpen,
  editingItem,
  onClose,
  onSave,
}: AddEditDishModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<MenuCategory>("Heritage Mains");
  const [price, setPrice] = useState("");
  const [prepTime, setPrepTime] = useState("20 mins");
  const [description, setDescription] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  // Image handling
  const [imageUrl, setImageUrl] = useState(DEFAULT_IMAGE);
  const [imageFileName, setImageFileName] = useState("zafrani-mutton-korma-hq.jpg");
  const [imageFileSize, setImageFileSize] = useState("2.4 MB");

  // Dietary checkboxes
  const [dietary, setDietary] = useState({
    halal: true,
    chefRecommended: false,
    spicy: false,
    vegetarian: false,
    glutenFree: false,
  });

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setCategory(editingItem.category);
      setPrice(editingItem.price.toString());
      setPrepTime(editingItem.prepTime || "20 mins");
      setDescription(editingItem.description);
      setIsAvailable(editingItem.isAvailable);
      setImageUrl(editingItem.image || DEFAULT_IMAGE);
      setImageFileName("dish-photo.jpg");
      setImageFileSize("1.8 MB");
      setDietary(
        editingItem.dietary || {
          halal: true,
          chefRecommended: editingItem.isFeatured || false,
          spicy: false,
          vegetarian: false,
          glutenFree: false,
        }
      );
    } else {
      setName("");
      setCategory("Heritage Mains");
      setPrice("");
      setPrepTime("20 mins");
      setDescription("");
      setIsAvailable(true);
      setImageUrl(DEFAULT_IMAGE);
      setImageFileName("dish-showcase.jpg");
      setImageFileSize("2.1 MB");
      setDietary({
        halal: true,
        chefRecommended: false,
        spicy: false,
        vegetarian: false,
        glutenFree: false,
      });
    }
    setErrors({});
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, image: "Please upload an image file (PNG, JPG, WebP)." }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: "Image size must be less than 5MB." }));
      return;
    }

    setImageFileName(file.name);
    setImageFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageUrl(event.target.result as string);
        setErrors((prev) => {
          const next = { ...prev };
          delete next.image;
          return next;
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageUrl("");
    setImageFileName("");
    setImageFileSize("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Dish name is required.";
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      newErrors.price = "Valid price in ৳ (greater than 0) is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Build tags from dietary flags and custom settings
    const tags: string[] = [];
    if (dietary.halal) tags.push("Halal");
    if (dietary.vegetarian) tags.push("Vegetarian");
    if (dietary.spicy) tags.push("Spicy Special");
    if (dietary.glutenFree) tags.push("Gluten-free");
    if (category === "Heritage Mains") tags.push("Traditional");

    const payload: MenuItemFormInput = {
      name: name.trim(),
      category,
      price: numericPrice,
      prepTime: prepTime.trim() || "20 mins",
      description: description.trim() || "Authentic freshly prepared Bangladeshi specialty.",
      image: imageUrl || DEFAULT_IMAGE,
      imageFileName,
      imageFileSize,
      isAvailable,
      badge: dietary.chefRecommended ? "Chef Signature" : undefined,
      tags: tags.length > 0 ? tags : ["Halal"],
      dietary,
    };

    onSave(payload, editingItem?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-space-md bg-inverse-surface/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-surface-container-lowest rounded-xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-outline-variant/60">
        {/* Header */}
        <div className="px-space-lg py-space-md bg-surface-container flex items-center justify-between border-b border-outline-variant/40">
          <div className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">restaurant</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-medium leading-tight">
                {editingItem ? "Edit Menu Dish" : "Add New Dish to Menu"}
              </h2>
              <span className="font-body-sm text-xs text-on-surface-variant">
                Sultan&apos;s Heritage Kitchen • Real-time Sync
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-space-lg space-y-space-md">
          {/* Dish Name */}
          <div className="space-y-1.5">
            <label className="block font-label-md text-label-md text-on-surface font-semibold">
              Dish Name <span className="text-secondary">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((p) => ({ ...p, name: "" }));
              }}
              placeholder="e.g. Traditional Shahi Morog Polao"
              className={`w-full px-space-md py-2.5 rounded-lg bg-surface-container font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest transition-colors shadow-inner border ${
                errors.name ? "border-error" : "border-outline-variant/40"
              }`}
            />
            {errors.name && <p className="text-xs text-error">{errors.name}</p>}
          </div>

          {/* Category, Price & Prep Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md text-on-surface font-semibold">
                Menu Category <span className="text-secondary">*</span>
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as MenuCategory)}
                  className="w-full px-space-md py-2.5 rounded-lg bg-surface-container font-body-md text-body-md text-on-surface appearance-none focus:outline-none focus:bg-surface-container-lowest shadow-inner border border-outline-variant/40 cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-3 text-on-surface-variant pointer-events-none text-lg">
                  expand_more
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-space-sm">
              <div className="space-y-1.5">
                <label className="block font-label-md text-label-md text-on-surface font-semibold">
                  Price in ৳ <span className="text-secondary">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-label-md text-on-surface-variant font-semibold">
                    ৳
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="10"
                    required
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      if (errors.price) setErrors((p) => ({ ...p, price: "" }));
                    }}
                    placeholder="590"
                    className={`w-full pl-7 pr-3 py-2.5 rounded-lg bg-surface-container font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest shadow-inner border ${
                      errors.price ? "border-error" : "border-outline-variant/40"
                    }`}
                  />
                </div>
                {errors.price && <p className="text-[11px] text-error">{errors.price}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block font-label-md text-label-md text-on-surface font-semibold">
                  Prep Time
                </label>
                <input
                  type="text"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                  placeholder="25 mins"
                  className="w-full px-3 py-2.5 rounded-lg bg-surface-container font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest shadow-inner border border-outline-variant/40"
                />
              </div>
            </div>
          </div>

          {/* Culinary Description */}
          <div className="space-y-1.5">
            <label className="block font-label-md text-label-md text-on-surface font-semibold">
              Culinary Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Fragrant long-grain aged basmati layered with tender baby goat cuts, dried prunes, saffron-infused milk, and fried golden onions."
              className="w-full p-space-sm rounded-lg bg-surface-container font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest shadow-inner border border-outline-variant/40 resize-none text-xs"
            ></textarea>
            <span className="text-[11px] text-on-surface-variant font-body-sm block">
              Displays on the live customer dining menu and receipt breakdowns.
            </span>
          </div>

          {/* Dietary & Highlight Badges */}
          <div className="space-y-2">
            <label className="block font-label-md text-label-md text-on-surface font-semibold">
              Dietary &amp; Highlight Badges
            </label>
            <div className="flex items-center gap-space-md flex-wrap">
              <label className="inline-flex items-center gap-2 cursor-pointer font-body-sm text-body-sm text-on-surface">
                <input
                  type="checkbox"
                  checked={dietary.halal}
                  onChange={(e) => setDietary((p) => ({ ...p, halal: e.target.checked }))}
                  className="w-4 h-4 rounded text-primary-container focus:ring-0 cursor-pointer"
                />
                <span>Halal Certified</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer font-body-sm text-body-sm text-on-surface">
                <input
                  type="checkbox"
                  checked={dietary.chefRecommended}
                  onChange={(e) => setDietary((p) => ({ ...p, chefRecommended: e.target.checked }))}
                  className="w-4 h-4 rounded text-primary-container focus:ring-0 cursor-pointer"
                />
                <span>Chef&apos;s Recommendation</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer font-body-sm text-body-sm text-on-surface">
                <input
                  type="checkbox"
                  checked={dietary.spicy}
                  onChange={(e) => setDietary((p) => ({ ...p, spicy: e.target.checked }))}
                  className="w-4 h-4 rounded text-primary-container focus:ring-0 cursor-pointer"
                />
                <span>Spicy Special</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer font-body-sm text-body-sm text-on-surface">
                <input
                  type="checkbox"
                  checked={dietary.vegetarian}
                  onChange={(e) => setDietary((p) => ({ ...p, vegetarian: e.target.checked }))}
                  className="w-4 h-4 rounded text-primary-container focus:ring-0 cursor-pointer"
                />
                <span>Vegetarian Option</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer font-body-sm text-body-sm text-on-surface">
                <input
                  type="checkbox"
                  checked={dietary.glutenFree}
                  onChange={(e) => setDietary((p) => ({ ...p, glutenFree: e.target.checked }))}
                  className="w-4 h-4 rounded text-primary-container focus:ring-0 cursor-pointer"
                />
                <span>Gluten-free</span>
              </label>
            </div>
          </div>

          {/* Dish Visual Showcase */}
          <div className="space-y-1.5">
            <label className="block font-label-md text-label-md text-on-surface font-semibold">
              Dish Visual Showcase
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/webp"
              onChange={handleImageFileChange}
              className="hidden"
            />
            <div className="p-space-md rounded-xl bg-surface-container/60 border border-outline-variant/40 flex items-center gap-space-md">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 shadow-sm bg-surface-container-high flex items-center justify-center">
                {imageUrl ? (
                  <>
                    <img
                      className="w-full h-full object-cover"
                      src={imageUrl}
                      alt="Showcase preview"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/food-placeholder.svg";
                      }}
                    />
                    <span className="absolute bottom-1 right-1 bg-surface-container-lowest/90 px-1 py-0.5 rounded text-[10px] font-semibold text-primary">
                      PREVIEW
                    </span>
                  </>
                ) : (
                  <span className="material-symbols-outlined text-2xl text-on-surface-variant">
                    add_photo_alternate
                  </span>
                )}
              </div>

              <div className="flex-1 space-y-1">
                <p className="font-label-md text-label-md text-on-surface font-semibold">
                  {imageUrl ? "Uploaded photo ready" : "No photo selected"}
                </p>
                <p className="font-body-sm text-xs text-on-surface-variant">
                  {imageUrl
                    ? `${imageFileName || "dish-preview.jpg"} • ${imageFileSize || "2.4 MB"}`
                    : "Upload PNG, JPG, or WebP up to 5MB"}
                </p>
                <div className="flex items-center gap-space-sm pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="font-label-sm text-xs text-primary font-semibold hover:underline cursor-pointer"
                  >
                    {imageUrl ? "Replace photo" : "Select Photo"}
                  </button>
                  {imageUrl && (
                    <>
                      <span className="text-on-surface-variant text-xs">•</span>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="font-label-sm text-xs text-secondary hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
            {errors.image && <p className="text-xs text-error">{errors.image}</p>}
          </div>

          {/* Immediate Live Availability Toggle */}
          <div className="p-space-sm rounded-lg bg-surface-container flex items-center justify-between border border-outline-variant/30">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary text-xl">bolt</span>
              <div>
                <p className="font-label-md text-label-md text-on-surface font-semibold">
                  Immediate Live Availability
                </p>
                <span className="font-body-sm text-xs text-on-surface-variant">
                  Send directly to kitchen order display boards
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface peer-checked:bg-primary-container after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>

          {/* Modal Footer */}
          <div className="pt-space-md border-t border-outline-variant/40 flex items-center justify-between">
            <span className="font-body-sm text-[11px] text-on-surface-variant hidden sm:inline">
              Unsaved modifications are preserved in browser cache
            </span>
            <div className="flex items-center gap-space-sm justify-end w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-space-md py-2.5 rounded-lg bg-surface-container-high text-on-surface font-label-md hover:bg-surface-variant transition-colors cursor-pointer text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-space-md py-2.5 rounded-lg bg-primary-container text-on-primary font-label-md flex items-center gap-1.5 shadow-sm hover:bg-primary transition-all cursor-pointer text-xs font-semibold"
              >
                <span className="material-symbols-outlined text-base">check</span>
                <span>{editingItem ? "Update Dish" : "Save & Publish Dish"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
