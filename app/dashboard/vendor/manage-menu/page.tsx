// app/dashboard/vendor/manage-menu/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MenuItem {
  id: string;
  name?: string;
  menuName?: string;
  description?: string;
  price: number | string;
  category: string;
  cuisineCategory?: string;
  priceTier?: string;
  neighborhood?: string;
  deliveryTime?: string;
  deliveryFee?: number;
  imageUrl?: string;
  image?: string;
  isAvailable: boolean;
  isHalal?: boolean;
  isVegetarianFriendly?: boolean;
  isKidFriendly?: boolean;
  isDineIn?: boolean;
  isDelivery?: boolean;
  featured?: boolean;
  soldCount?: number;
  badge?: string | null;
  [key: string]: any;
}

interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: "success" | "info" | "error";
}

const PAGE_SIZE = 8;
const DEFAULT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://dine-desk-backend.vercel.app"
)
  .replace(/\/api\/v1\/?$/, "")
  .replace(/\/+$/, "") + "/api/v1";

const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "iwnkklnc";
const CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "dinedesk_menu_uploads";

const getAuthToken = () => {
  if (typeof window === "undefined") return "";
  const match = document.cookie.match(
    /(?:^|;\s*)(?:token|dinedesk_auth_token|better-auth\.session_token|auth_token|accessToken)=([^;]+)/
  );
  return match && match[1] ? match[1].trim() : "";
};

const getRequestHeaders = () => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    headers["x-session-token"] = token;
    headers["better-auth-session-token"] = token;
  }
  return headers;
};

function parseSerialFromTitle(title?: string): number | null {
  if (!title) return null;
  const match = title.match(/#(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

function parsePureDishName(title?: string): string {
  if (!title) return "";
  return title.replace(/^Menu\s+Item\s+#\d+:\s*/i, "").trim();
}

export default function ManageMenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [restaurantName, setRestaurantName] = useState("DineDesk Flagship Central Kitchen");
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "in-stock" | "sold-out">("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal Dialog State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);

  // Form Fields
  const [formSerialNum, setFormSerialNum] = useState<number>(1);
  const [formDishName, setFormDishName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formCategory, setFormCategory] = useState("Mains");
  const [formCuisineCategory, setFormCuisineCategory] = useState("asian");
  const [formPriceTier, setFormPriceTier] = useState("$$");
  const [formNeighborhood, setFormNeighborhood] = useState("Dhanmondi Satmasjid Rd");
  const [formDeliveryTime, setFormDeliveryTime] = useState("25-35 mins");
  const [formDeliveryFee, setFormDeliveryFee] = useState("5.00");
  const [formBadge, setFormBadge] = useState("");

  // Cloudinary Direct Image Upload State
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dietary & Service Toggles
  const [formIsHalal, setFormIsHalal] = useState(true);
  const [formIsVeg, setFormIsVeg] = useState(false);
  const [formIsKidFriendly, setFormIsKidFriendly] = useState(true);
  const [formIsDineIn, setFormIsDineIn] = useState(true);
  const [formIsDelivery, setFormIsDelivery] = useState(true);
  const [formFeatured, setFormFeatured] = useState(false);

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, message: string, type: "success" | "info" | "error" = "success") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  // Fetch real database records (Newest first)
  const fetchMenuFromDB = useCallback(async () => {
    setLoading(true);
    try {
      const headers = getRequestHeaders();
      let res = await fetch(`${API_BASE_URL}/menus/vendor`, {
        credentials: "include",
        headers,
      });

      if (!res.ok) {
        res = await fetch(`${API_BASE_URL}/menus`, {
          credentials: "include",
          headers,
        });
      }

      if (res.ok) {
        const json = await res.json();
        const items: MenuItem[] = json.menuItems || json.data || [];
        setMenuItems(items);
        if (json.restaurantName) {
          setRestaurantName(json.restaurantName);
        } else if (items.length > 0 && items[0].restaurantName) {
          setRestaurantName(items[0].restaurantName);
        }
      }
    } catch (err) {
      console.error("Failed to load catalog:", err);
      addToast("Connection Alert", "Could not sync menu catalog from database.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenuFromDB();
  }, [fetchMenuFromDB]);

  // Direct-to-Cloudinary Upload: bypasses Vercel's 4.5MB serverless limit for files up to 25MB
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      addToast("Invalid File", "Please select an image file (PNG, JPG, WEBP).", "error");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      addToast("File Too Large", "Max image size is 25MB.", "error");
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      formData.append("folder", "dinedesk/dishes");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (res.ok) {
        const data = await res.json();
        const secureUrl = data.secure_url || data.url;
        setUploadedImageUrl(secureUrl);
        addToast("Image Uploaded", "Dish photo stored directly in Cloudinary.", "success");
      } else {
        const err = await res.json().catch(() => ({}));
        addToast(
          "Upload Failed",
          err.error?.message || err.message || "Could not store image in Cloudinary.",
          "error"
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
      addToast("Network Error", "Failed to connect to Cloudinary upload service.", "error");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Next available serial suggestion
  const nextAvailableSerial = useMemo(() => {
    const existingNums = new Set(
      menuItems.map((i) => parseSerialFromTitle(i.name || i.menuName)).filter((n): n is number => n !== null)
    );
    for (let i = 1; i <= 500; i++) {
      if (!existingNums.has(i)) return i;
    }
    return menuItems.length + 1;
  }, [menuItems]);

  // Duplicate Check Validation
  const duplicateWarning = useMemo(() => {
    if (!formDishName.trim()) return null;

    const targetSerial = formSerialNum;
    const sameSerial = menuItems.find((i) => {
      if (editingItem && i.id === editingItem.id) return false;
      return parseSerialFromTitle(i.name || i.menuName) === targetSerial;
    });

    if (sameSerial) {
      return `Conflict Alert: Serial Menu Item #${targetSerial} is already allocated to "${parsePureDishName(sameSerial.name || sameSerial.menuName)}". Choose another number.`;
    }

    const pureCurrent = formDishName.trim().toLowerCase();
    const sameName = menuItems.find((i) => {
      if (editingItem && i.id === editingItem.id) return false;
      return parsePureDishName(i.name || i.menuName).toLowerCase() === pureCurrent;
    });

    if (sameName) {
      return `Conflict Alert: A dish titled "${formDishName}" already exists in PostgreSQL.`;
    }

    return null;
  }, [formSerialNum, formDishName, menuItems, editingItem]);

  // Statistics
  const stats = useMemo(() => {
    const total = menuItems.length;
    const liveInKitchen = menuItems.filter((i) => i.isAvailable !== false).length;
    const soldOut = total - liveInKitchen;
    const avgPrice =
      total > 0
        ? menuItems.reduce((acc, i) => acc + Number(i.price || 0), 0) / total
        : 0;
    return {
      totalDishes: total,
      liveInKitchen,
      soldOutTonight: soldOut,
      avgPrice: avgPrice.toFixed(2),
    };
  }, [menuItems]);

  // Categories
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { total: menuItems.length };
    menuItems.forEach((item) => {
      const cat = item.category || "Mains";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [menuItems]);

  const uniqueCategories = useMemo(() => {
    const cats = Array.from(new Set(menuItems.map((i) => i.category || "Mains"))).filter(Boolean);
    return ["all", ...cats];
  }, [menuItems]);

  // Filtered dataset
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (selectedCategory !== "all" && (item.category || "Mains") !== selectedCategory) {
        return false;
      }
      if (statusFilter === "in-stock" && item.isAvailable === false) {
        return false;
      }
      if (statusFilter === "sold-out" && item.isAvailable !== false) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const itemName = (item.name || item.menuName || "").toLowerCase();
        const matchesName = itemName.includes(q);
        const matchesDesc = (item.description || "").toLowerCase().includes(q);
        const matchesCat = (item.category || "").toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }
      return true;
    });
  }, [menuItems, selectedCategory, statusFilter, searchQuery]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, currentPage]);

  const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE) || 1;

  // Open Add Dialog
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormSerialNum(nextAvailableSerial);
    setFormDishName("");
    setFormDescription("");
    setFormPrice("19.50");
    setFormCategory("Mains");
    setFormCuisineCategory("asian");
    setFormPriceTier("$$");
    setFormNeighborhood("Dhanmondi Satmasjid Rd");
    setFormDeliveryTime("25-35 mins");
    setFormDeliveryFee("5.00");
    setFormBadge("");
    setUploadedImageUrl("");
    setImagePreview("");
    setFormIsHalal(true);
    setFormIsVeg(false);
    setFormIsKidFriendly(true);
    setFormIsDineIn(true);
    setFormIsDelivery(true);
    setFormFeatured(false);
    setIsModalOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    const existingSerial = parseSerialFromTitle(item.name || item.menuName);
    setFormSerialNum(existingSerial || 1);
    setFormDishName(parsePureDishName(item.name || item.menuName));
    setFormDescription(item.description || "");
    setFormPrice(String(item.price || "19.50"));
    setFormCategory(item.category || "Mains");
    setFormCuisineCategory(item.cuisineCategory || "asian");
    setFormPriceTier(item.priceTier || "$$");
    setFormNeighborhood(item.neighborhood || "Dhanmondi Satmasjid Rd");
    setFormDeliveryTime(item.deliveryTime || "25-35 mins");
    setFormDeliveryFee(String(item.deliveryFee || "5.00"));
    const existingImg = item.imageUrl || item.image || "";
    setUploadedImageUrl(existingImg);
    setImagePreview(existingImg);
    setFormBadge(item.badge || "");
    setFormIsHalal(item.isHalal !== false);
    setFormIsVeg(Boolean(item.isVegetarianFriendly));
    setFormIsKidFriendly(item.isKidFriendly !== false);
    setFormIsDineIn(item.isDineIn !== false);
    setFormIsDelivery(item.isDelivery !== false);
    setFormFeatured(Boolean(item.featured));
    setIsModalOpen(true);
  };

  // Submit to PostgreSQL
  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (duplicateWarning) {
      addToast("Duplicate Detected", duplicateWarning, "error");
      return;
    }

    if (isUploadingImage) {
      addToast("Upload in progress", "Please wait for your image to finish uploading to Cloudinary.", "info");
      return;
    }

    const compiledFullName = `Menu Item #${formSerialNum}: ${formDishName.trim()}`;
    const finalImage = uploadedImageUrl || DEFAULT_FALLBACK_IMAGE;

    try {
      const headers = getRequestHeaders();
      const payload = {
        name: compiledFullName,
        menuName: compiledFullName,
        description: formDescription,
        price: Number(formPrice),
        category: formCategory,
        cuisineCategory: formCuisineCategory,
        priceTier: formPriceTier,
        neighborhood: formNeighborhood,
        deliveryTime: formDeliveryTime,
        deliveryFee: Number(formDeliveryFee),
        imageUrl: finalImage,
        image: finalImage,
        badge: formBadge || undefined,
        isHalal: formIsHalal,
        isVegetarianFriendly: formIsVeg,
        isKidFriendly: formIsKidFriendly,
        isDineIn: formIsDineIn,
        isDelivery: formIsDelivery,
        featured: formFeatured,
        isAvailable: true,
      };

      const url = editingItem
        ? `${API_BASE_URL}/menus/vendor/${editingItem.id}`
        : `${API_BASE_URL}/menus/vendor`;
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers,
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        addToast(
          editingItem ? "Dish Updated" : "Dish Published",
          `"${compiledFullName}" saved with Cloudinary image.`,
          "success"
        );
        setIsModalOpen(false);
        fetchMenuFromDB();
      } else {
        const errorJson = await res.json().catch(() => ({}));
        addToast("Save Failed", errorJson.message || "Failed to commit changes.", "error");
      }
    } catch {
      addToast("Error", "Could not reach database server.", "error");
    }
  };

  const handleToggleAvailability = async (id: string) => {
    try {
      const headers = getRequestHeaders();
      const res = await fetch(`${API_BASE_URL}/menus/vendor/${id}/toggle`, {
        method: "PATCH",
        headers,
        credentials: "include",
      });

      if (res.ok) {
        fetchMenuFromDB();
        addToast("Stock Updated", "Kitchen availability toggled.", "success");
      }
    } catch {
      addToast("Error", "Failed to update item availability.", "error");
    }
  };

  const handleDeleteDish = async (id: string) => {
    try {
      const headers = getRequestHeaders();
      const res = await fetch(`${API_BASE_URL}/menus/vendor/${id}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });

      if (res.ok) {
        setDeletingItem(null);
        fetchMenuFromDB();
        addToast("Dish Removed", "Item deleted permanently from database.", "info");
      }
    } catch {
      addToast("Error", "Could not delete dish.", "error");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FBFBFA] font-sans text-[#1b3b2b] antialiased selection:bg-[#1b3b2b] selection:text-white pb-20">
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

        {/* 1. Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1b3b2b]/10"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-1.5 rounded-lg bg-[#1b3b2b]/5 text-[#1b3b2b]">
                <span className="material-symbols-outlined text-xl">restaurant_menu</span>
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1b3b2b] tracking-tight">
                Menu Management
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                Live PostgreSQL Catalog ({stats.totalDishes} Dishes)
              </span>
            </div>
            <p className="text-xs text-neutral-500 font-medium">
              Manage dishes, pricing, and live kitchen availability for <strong>{restaurantName}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={fetchMenuFromDB}
              disabled={loading}
              className="px-3.5 py-2.5 bg-white hover:bg-[#1b3b2b]/5 rounded-xl text-xs font-bold text-[#1b3b2b] border border-[#1b3b2b]/15 shadow-2xs cursor-pointer flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-base ${loading ? "animate-spin" : ""}`}>refresh</span>
              <span>{loading ? "Syncing..." : "Sync Catalog"}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2.5 bg-[#1b3b2b] hover:bg-[#1b3b2b]/90 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-base text-[#E2B774]">add</span>
              <span>Add New Dish</span>
            </motion.button>
          </div>
        </motion.div>

        {/* 2. Dynamic KPI Cards */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="p-4 rounded-2xl bg-white border border-[#1b3b2b]/10 shadow-xs space-y-1 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-bold uppercase tracking-wider">Total Curated Dishes</span>
              <span className="material-symbols-outlined text-[#1b3b2b] text-lg">menu_book</span>
            </div>
            <div className="text-2xl font-bold text-[#1b3b2b]">{stats.totalDishes}</div>
            <span className="text-[11px] text-emerald-700 font-semibold block">Live in PostgreSQL</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#1b3b2b]/10 shadow-xs space-y-1 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-bold uppercase tracking-wider">Live In-Kitchen</span>
              <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
            </div>
            <div className="text-2xl font-bold text-emerald-700">{stats.liveInKitchen}</div>
            <span className="text-[11px] text-neutral-500 font-medium block">Accepting orders</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#1b3b2b]/10 shadow-xs space-y-1 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-bold uppercase tracking-wider">Sold Out</span>
              <span className="material-symbols-outlined text-rose-600 text-lg">do_not_disturb_on</span>
            </div>
            <div className="text-2xl font-bold text-rose-600">{stats.soldOutTonight}</div>
            <span className="text-[11px] text-neutral-500 font-medium block">Stock replenishment needed</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#1b3b2b]/10 shadow-xs space-y-1 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-bold uppercase tracking-wider">Average Price</span>
              <span className="material-symbols-outlined text-[#C05621] text-lg">payments</span>
            </div>
            <div className="text-2xl font-bold text-[#C05621]">${stats.avgPrice}</div>
            <span className="text-[11px] text-neutral-500 font-medium block">Across active categories</span>
          </div>
        </motion.div>

        {/* 3. Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="p-5 sm:p-6 rounded-3xl bg-white border border-[#1b3b2b]/10 shadow-sm space-y-4"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-neutral-400 text-lg">
                search
              </span>
              <input
                type="text"
                placeholder="Search by dish name, category, or ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-neutral-50 rounded-xl border border-neutral-200 text-xs font-medium text-[#1b3b2b] focus:outline-none focus:ring-1 focus:ring-[#1b3b2b]"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-neutral-50 px-3 py-2 rounded-xl border border-neutral-200 text-xs font-bold text-[#1b3b2b] focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="in-stock">In Stock Only</option>
                <option value="sold-out">Sold Out Only</option>
              </select>
            </div>
          </div>

          {/* Dynamic Category Chips */}
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-neutral-100">
            {uniqueCategories.map((cat) => (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${selectedCategory === cat
                    ? "bg-[#1b3b2b] text-white shadow-2xs"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
              >
                {cat === "all" ? "All Categories" : cat} ({categoryCounts[cat] || 0})
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* 4. Menu Items Table / Cards */}
        <div className="bg-white rounded-3xl border border-[#1b3b2b]/10 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-16 text-center text-xs text-neutral-400 flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-3xl animate-spin">refresh</span>
              <span>Loading PostgreSQL menu catalog...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-16 text-center space-y-2">
              <span className="material-symbols-outlined text-4xl text-neutral-300">restaurant</span>
              <p className="text-xs text-neutral-500 font-medium">No dishes found matching your current filter criteria.</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              <AnimatePresence>
                {paginatedItems.map((item) => {
                  const dishTitle = item.name || item.menuName || "Culinary Dish";
                  const rawImage = item.imageUrl || item.image || DEFAULT_FALLBACK_IMAGE;

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/60 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-neutral-200 shrink-0 bg-neutral-100 relative shadow-2xs">
                          <img
                            src={rawImage}
                            alt={dishTitle}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = DEFAULT_FALLBACK_IMAGE;
                            }}
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-[#1b3b2b]">{dishTitle}</span>
                            {item.badge && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                                {item.badge}
                              </span>
                            )}
                            {item.isHalal && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Halal
                              </span>
                            )}
                            {item.isVegetarianFriendly && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-50 text-green-700 border border-green-200">
                                Veg
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-500 line-clamp-1 max-w-xl">
                            {item.description || "Freshly curated specialty prepared with premium authentic ingredients."}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap text-[11px] text-neutral-400 font-medium">
                            <span className="bg-neutral-100 px-2 py-0.5 rounded-md text-neutral-600 font-semibold">
                              {item.category || "Mains"}
                            </span>
                            <span>•</span>
                            <span>{item.neighborhood || "Central District"}</span>
                            <span>•</span>
                            <span>{item.deliveryTime || "25 mins"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                        <div className="text-right">
                          <span className="font-bold text-base text-[#1b3b2b]">${Number(item.price).toFixed(2)}</span>
                          <span className="text-[11px] text-neutral-400 block">{item.soldCount || 0} ordered</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <motion.button
                            whileTap={{ scale: 0.94 }}
                            type="button"
                            onClick={() => handleToggleAvailability(item.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${item.isAvailable !== false
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200"
                                : "bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-200"
                              }`}
                          >
                            {item.isAvailable !== false ? "In Stock" : "Sold Out"}
                          </motion.button>

                          <motion.button
                            whileTap={{ scale: 0.94 }}
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-[#1b3b2b] cursor-pointer"
                            title="Edit Dish"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </motion.button>

                          <motion.button
                            whileTap={{ scale: 0.94 }}
                            type="button"
                            onClick={() => setDeletingItem(item)}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                            title="Delete Dish"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500 font-medium">
              <span>Page {currentPage} of {totalPages}</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-xl bg-neutral-100 disabled:opacity-40 cursor-pointer font-bold hover:bg-neutral-200"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-xl bg-neutral-100 disabled:opacity-40 cursor-pointer font-bold hover:bg-neutral-200"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 5. Add / Edit Dish Modal with Direct Cloudinary Upload */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-neutral-200 space-y-6 my-8"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#1b3b2b] flex items-center justify-center text-[#E2B774] shadow-md shadow-[#1b3b2b]/15">
                    <span className="material-symbols-outlined text-xl">ramen_dining</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#1b3b2b]">
                      {editingItem ? "Edit Culinary Dish" : "Publish New Menu Dish"}
                    </h3>
                    <p className="text-xs text-neutral-400 font-medium">
                      Upload photos directly from device to Cloudinary (up to 25MB) and commit attributes to PostgreSQL.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              {/* Duplicate Warning */}
              {duplicateWarning && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-lg shrink-0">error</span>
                  <span>{duplicateWarning}</span>
                </div>
              )}

              <form onSubmit={handleSaveDish} className="space-y-4">
                {/* 1. Serial Number Dropdown + Dish Name */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#1b3b2b] block mb-1">
                      Menu Item # (Serial) *
                    </label>
                    <select
                      value={formSerialNum}
                      onChange={(e) => setFormSerialNum(Number(e.target.value))}
                      className="w-full bg-neutral-50 px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-[#1b3b2b] focus:ring-1 focus:ring-[#1b3b2b]"
                    >
                      {Array.from({ length: 500 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          Menu Item #{n}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-[#1b3b2b] block mb-1">
                      Recipe / Dish Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Korean Gochujang Sticky Fried Chicken"
                      value={formDishName}
                      onChange={(e) => setFormDishName(e.target.value)}
                      className="w-full bg-neutral-50 px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium text-[#1b3b2b] focus:ring-1 focus:ring-[#1b3b2b]"
                    />
                  </div>
                </div>

                {/* 2. Price, Price Tier & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#1b3b2b] block mb-1">Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="19.49"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="w-full bg-neutral-50 px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium text-[#1b3b2b] focus:ring-1 focus:ring-[#1b3b2b]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#1b3b2b] block mb-1">Price Tier</label>
                    <select
                      value={formPriceTier}
                      onChange={(e) => setFormPriceTier(e.target.value)}
                      className="w-full bg-neutral-50 px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-[#1b3b2b]"
                    >
                      <option value="$">$ (Budget Friendly)</option>
                      <option value="$$">$$ (Standard Dining)</option>
                      <option value="$$$">$$$ (Fine Specialty)</option>
                      <option value="$$$$">$$$$ (Executive Luxury)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#1b3b2b] block mb-1">Category *</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full bg-neutral-50 px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-[#1b3b2b]"
                    >
                      <option value="Mains">Mains</option>
                      <option value="Starters">Starters</option>
                      <option value="Desserts">Desserts</option>
                      <option value="Beverages">Beverages</option>
                      <option value="Desi & Biryani">Desi &amp; Biryani</option>
                      <option value="Chef's Tasting Menu">Chef&apos;s Tasting Menu</option>
                    </select>
                  </div>
                </div>

                {/* 3. Description */}
                <div>
                  <label className="text-xs font-bold text-[#1b3b2b] block mb-1">Culinary Description</label>
                  <textarea
                    rows={2}
                    placeholder="Authentic specialty prepared with premium ingredients, aromatic spices, and traditional techniques..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full bg-neutral-50 px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-[#1b3b2b] focus:ring-1 focus:ring-[#1b3b2b]"
                  />
                </div>

                {/* 4. Direct Device Image Upload to Cloudinary */}
                <div>
                  <label className="text-xs font-bold text-[#1b3b2b] block mb-1">
                    Upload Dish Photo (From Device to Cloudinary)
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 cursor-pointer transition-colors ${imagePreview
                        ? "border-[#1b3b2b]/30 bg-neutral-50/50"
                        : "border-neutral-200 hover:border-[#1b3b2b]/50 bg-neutral-50"
                      }`}
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0 flex items-center justify-center relative shadow-xs">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Dish Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-3xl text-neutral-400">add_photo_alternate</span>
                      )}
                      {isUploadingImage && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="material-symbols-outlined text-white animate-spin text-xl">refresh</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1 text-center sm:text-left">
                      <span className="text-xs font-bold text-[#1b3b2b] flex items-center gap-1.5 justify-center sm:justify-start">
                        <span className="material-symbols-outlined text-base text-[#E2B774]">cloud_upload</span>
                        <span>{isUploadingImage ? "Streaming to Cloudinary..." : "Choose Image from Device"}</span>
                      </span>
                      <p className="text-[11px] text-neutral-400">
                        PNG, JPG or WEBP up to 25MB. Uploads directly to Cloudinary without Vercel payload limits.
                      </p>
                      {uploadedImageUrl && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                          <span className="material-symbols-outlined text-xs">check_circle</span>
                          Cloudinary URL verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 5. Delivery & Location Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#1b3b2b] block mb-1">Neighborhood / Address</label>
                    <input
                      type="text"
                      placeholder="e.g. Dhanmondi Satmasjid Rd"
                      value={formNeighborhood}
                      onChange={(e) => setFormNeighborhood(e.target.value)}
                      className="w-full bg-neutral-50 px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-[#1b3b2b]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#1b3b2b] block mb-1">Delivery Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 27 mins"
                      value={formDeliveryTime}
                      onChange={(e) => setFormDeliveryTime(e.target.value)}
                      className="w-full bg-neutral-50 px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-[#1b3b2b]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#1b3b2b] block mb-1">Delivery Fee ($)</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="5.00"
                      value={formDeliveryFee}
                      onChange={(e) => setFormDeliveryFee(e.target.value)}
                      className="w-full bg-neutral-50 px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-[#1b3b2b]"
                    />
                  </div>
                </div>

                {/* 6. Dietary Flags & Toggles */}
                <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                  <span className="text-xs font-bold text-[#1b3b2b] block">Dietary &amp; Service Flags</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-neutral-600 font-medium">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsHalal}
                        onChange={(e) => setFormIsHalal(e.target.checked)}
                        className="rounded text-[#1b3b2b] focus:ring-[#1b3b2b]"
                      />
                      <span>100% Halal Certified</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsVeg}
                        onChange={(e) => setFormIsVeg(e.target.checked)}
                        className="rounded text-[#1b3b2b] focus:ring-[#1b3b2b]"
                      />
                      <span>Vegetarian Friendly</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsKidFriendly}
                        onChange={(e) => setFormIsKidFriendly(e.target.checked)}
                        className="rounded text-[#1b3b2b] focus:ring-[#1b3b2b]"
                      />
                      <span>Kid Friendly</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsDineIn}
                        onChange={(e) => setFormIsDineIn(e.target.checked)}
                        className="rounded text-[#1b3b2b] focus:ring-[#1b3b2b]"
                      />
                      <span>Available for Dine-In</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsDelivery}
                        onChange={(e) => setFormIsDelivery(e.target.checked)}
                        className="rounded text-[#1b3b2b] focus:ring-[#1b3b2b]"
                      />
                      <span>Available for Delivery</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formFeatured}
                        onChange={(e) => setFormFeatured(e.target.checked)}
                        className="rounded text-[#1b3b2b] focus:ring-[#1b3b2b]"
                      />
                      <span>Featured on Home Page</span>
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold text-neutral-500 hover:bg-neutral-100 rounded-xl cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={Boolean(duplicateWarning) || isUploadingImage}
                    className="px-5 py-2.5 bg-[#1b3b2b] hover:bg-[#1b3b2b]/90 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">cloud_done</span>
                    <span>{editingItem ? "Save Changes" : "Publish to PostgreSQL"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Delete Confirmation Dialog */}
      <AnimatePresence>
        {deletingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-center border border-neutral-200"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-2xl">delete</span>
              </div>
              <h3 className="text-lg font-bold text-[#1b3b2b]">Delete Dish?</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Are you sure you want to permanently delete <strong>{deletingItem.name || deletingItem.menuName}</strong> from PostgreSQL?
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingItem(null)}
                  className="px-4 py-2 text-xs font-bold text-neutral-500 hover:bg-neutral-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteDish(deletingItem.id)}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Animated Toasts */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="pointer-events-auto p-3.5 rounded-2xl border shadow-lg bg-white border-emerald-300 text-emerald-800 flex items-start gap-3"
            >
              <span className="material-symbols-outlined text-lg mt-0.5">check_circle</span>
              <div className="flex-1">
                <span className="font-semibold text-xs block">{toast.title}</span>
                <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">{toast.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}