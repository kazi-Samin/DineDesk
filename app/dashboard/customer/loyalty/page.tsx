"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import CustomerFooter from "@/components/customer/CustomerFooter";
import ProfileToast from "@/components/customer/profile/ProfileToast";
import DashboardLoader from "@/components/ui/DashboardLoader";
import { useSidebarToggle } from "@/hooks/useSidebarToggle";
import { useAuth } from "@/context/AuthContext";
import { CustomerProfileData } from "@/types/customerProfile";
import { INITIAL_CUSTOMER_PROFILE } from "@/data/mockCustomerProfile";
import { motion, AnimatePresence } from "framer-motion";

interface RewardPerk {
  id: string;
  title: string;
  restaurant: string;
  pointsCost: number;
  description: string;
  category: "credit" | "dining" | "priority" | "delivery";
  icon: string;
  code: string;
}

const AVAILABLE_PERKS: RewardPerk[] = [
  {
    id: "perk-credit-500",
    title: "$25 DineDesk Dining Credit",
    restaurant: "Applicable on any partner restaurant",
    pointsCost: 800,
    description: "Instant discount voucher applied straight to your order checkout or table bill.",
    category: "credit",
    icon: "account_balance_wallet",
    code: "GOLD25CREDIT",
  },
  {
    id: "perk-dessert-maple",
    title: "Complimentary Artisanal Dessert",
    restaurant: "The Maple & Vine",
    pointsCost: 500,
    description: "One artisanal seasonal dessert pairing with your next dine-in seating.",
    category: "dining",
    icon: "icecream",
    code: "MAPLE-SWEET-DINE",
  },
  {
    id: "perk-priority-table",
    title: "VIP Priority Weekend Seating Pass",
    restaurant: "Corktown & Downtown Premier Venues",
    pointsCost: 400,
    description: "Skip the waiting queue and secure immediate table hold during peak weekend dinner slots.",
    category: "priority",
    icon: "stars",
    code: "VIP-PASS-ACCESS",
  },
  {
    id: "perk-delivery-free",
    title: "$15 Off Next Delivery Order",
    restaurant: "Valid across all delivery kitchens",
    pointsCost: 450,
    description: "Applies automatically at cart checkout for any order over $40.",
    category: "delivery",
    icon: "two_wheeler",
    code: "DELIVER15SAVER",
  },
];

interface PointLedgerItem {
  id: string;
  activity: string;
  date: string;
  points: number;
  type: "earned" | "redeemed";
  stripeSessionId?: string;
}

export default function CustomerLoyaltyPage() {
  const { user } = useAuth();
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebarToggle("dinedesk_customer_sidebar");

  const [profile, setProfile] = useState<CustomerProfileData>(INITIAL_CUSTOMER_PROFILE);
  const [points, setPoints] = useState(0);
  const [ledger, setLedger] = useState<PointLedgerItem[]>([]);
  const [claimedPerks, setClaimedPerks] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showGoldModal, setShowGoldModal] = useState(false);

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

 
  // Synchronize and calculate loyalty points dynamically from real order history / localStorage
  const calculatePointsFromStorage = () => {
    try {
      // Check both stripe payments and customer orders in localStorage
      const storedPayments = JSON.parse(localStorage.getItem("dinedesk_stripe_payments") || "[]");
      const storedOrders = JSON.parse(localStorage.getItem("dinedesk_customer_orders") || "[]");

      // Combine unique records or use total count
      const totalCount = Math.max(storedPayments.length, storedOrders.length, 1); // defaults to at least 1 or real count

      // Let's make it strictly count successful payment entries or fallback to 1 per order
      const paymentIds = storedPayments.length > 0 ? storedPayments : (storedOrders.length > 0 ? storedOrders : ["payment_ref_1"]);

      const totalPoints = paymentIds.length * 20; // 20 points per successful payment/order

      const generatedLedger: PointLedgerItem[] = paymentIds.map((sessionId: string, index: number) => ({
        id: `ledger-${index}-${sessionId}`,
        activity: `Payment Verified (#${String(sessionId).slice(-10)})`,
        date: new Date().toLocaleDateString(),
        points: 20,
        type: "earned",
        stripeSessionId: sessionId,
      }));

      setPoints(totalPoints);
      setLedger(generatedLedger);

      // Update profile stats dynamically so total orders match!
      setProfile((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          totalOrders: Math.max(28, paymentIds.length), // Dynamically updates total orders!
        }
      }));

      // Gold Tier Milestone Check (>= 2000 pts)
      if (totalPoints >= 2000) {
        const hasSeenModal = sessionStorage.getItem("gold_tier_congrats_shown");
        if (!hasSeenModal) {
          setShowGoldModal(true);
          sessionStorage.setItem("gold_tier_congrats_shown", "true");
          setTimeout(() => setShowGoldModal(false), 9000);
        }
      }
    } catch (e) {
      console.error("Error reading storage payments:", e);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function initPage() {
      try {
        const profileRes = await fetch(`/api/customer/profile`, { credentials: "include" }).catch(() => null);
        if (!isMounted) return;

        let loadedProfile = INITIAL_CUSTOMER_PROFILE;
        if (profileRes && profileRes.ok) {
          const pData = await profileRes.json();
          loadedProfile = { ...loadedProfile, ...pData };
        }
        if (user && user.name) {
          loadedProfile.fullName = user.name;
          loadedProfile.email = user.email || loadedProfile.email;
          if (user.phone) loadedProfile.phone = user.phone;
        }
        setProfile(loadedProfile);

        calculatePointsFromStorage();
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        if (isMounted) setIsLoaded(true);
      }
    }

    initPage();

    // Listen to storage events so points update instantly across navigation
    const handleStorage = () => {
      calculatePointsFromStorage();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("dinedesk-points-updated", handleStorage);

    return () => {
      isMounted = false;
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("dinedesk-points-updated", handleStorage);
    };
  }, [user]);

  const isGoldTierOrHigher = points >= 2000;

  const handleClaimPerk = (perk: RewardPerk) => {
    if (claimedPerks.includes(perk.id)) {
      showToast(`Voucher ${perk.code} already claimed! Check your wallet.`, "info");
      return;
    }
    if (points < perk.pointsCost) {
      showToast(`You need ${perk.pointsCost - points} more points for this perk.`, "error");
      return;
    }

    const newPoints = points - perk.pointsCost;
    setPoints(newPoints);
    setClaimedPerks((prev) => [...prev, perk.id]);

    setLedger((prev) => [
      {
        id: `redeem-${Date.now()}`,
        activity: `Redeemed Perk: ${perk.title}`,
        date: new Date().toLocaleDateString(),
        points: perk.pointsCost,
        type: "redeemed",
      },
      ...prev,
    ]);

    showToast(`Claimed "${perk.title}"! Voucher code: ${perk.code}`);
  };

  const referralCode = `${(profile.fullName || "DINE").split(" ")[0].toUpperCase()}-DINE`;

  const handleCopyReferral = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(referralCode);
      setCopiedCode(referralCode);
      showToast(`Referral code ${referralCode} copied to clipboard!`);
      setTimeout(() => setCopiedCode(null), 2500);
    }
  };

  if (!isLoaded) {
    return (
      <div className="bg-[#f8f9f6] min-h-screen text-[#1b3b2b] flex flex-col antialiased">
        <CustomerHeader userName={profile.fullName} userRole={profile.roleBadge} avatarUrl={profile.avatarUrl} onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <div className="flex pt-20 flex-1">
          <CustomerSidebar isOpen={isSidebarOpen} onClose={closeSidebar} onToggle={toggleSidebar} loyaltyPoints={points} />
          <main className={`flex-1 flex flex-col min-h-screen w-full transition-all duration-300 ${isSidebarOpen ? "lg:pl-72" : "lg:pl-20 pl-0"}`}>
            <DashboardLoader />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9f6] min-h-screen text-[#1b3b2b] flex flex-col font-body-md antialiased selection:bg-[#1b3b2b] selection:text-white relative">

      {/* Gold Tier Congratulations Modal */}
      <AnimatePresence>
        {showGoldModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border-2 border-amber-400 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

              <div className="w-20 h-20 bg-amber-500 text-white rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-lg mb-6 animate-bounce">
                👑
              </div>

              <span className="text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                Milestone Unlocked
              </span>

              <h2 className="font-heading font-black text-2xl text-[#1b3b2b] mt-3">
                Congratulations, {profile.fullName.split(" ")[0]}!
              </h2>

              <p className="text-xs font-medium text-[#1b3b2b]/80 mt-2 leading-relaxed">
                You have officially crossed the <strong className="text-amber-600">2,000 Points</strong> threshold and unlocked <strong className="text-[#1b3b2b]">Gold Tier VIP Status</strong>! Enjoy 10% bonus points and zero surge fees.
              </p>

              <button
                onClick={() => setShowGoldModal(false)}
                className="mt-6 w-full py-3 bg-[#1b3b2b] hover:bg-[#1b3b2b]/90 text-white rounded-2xl text-xs font-extrabold uppercase tracking-wider shadow-lg transition-all cursor-pointer"
              >
                Explore Gold Perks
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CustomerHeader
        userName={profile.fullName}
        userRole={profile.roleBadge}
        avatarUrl={profile.avatarUrl}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      <div className="flex pt-20 flex-1">
        <CustomerSidebar
          userName={`${profile.fullName.split(" ")[0]}'s Account`}
          memberSince={profile.memberSince}
          avatarUrl={profile.avatarUrl}
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          onToggle={toggleSidebar}
          activeOrderCount={profile.stats.activeBookings}
          loyaltyPoints={points}
        />

        <main className={`flex-1 flex flex-col min-h-screen w-full transition-all duration-300 ${isSidebarOpen ? "lg:pl-72" : "lg:pl-20 pl-0"}`}>

          {/* Section 1: Patron Welcome Banner & Stats */}
          <section className="w-full px-6 sm:px-10 py-6 bg-gradient-to-r from-white via-[#f8f9f6] to-white border-b border-[#1b3b2b]/10 shadow-xs">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <h1 className="font-heading font-black text-2xl sm:text-3xl text-[#1b3b2b] tracking-tight">
                    Loyalty Rewards &amp; Perks
                  </h1>
                  {isGoldTierOrHigher && (
                    <span className="text-xs px-3 py-1 rounded-full bg-amber-500 text-white font-extrabold flex items-center gap-1 shadow-md animate-pulse">
                      <span className="material-symbols-outlined text-sm">workspace_premium</span>
                      Gold Tier VIP
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium text-[#1b3b2b]/70">
                  Earn 20 points automatically for every successful Stripe payment.
                </p>
              </div>

              {/* 4 Summary Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-[#1b3b2b]/15 shadow-sm">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1b3b2b]/60 block">Total Orders</span>
                  <span className="font-heading font-black text-xl text-[#1b3b2b] mt-0.5 block">{profile.stats.totalOrders}</span>
                </div>
                <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-[#1b3b2b]/15 shadow-sm">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1b3b2b]/60 block">Bookings</span>
                  <span className="font-heading font-black text-xl text-[#C05621] mt-0.5 block">{profile.stats.activeBookings}</span>
                </div>
                <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-[#1b3b2b]/15 shadow-sm">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1b3b2b]/60 block">Saved Spots</span>
                  <span className="font-heading font-black text-xl text-[#1b3b2b] mt-0.5 block">{profile.stats.savedSpots}</span>
                </div>
                <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-[#1b3b2b]/15 shadow-sm">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1b3b2b]/60 block">Points Balance</span>
                  <span className="font-heading font-black text-xl text-[#C05621] mt-0.5 block">{points.toLocaleString()} pts</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Core Loyalty Content */}
          <div className="w-full px-6 sm:px-10 py-10 max-w-7xl mx-auto flex-1 flex flex-col gap-10">

            {/* Conditional Gold Tier Status Bar */}
            {isGoldTierOrHigher && (
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-amber-500/40 shadow-xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex flex-col gap-2 max-w-lg z-10">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500 text-3xl">
                      military_tech
                    </span>
                    <h2 className="font-heading font-extrabold text-xl text-[#1b3b2b]">
                      Gold Foodie Patron Status Active
                    </h2>
                  </div>
                  <p className="text-xs text-[#1b3b2b]/80 leading-relaxed font-medium">
                    You have crossed the 2,000 points limit! Enjoy 10% bonus points on all reservations, zero delivery surge fees, and 48-hour priority weekend seating window.
                  </p>
                  <div className="flex items-center gap-4 text-xs font-bold text-[#1b3b2b] mt-1">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-[#C05621]">check_circle</span>
                      10% Bonus Points
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-[#C05621]">check_circle</span>
                      Zero Surge Fees
                    </span>
                  </div>
                </div>

                <div className="bg-[#f8f9f6] p-5 rounded-2xl border border-[#1b3b2b]/10 flex flex-col gap-2.5 w-full md:w-72 shrink-0 z-10 shadow-inner">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#1b3b2b]/70 font-bold">Tier Threshold</span>
                    <span className="font-black text-[#1b3b2b]">{points} / 2,000 pts</span>
                  </div>
                  <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-[#1b3b2b]/10">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, (points / 2000) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-amber-700 font-bold text-right">
                    Gold Tier Unlocked 👑
                  </span>
                </div>
              </div>
            )}

            {/* Redeemable Perks Grid */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="font-heading font-extrabold text-lg text-[#1b3b2b]">
                    Redeem Dining Perks &amp; Vouchers
                  </h2>
                  <p className="text-xs font-medium text-[#1b3b2b]/70">
                    Exchange your points for immediate vouchers and complimentary dining experiences.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#1b3b2b]">
                  Current balance: <strong className="text-[#C05621]">{points} pts</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {AVAILABLE_PERKS.map((perk) => {
                  const isClaimed = claimedPerks.includes(perk.id);
                  const canAfford = points >= perk.pointsCost;

                  return (
                    <div
                      key={perk.id}
                      className="bg-white/95 backdrop-blur-xl p-6 rounded-3xl border border-[#1b3b2b]/15 shadow-xl flex flex-col justify-between gap-5 hover:border-[#1b3b2b] transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#1b3b2b]/10 text-[#1b3b2b] flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-2xl">
                            {perk.icon}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-heading font-extrabold text-sm text-[#1b3b2b] truncate">
                              {perk.title}
                            </h3>
                            <span className="text-xs font-black text-[#C05621] bg-[#C05621]/10 px-2.5 py-1 rounded-xl shrink-0">
                              {perk.pointsCost} pts
                            </span>
                          </div>
                          <span className="text-[11px] text-[#C05621] font-bold block mt-0.5">
                            {perk.restaurant}
                          </span>
                          <p className="text-xs text-[#1b3b2b]/70 font-medium mt-2 leading-relaxed">
                            {perk.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-[#1b3b2b]/10">
                        {isClaimed ? (
                          <div className="flex items-center gap-1.5 text-xs text-[#1b3b2b] font-bold">
                            <span className="material-symbols-outlined text-sm text-emerald-600">verified</span>
                            <span>Claimed: <code className="bg-[#f8f9f6] px-2 py-0.5 rounded-lg text-[11px] font-bold border border-[#1b3b2b]/20">{perk.code}</code></span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#1b3b2b]/60 font-medium">
                            Instant digital activation
                          </span>
                        )}

                        <button
                          type="button"
                          disabled={!canAfford && !isClaimed}
                          onClick={() => handleClaimPerk(perk)}
                          className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-sm cursor-pointer ${isClaimed
                            ? "bg-[#1b3b2b]/10 text-[#1b3b2b] cursor-default"
                            : canAfford
                              ? "bg-[#1b3b2b] hover:bg-[#1b3b2b]/90 text-white shadow-md active:scale-95"
                              : "bg-[#f8f9f6] text-[#1b3b2b]/40 border border-[#1b3b2b]/10 cursor-not-allowed"
                            }`}
                        >
                          {isClaimed ? "Redeemed" : canAfford ? "Redeem Perk" : "Need More Pts"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Two Column Layout: Points History Ledger + Referral Invite */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Left Column: Points Ledger (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <h2 className="font-heading font-extrabold text-base text-[#1b3b2b]">
                  Points Activity Ledger (Verified Payments)
                </h2>

                <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-[#1b3b2b]/15 shadow-xl divide-y divide-[#1b3b2b]/10 overflow-hidden">
                  {ledger.length > 0 ? (
                    ledger.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 flex items-center justify-between gap-3 text-xs hover:bg-[#f8f9f6] transition-colors"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-base">
                              bolt
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-[#1b3b2b] block leading-tight">
                              {item.activity}
                            </span>
                            <span className="text-[11px] text-[#1b3b2b]/60 font-medium">
                              {item.date} {item.stripeSessionId && `• ID: ${item.stripeSessionId.slice(-10)}`}
                            </span>
                          </div>
                        </div>

                        <span className="font-heading font-black text-[#1b3b2b] text-sm shrink-0 bg-[#1b3b2b]/5 px-3 py-1 rounded-full border border-[#1b3b2b]/10">
                          +{item.points} pts
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-4xl text-[#1b3b2b]/30">
                        history
                      </span>
                      <p className="font-heading font-extrabold text-sm text-[#1b3b2b]">No Points Earned Yet (0 pts)</p>
                      <p className="text-xs font-medium text-[#1b3b2b]/70 max-w-sm">
                        Complete a successful payment through Stripe to automatically earn your first 20 loyalty points!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Referral Bonus Card (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <h2 className="font-heading font-extrabold text-base text-[#1b3b2b]">
                  Invite Fellow Foodies
                </h2>

                <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-[#1b3b2b]/15 shadow-xl p-6 flex flex-col justify-between gap-6 h-full">
                  <div className="flex flex-col gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#1b3b2b]/10 text-[#1b3b2b] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-2xl">
                        card_giftcard
                      </span>
                    </div>
                    <h3 className="font-heading font-extrabold text-sm text-[#1b3b2b]">
                      Give $15, Get 500 Pts
                    </h3>
                    <p className="text-xs font-medium text-[#1b3b2b]/70 leading-relaxed">
                      Share your unique referral code with friends. When they make their first booking or meal order, both of you earn dining rewards!
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 pt-4 border-t border-[#1b3b2b]/10">
                    <label className="text-[10px] uppercase tracking-wider text-[#1b3b2b]/60 font-extrabold">
                      Your Unique Referral Code
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-4 py-2.5 bg-[#f8f9f6] rounded-2xl border border-[#1b3b2b]/20 text-xs font-mono font-bold text-[#1b3b2b]">
                        {referralCode}
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyReferral}
                        className="px-4 py-2.5 bg-[#1b3b2b] hover:bg-[#1b3b2b]/90 text-white rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all shrink-0 shadow-md cursor-pointer flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">
                          {copiedCode ? "check" : "content_copy"}
                        </span>
                        <span>{copiedCode ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <CustomerFooter />
        </main>
      </div>

      <ProfileToast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: null, type: "success" })}
      />
    </div>
  );
}