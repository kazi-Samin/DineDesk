"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import CustomerFooter from "@/components/customer/CustomerFooter";
import ProfileToast from "@/components/customer/profile/ProfileToast";
import { getCustomerProfile } from "@/services/mockCustomerProfileService";
import { INITIAL_CUSTOMER_PROFILE } from "@/data/mockCustomerProfile";
import { CustomerProfileData } from "@/types/customerProfile";

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
    title: "৳500 DineDesk Dining Credit",
    restaurant: "Applicable on any partner restaurant",
    pointsCost: 800,
    description: "Instant discount voucher applied straight to your order checkout or table bill.",
    category: "credit",
    icon: "account_balance_wallet",
    code: "GOLD500CREDIT",
  },
  {
    id: "perk-dessert-sultan",
    title: "Complimentary Shahi Firni or Kulfi",
    restaurant: "Sultan's Heritage Kitchen",
    pointsCost: 500,
    description: "One artisanal traditional clay pot dessert with your next dine-in seating.",
    category: "dining",
    icon: "icecream",
    code: "SULTAN-SWEET-DINE",
  },
  {
    id: "perk-priority-table",
    title: "VIP Priority Weekend Seating Pass",
    restaurant: "Gulshan & Banani Premier Venues",
    pointsCost: 400,
    description: "Skip the waiting queue and secure immediate table hold during peak weekend dinner slots.",
    category: "priority",
    icon: "stars",
    code: "VIP-PASS-ACCESS",
  },
  {
    id: "perk-delivery-free",
    title: "৳250 Off Next Delivery Order",
    restaurant: "Valid across all delivery kitchens",
    pointsCost: 450,
    description: "Applies automatically at cart checkout for any order over ৳800.",
    category: "delivery",
    icon: "two_wheeler",
    code: "DELIVER250SAVER",
  },
];

interface PointLedgerItem {
  id: string;
  activity: string;
  date: string;
  points: number;
  type: "earned" | "redeemed";
}

const INITIAL_LEDGER: PointLedgerItem[] = [
  {
    id: "led-1",
    activity: "Table Seating at Sultan's Heritage Kitchen",
    date: "Oct 18, 2025",
    points: 200,
    type: "earned",
  },
  {
    id: "led-2",
    activity: "Detailed Verified Foodie Review for SmashCraft Studio",
    date: "Oct 10, 2025",
    points: 100,
    type: "earned",
  },
  {
    id: "led-3",
    activity: "Delivery Order #ORD-8429 from Sultan's Dine",
    date: "Sep 28, 2025",
    points: 150,
    type: "earned",
  },
  {
    id: "led-4",
    activity: "Friend Referral Bonus (Shafiq Joined)",
    date: "Sep 15, 2025",
    points: 500,
    type: "earned",
  },
  {
    id: "led-5",
    activity: "Welcome to DineDesk Foodie Circle",
    date: "Jan 12, 2024",
    points: 500,
    type: "earned",
  },
];

export default function CustomerLoyaltyPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<CustomerProfileData>(INITIAL_CUSTOMER_PROFILE);
  const [points, setPoints] = useState(1450);
  const [claimedPerks, setClaimedPerks] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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
    const p = getCustomerProfile();
    setProfile(p);
    setPoints(p.stats.loyaltyPoints || 1450);
  }, []);

  const handleClaimPerk = (perk: RewardPerk) => {
    if (claimedPerks.includes(perk.id)) {
      showToast(`Voucher ${perk.code} already claimed! Check your wallet.`, "info");
      return;
    }
    if (points < perk.pointsCost) {
      showToast(`You need ${perk.pointsCost - points} more points for this perk.`, "error");
      return;
    }

    setPoints((prev) => prev - perk.pointsCost);
    setClaimedPerks((prev) => [...prev, perk.id]);
    showToast(`Claimed "${perk.title}"! Voucher code: ${perk.code}`);
  };

  const handleCopyReferral = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText("TAHMID-DINE");
      setCopiedCode("TAHMID-DINE");
      showToast("Referral code TAHMID-DINE copied to clipboard!");
      setTimeout(() => setCopiedCode(null), 2500);
    }
  };

  return (
    <div className="bg-background min-h-screen text-on-surface flex flex-col font-body-md antialiased">
      <CustomerHeader
        userName={profile.fullName}
        userRole={profile.roleBadge}
        avatarUrl={profile.avatarUrl}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex pt-16 flex-1">
        <CustomerSidebar
          userName={`${profile.fullName.split(" ")[0]}'s Account`}
          memberSince={profile.memberSince}
          avatarUrl={profile.avatarUrl}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeOrderCount={profile.stats.activeBookings}
          loyaltyPoints={points}
        />

        <main className="pl-0 lg:pl-72 flex-1 flex flex-col min-h-screen w-full">
          {/* Section 1: Patron Welcome Banner & Stats */}
          <section className="w-full px-space-xl py-space-lg bg-surface-container-low border-b border-outline-variant/30">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-space-lg">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-headline-lg text-headline-lg text-primary font-bold tracking-tight">
                    Loyalty Rewards &amp; Perks
                  </h1>
                  <span className="font-label-sm text-xs px-2.5 py-0.5 rounded-sm bg-amber-600 text-white font-semibold flex items-center gap-1 shadow-2xs">
                    <span className="material-symbols-outlined text-xs">workspace_premium</span>
                    Gold Tier
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Earn points every time you dine in Dhaka or order meals.
                </p>
              </div>

              {/* 4 Summary Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md">
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-xl border border-outline-variant shadow-xs">
                  <span className="font-label-sm text-xs text-on-surface-variant block uppercase tracking-wider">
                    Total Orders
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary font-semibold mt-0.5 block">
                    {profile.stats.totalOrders}
                  </span>
                </div>
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-xl border border-outline-variant shadow-xs">
                  <span className="font-label-sm text-xs text-on-surface-variant block uppercase tracking-wider">
                    Bookings
                  </span>
                  <span className="font-headline-sm text-headline-sm text-secondary font-semibold mt-0.5 block">
                    {profile.stats.activeBookings}
                  </span>
                </div>
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-xl border border-outline-variant shadow-xs">
                  <span className="font-label-sm text-xs text-on-surface-variant block uppercase tracking-wider">
                    Saved Spots
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary font-semibold mt-0.5 block">
                    {profile.stats.savedSpots}
                  </span>
                </div>
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-xl border border-outline-variant shadow-xs">
                  <span className="font-label-sm text-xs text-on-surface-variant block uppercase tracking-wider">
                    Points Balance
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary-container font-semibold mt-0.5 block">
                    {points.toLocaleString()} pts
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Core Loyalty Content */}
          <div className="w-full px-space-xl py-space-xl max-w-6xl mx-auto flex-1 flex flex-col gap-space-xl">
            {/* Tier Status Banner */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xs p-space-lg flex flex-col md:flex-row md:items-center justify-between gap-space-lg">
              <div className="flex flex-col gap-2 max-w-lg">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-2xl">
                    military_tech
                  </span>
                  <h2 className="font-headline-md text-xl font-bold text-primary">
                    Gold Foodie Patron Status
                  </h2>
                </div>
                <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                  You are in the top 10% of Dhaka diners! Enjoy 10% bonus points on all reservations, zero delivery surge fees, and 48-hour priority weekend seating window.
                </p>
                <div className="flex items-center gap-4 text-xs text-primary font-medium mt-1">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-secondary">check_circle</span>
                    10% Bonus Points
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-secondary">check_circle</span>
                    Zero Surge Fees
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-secondary">check_circle</span>
                    Priority Window
                  </span>
                </div>
              </div>

              <div className="bg-surface-container-low p-space-md rounded-xl border border-outline-variant/40 flex flex-col gap-2 w-full md:w-72 shrink-0">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant">Tier Progress</span>
                  <span className="font-bold text-primary">{points} / 2,000 pts</span>
                </div>
                <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-container rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (points / 2000) * 100)}%` }}
                  />
                </div>
                <span className="text-[11px] text-on-surface-variant text-right">
                  {Math.max(0, 2000 - points)} pts to Platinum VIP
                </span>
              </div>
            </div>

            {/* Redeemable Perks Grid */}
            <div className="flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-headline-sm text-lg font-bold text-primary">
                    Redeem Dining Perks &amp; Vouchers
                  </h2>
                  <p className="font-body-sm text-xs text-on-surface-variant">
                    Exchange your points for immediate vouchers and complimentary dining experiences.
                  </p>
                </div>
                <span className="font-label-sm text-xs text-on-surface-variant">
                  Current balance: <strong className="text-primary">{points} pts</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                {AVAILABLE_PERKS.map((perk) => {
                  const isClaimed = claimedPerks.includes(perk.id);
                  const canAfford = points >= perk.pointsCost;

                  return (
                    <div
                      key={perk.id}
                      className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant shadow-xs flex flex-col justify-between gap-space-md hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-container-low text-primary flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-xl">
                            {perk.icon}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-headline-sm text-sm font-bold text-primary truncate">
                              {perk.title}
                            </h3>
                            <span className="font-label-sm text-xs font-bold text-primary-container shrink-0 bg-primary-fixed/20 px-2 py-0.5 rounded-sm">
                              {perk.pointsCost} pts
                            </span>
                          </div>
                          <span className="font-label-sm text-[11px] text-secondary font-medium block mt-0.5">
                            {perk.restaurant}
                          </span>
                          <p className="font-body-sm text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                            {perk.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30">
                        {isClaimed ? (
                          <div className="flex items-center gap-1.5 text-xs text-primary font-semibold">
                            <span className="material-symbols-outlined text-sm">verified</span>
                            <span>Claimed: <code className="bg-surface-container-high px-1.5 py-0.5 rounded text-[11px]">{perk.code}</code></span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-on-surface-variant">
                            Instant digital activation
                          </span>
                        )}

                        <button
                          type="button"
                          disabled={!canAfford && !isClaimed}
                          onClick={() => handleClaimPerk(perk)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs ${
                            isClaimed
                              ? "bg-surface-container-high text-on-surface cursor-default"
                              : canAfford
                              ? "bg-primary-container hover:bg-primary text-on-primary cursor-pointer active:scale-95"
                              : "bg-surface-container text-outline opacity-60 cursor-not-allowed"
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
              {/* Left Column: Points Ledger (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-space-md">
                <h2 className="font-headline-sm text-base font-bold text-primary">
                  Points Activity Ledger
                </h2>

                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xs divide-y divide-outline-variant/30 overflow-hidden">
                  {INITIAL_LEDGER.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 flex items-center justify-between gap-3 text-xs hover:bg-surface-container-low transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-surface-container-low text-primary flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-base">
                            {item.type === "earned" ? "arrow_downward" : "arrow_upward"}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-on-surface block leading-tight">
                            {item.activity}
                          </span>
                          <span className="text-[11px] text-on-surface-variant">
                            {item.date}
                          </span>
                        </div>
                      </div>

                      <span className="font-bold text-primary text-xs shrink-0">
                        +{item.points} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Referral Bonus Card (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-space-md">
                <h2 className="font-headline-sm text-base font-bold text-primary">
                  Invite Fellow Foodies
                </h2>

                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xs p-space-lg flex flex-col justify-between gap-space-md">
                  <div className="flex flex-col gap-2">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-low text-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-xl">
                        card_giftcard
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-sm font-bold text-primary">
                      Give ৳200, Get 500 Pts
                    </h3>
                    <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                      Share your unique referral code with friends in Dhaka. When they make their first booking or meal order, both of you earn dining rewards!
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/30">
                    <label className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                      Your Unique Referral Code
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2 bg-surface-container-low rounded-lg border border-outline-variant text-xs font-mono font-bold text-primary">
                        TAHMID-DINE
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyReferral}
                        className="px-3 py-2 bg-primary-container hover:bg-primary text-on-primary rounded-lg text-xs font-semibold transition-colors shrink-0 shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-xs">
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
