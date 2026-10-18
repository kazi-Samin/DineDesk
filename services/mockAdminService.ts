import {
  AdminOverviewKpis,
  OperationalHealth,
  MonthlyVolumeItem,
  AdminAuditEvent,
  AdminAlert,
  EditorialFeatureItem,
  AdminAnalyticsData,
  AdminTimeRange,
  AnalyticsTrendPoint,
  OrderStatusBreakdown,
  CuisinePerformance,
  VendorPerformance,
} from "@/types/admin";

export const MOCK_ADMIN_KPIS: AdminOverviewKpis = {
  totalUsers: 48290,
  userGrowthPct: 14.2,
  userGrowthNote: "vs last month",
  userProgressPct: 78,

  activeRestaurants: 142,
  onboardingRestaurants: 8,
  onboardingNote: "onboarding this week",
  restaurantProgressPct: 64,

  completedOrders: 18450,
  fulfillmentRatePct: 98.4,
  fulfillmentNote: "fulfillment rate",
  orderProgressPct: 98,

  grossGmv: 14280450,
  gmvGrowthPct: 19.8,
  gmvGrowthNote: "year-over-year",
  gmvProgressPct: 85,
};

export const MOCK_OPERATIONAL_HEALTH: OperationalHealth = {
  activeCouriers: 84,
  courierCapacityPct: 100,
  disputeRatePct: 0.4,
  disputeBenchmarkPct: 1.2,
  seatedReservations: 4120,
  seatedGrowthPct: 18,
  avgKitchenPrepMinutes: 22.4,
  prepTimeDeltaMinutes: -2.1,
};

export const MOCK_MONTHLY_VOLUME: MonthlyVolumeItem[] = [
  { month: "JAN", fullMonth: "January 2025", revenue: 720000, orders: 1420, isPeak: false, isCurrent: false },
  { month: "FEB", fullMonth: "February 2025", revenue: 810000, orders: 1650, isPeak: false, isCurrent: false },
  { month: "MAR", fullMonth: "March 2025", revenue: 950000, orders: 1890, isPeak: false, isCurrent: false },
  { month: "APR", fullMonth: "April 2025", revenue: 1100000, orders: 2210, isPeak: false, isCurrent: false },
  { month: "MAY", fullMonth: "May 2025", revenue: 1050000, orders: 2140, isPeak: false, isCurrent: false },
  { month: "JUN", fullMonth: "June 2025", revenue: 1220000, orders: 2450, isPeak: false, isCurrent: false },
  { month: "JUL", fullMonth: "July 2025", revenue: 1180000, orders: 2380, isPeak: false, isCurrent: false },
  { month: "AUG", fullMonth: "August 2025", revenue: 1280000, orders: 2620, isPeak: false, isCurrent: false },
  { month: "SEP", fullMonth: "September 2025", revenue: 1340000, orders: 2890, isPeak: false, isCurrent: false },
  { month: "OCT", fullMonth: "October 2025", revenue: 1420000, orders: 3210, isPeak: true, isCurrent: true },
];

export const MOCK_EDITORIAL_FEATURES: EditorialFeatureItem[] = [
  {
    id: "top-vendor",
    tag: "Top Vendor of the Month",
    title: "Gulshan Bistro Heritage",
    metrics: "৳1.82M Revenue • 99.8% rating",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "fastest-kitchen",
    tag: "Fastest Kitchen Output",
    title: "The Brass Spoon Banani",
    metrics: "14.2 min avg prep • 890 orders",
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "highest-occupancy",
    tag: "Highest Table Occupancy",
    title: "Dhanmondi Club Dining",
    metrics: "94% seat utilization rate",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop",
  },
];

export const MOCK_AUDIT_EVENTS: AdminAuditEvent[] = [
  {
    id: "#EVT-9042",
    type: "payout",
    title: "Vendor Payout Disbursed",
    entityName: "The Colonial Tea Room",
    contextValue: "৳348,200.00",
    operator: "Automated ACH (Batch #88)",
    timestamp: "12 mins ago",
    status: "settled",
    details: "Automated weekly settlement processed via Bangladesh Bank EFT network.",
  },
  {
    id: "#EVT-9041",
    type: "verification",
    title: "License Verification",
    entityName: "Artisan Kitchen Gulshan",
    contextValue: "Trade License Renewal",
    operator: "Tahmid Rahman (Super Admin)",
    timestamp: "45 mins ago",
    status: "verified",
    details: "BSTI certificate & trade license verified against municipal registry.",
  },
  {
    id: "#EVT-9040",
    type: "escalation",
    title: "Delivery Escalation",
    entityName: "Olive & Thyme Bistro",
    contextValue: "Courier Late Delta (>30m)",
    operator: "Fleet Dispatch System",
    timestamp: "2 hours ago",
    status: "rerouted",
    details: "Backup rider assigned from Banani Block D cluster. Customer credited ৳100 voucher.",
  },
  {
    id: "#EVT-9039",
    type: "commission",
    title: "Commission Tier Upgrade",
    entityName: "Saffron Court Dhanmondi",
    contextValue: "Standard → Preferred (6.5%)",
    operator: "Platform Automated Rule",
    timestamp: "5 hours ago",
    status: "applied",
    details: "Restaurant exceeded 500 monthly dining bookings with 4.85+ star patron rating.",
  },
  {
    id: "#EVT-9038",
    type: "account",
    title: "New Merchant Application",
    entityName: "Puran Dhaka Biryani Ghar",
    contextValue: "Nazimuddin Road • Kacchi & Kebab",
    operator: "Registration Intake",
    timestamp: "7 hours ago",
    status: "pending",
    details: "Awaiting physical kitchen inspection and sanitation protocol signoff.",
  },
  {
    id: "#EVT-9037",
    type: "menu",
    title: "Bulk Menu Price Recalibration",
    entityName: "Sultan's Heritage Kitchen",
    contextValue: "18 items updated (+4.2% avg)",
    operator: "Kabir Hossain (Vendor Admin)",
    timestamp: "Yesterday",
    status: "applied",
    details: "Menu update audited by automated compliance; within fair market thresholds.",
  },
  {
    id: "#EVT-9036",
    type: "payout",
    title: "Vendor Payout Disbursed",
    entityName: "SmashCraft Studio",
    contextValue: "৳194,500.00",
    operator: "Automated ACH (Batch #87)",
    timestamp: "Yesterday",
    status: "settled",
    details: "Weekly direct credit settlement to City Bank business account.",
  },
];

export const MOCK_ADMIN_ALERTS: AdminAlert[] = [
  {
    id: "alt-1",
    title: "Pending Restaurant Verification",
    description: "Puran Dhaka Biryani Ghar uploaded trade license documents for approval.",
    severity: "warning",
    timestamp: "15 mins ago",
    unread: true,
    link: "/dashboard/admin/restaurants",
  },
  {
    id: "alt-2",
    title: "Fleet Spike Alert",
    description: "Gulshan Zone 2 courier utilization reached 94% during dinner rush.",
    severity: "info",
    timestamp: "1 hour ago",
    unread: true,
  },
  {
    id: "alt-3",
    title: "Automated Payout Batch Dispatched",
    description: "৳3.42M disbursed across 48 merchant accounts successfully.",
    severity: "success",
    timestamp: "4 hours ago",
    unread: false,
    link: "/dashboard/admin/transactions",
  },
];

export function getAdminOverviewStats(): AdminOverviewKpis {
  return MOCK_ADMIN_KPIS;
}

export function getOperationalHealthMetrics(): OperationalHealth {
  return MOCK_OPERATIONAL_HEALTH;
}

export function getMonthlyVolumeData(): MonthlyVolumeItem[] {
  return MOCK_MONTHLY_VOLUME;
}

export function getEditorialFeatures(): EditorialFeatureItem[] {
  return MOCK_EDITORIAL_FEATURES;
}

export function getAdminAuditEvents(): AdminAuditEvent[] {
  return MOCK_AUDIT_EVENTS;
}

export function getAdminAlerts(): AdminAlert[] {
  return MOCK_ADMIN_ALERTS;
}

// Analytics Generator by Time Range
export function getAdminAnalytics(
  timeRange: AdminTimeRange = "30d",
  customDates?: { start: string; end: string }
): AdminAnalyticsData {
  let dateRangeLabel = "Last 30 Days (Oct 1 – Oct 31, 2025)";
  let trend: AnalyticsTrendPoint[] = [];

  if (timeRange === "7d") {
    dateRangeLabel = "Last 7 Days (Oct 25 – Oct 31, 2025)";
    trend = [
      { label: "Fri, Oct 25", date: "2025-10-25", revenue: 420000, orders: 480, reservations: 110, newUsers: 140 },
      { label: "Sat, Oct 26", date: "2025-10-26", revenue: 580000, orders: 690, reservations: 195, newUsers: 220 },
      { label: "Sun, Oct 27", date: "2025-10-27", revenue: 510000, orders: 610, reservations: 170, newUsers: 190 },
      { label: "Mon, Oct 28", date: "2025-10-28", revenue: 360000, orders: 420, reservations: 85, newUsers: 120 },
      { label: "Tue, Oct 29", date: "2025-10-29", revenue: 390000, orders: 450, reservations: 95, newUsers: 135 },
      { label: "Wed, Oct 30", date: "2025-10-30", revenue: 440000, orders: 510, reservations: 120, newUsers: 160 },
      { label: "Thu, Oct 31", date: "2025-10-31", revenue: 530000, orders: 630, reservations: 165, newUsers: 205 },
    ];
  } else if (timeRange === "90d") {
    dateRangeLabel = "Last 90 Days (Aug 1 – Oct 31, 2025)";
    trend = [
      { label: "Aug W1", date: "2025-08-07", revenue: 2900000, orders: 3400, reservations: 890, newUsers: 1100 },
      { label: "Aug W2", date: "2025-08-14", revenue: 3100000, orders: 3650, reservations: 940, newUsers: 1180 },
      { label: "Aug W3", date: "2025-08-21", revenue: 3050000, orders: 3580, reservations: 910, newUsers: 1140 },
      { label: "Aug W4", date: "2025-08-28", revenue: 3250000, orders: 3800, reservations: 980, newUsers: 1250 },
      { label: "Sep W1", date: "2025-09-07", revenue: 3300000, orders: 3900, reservations: 1020, newUsers: 1280 },
      { label: "Sep W2", date: "2025-09-14", revenue: 3450000, orders: 4050, reservations: 1060, newUsers: 1340 },
      { label: "Sep W3", date: "2025-09-21", revenue: 3400000, orders: 3980, reservations: 1040, newUsers: 1310 },
      { label: "Sep W4", date: "2025-09-28", revenue: 3600000, orders: 4200, reservations: 1110, newUsers: 1420 },
      { label: "Oct W1", date: "2025-10-07", revenue: 3700000, orders: 4350, reservations: 1160, newUsers: 1480 },
      { label: "Oct W2", date: "2025-10-14", revenue: 3850000, orders: 4500, reservations: 1210, newUsers: 1540 },
      { label: "Oct W3", date: "2025-10-21", revenue: 3950000, orders: 4620, reservations: 1250, newUsers: 1590 },
      { label: "Oct W4", date: "2025-10-31", revenue: 4150000, orders: 4850, reservations: 1320, newUsers: 1680 },
    ];
  } else if (timeRange === "custom" && customDates) {
    dateRangeLabel = `Custom Range (${customDates.start} to ${customDates.end})`;
    trend = [
      { label: "Interval 1", date: customDates.start, revenue: 1450000, orders: 1720, reservations: 420, newUsers: 560 },
      { label: "Interval 2", date: "Midpoint", revenue: 1680000, orders: 1980, reservations: 490, newUsers: 640 },
      { label: "Interval 3", date: customDates.end, revenue: 1890000, orders: 2240, reservations: 570, newUsers: 720 },
    ];
  } else {
    // Default 30 Days
    dateRangeLabel = "Last 30 Days (Oct 1 – Oct 31, 2025)";
    trend = [
      { label: "Oct 1-5", date: "2025-10-05", revenue: 2150000, orders: 2540, reservations: 640, newUsers: 820 },
      { label: "Oct 6-10", date: "2025-10-10", revenue: 2380000, orders: 2810, reservations: 710, newUsers: 910 },
      { label: "Oct 11-15", date: "2025-10-15", revenue: 2290000, orders: 2700, reservations: 680, newUsers: 870 },
      { label: "Oct 16-20", date: "2025-10-20", revenue: 2520000, orders: 2980, reservations: 760, newUsers: 980 },
      { label: "Oct 21-25", date: "2025-10-25", revenue: 2610000, orders: 3080, reservations: 790, newUsers: 1040 },
      { label: "Oct 26-31", date: "2025-10-31", revenue: 2890000, orders: 3410, reservations: 880, newUsers: 1160 },
    ];
  }

  const totalRevenue = trend.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalOrders = trend.reduce((acc, curr) => acc + curr.orders, 0);
  const totalReservations = trend.reduce((acc, curr) => acc + curr.reservations, 0);
  const newPatrons = trend.reduce((acc, curr) => acc + curr.newUsers, 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const orderStatusDistribution: OrderStatusBreakdown[] = [
    { status: "delivered", label: "Completed & Delivered", count: 17230, percentage: 93.4, badgeColor: "bg-primary-container text-on-primary" },
    { status: "preparing", label: "Active Kitchen Prep", count: 680, percentage: 3.7, badgeColor: "bg-surface-container-high text-on-surface" },
    { status: "out_for_delivery", label: "In Courier Transit", count: 410, percentage: 2.2, badgeColor: "bg-secondary-fixed text-on-secondary-fixed" },
    { status: "disputed_cancelled", label: "Disputed / Cancelled", count: 130, percentage: 0.7, badgeColor: "bg-error-container text-error" },
  ];

  const topCuisines: CuisinePerformance[] = [
    { name: "Traditional Bengali & Kacchi", orderSharePct: 38.5, revenue: 5490000, growthPct: 22.4, topDish: "Mutton Kacchi Biryani" },
    { name: "Pan-Asian & Dim Sum", orderSharePct: 24.2, revenue: 3450000, growthPct: 18.1, topDish: "Crispy Prawn Dumplings" },
    { name: "Artisanal Smash Burgers", orderSharePct: 16.8, revenue: 2390000, growthPct: 15.6, topDish: "Truffle Mushroom Double" },
    { name: "Mughal & Charcoal Kebabs", orderSharePct: 12.3, revenue: 1750000, growthPct: 11.2, topDish: "Reshmi Handi Kebab" },
    { name: "Wood-Fired Neapolitan Pizza", orderSharePct: 8.2, revenue: 1170000, growthPct: 9.8, topDish: "Burrata Margherita" },
  ];

  const topVendors: VendorPerformance[] = [
    { id: "v-1", name: "Sultan's Heritage Kitchen", area: "Banani 11", revenue: 2480000, orders: 2840, rating: 4.9, fulfillmentRate: 99.4, badge: "Master Merchant" },
    { id: "v-2", name: "Gulshan Bistro Heritage", area: "Gulshan 2", revenue: 1820000, orders: 2190, rating: 4.85, fulfillmentRate: 98.9, badge: "VIP Dining" },
    { id: "v-3", name: "The Brass Spoon", area: "Banani Road 8", revenue: 1560000, orders: 1870, rating: 4.8, fulfillmentRate: 99.1, badge: "Fastest Prep" },
    { id: "v-4", name: "SmashCraft Burger Studio", area: "Dhanmondi 27", revenue: 1340000, orders: 1720, rating: 4.75, fulfillmentRate: 98.4, badge: "Top Rated Foodie" },
    { id: "v-5", name: "Artisan Kitchen Lounge", area: "Uttara Sector 3", revenue: 1120000, orders: 1460, rating: 4.7, fulfillmentRate: 97.8, badge: "Rising Star" },
  ];

  return {
    timeRange,
    dateRangeLabel,
    summary: {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      totalReservations,
      newPatrons,
      revenueGrowthPct: 19.8,
      ordersGrowthPct: 14.6,
    },
    trend,
    orderStatusDistribution,
    topCuisines,
    topVendors,
  };
}

// Client-side CSV Exporter Utility
export function downloadAdminCsv(filename: string, rows: string[][]) {
  const csvContent =
    "data:text/csv;charset=utf-8," +
    rows.map((e) => e.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
