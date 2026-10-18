"use client";

import React from "react";
import { Users, UtensilsCrossed, Store, ShieldCheck, ArrowUpRight } from "lucide-react";
import { UserSummaryStats } from "@/types/adminUser";

interface UserSummaryCardsProps {
  stats: UserSummaryStats;
}

export default function UserSummaryCards({ stats }: UserSummaryCardsProps) {
  const cards = [
    {
      title: "Total Directory",
      value: stats.totalDirectory.toLocaleString(),
      subtext: stats.totalGrowth,
      subtextColor: "text-primary",
      icon: Users,
      badge: "Total",
    },
    {
      title: "Active Diners",
      value: stats.activeDiners.toLocaleString(),
      subtext: stats.dinersShare,
      subtextColor: "text-on-surface-variant",
      icon: UtensilsCrossed,
      badge: "Patrons",
    },
    {
      title: "Venues & Owners",
      value: stats.venuesAndOwners.toLocaleString(),
      subtext: stats.venuesOnboarding,
      subtextColor: "text-secondary",
      icon: Store,
      badge: "Venues",
    },
    {
      title: "Staff & Admins",
      value: stats.staffAndAdmins.toLocaleString(),
      subtext: stats.staffHighPrivileges,
      subtextColor: "text-primary",
      icon: ShieldCheck,
      badge: "Security",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => {
        const IconComponent = c.icon;
        return (
          <div
            key={c.title}
            className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/60 shadow-2xs hover:border-outline-variant transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-label-sm text-xs font-medium text-on-surface-variant">
                {c.title}
              </span>
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                <IconComponent className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-4">
              <div className="font-headline-md text-2xl font-bold text-on-surface tracking-tight">
                {c.value}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`text-xs font-medium ${c.subtextColor}`}>
                  {c.subtext}
                </span>
                <span className="text-[11px] text-on-surface-variant/80">· updated live</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
