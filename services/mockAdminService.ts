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
  PlatformAdminUser,
  AdminGovernanceMetrics,
  FeaturedRestaurantItem,
  PlatformGlobalSettings,
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
    title: "The Maple & Vine",
    metrics: "$1.82M Revenue • 99.8% rating",
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
    contextValue: "$34,820.00",
    operator: "Automated ACH (Batch #88)",
    timestamp: "12 mins ago",
    status: "settled",
    details: "Automated weekly settlement processed via Federal Reserve ACH network.",
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
    details: "Backup rider assigned from Corktown cluster. Customer credited $10 voucher.",
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
    entityName: "The Maple & Vine",
    contextValue: "18 items updated (+4.2% avg)",
    operator: "Marcus Vance (General Manager)",
    timestamp: "Yesterday",
    status: "applied",
    details: "Menu update audited by automated compliance; within fair market thresholds.",
  },
  {
    id: "#EVT-9036",
    type: "payout",
    title: "Vendor Payout Disbursed",
    entityName: "SmashCraft Studio",
    contextValue: "$19,450.00",
    operator: "Automated ACH (Batch #87)",
    timestamp: "Yesterday",
    status: "settled",
    details: "Weekly direct credit settlement to Fifth Third business account.",
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
    description: "$3.42M disbursed across 48 merchant accounts successfully.",
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

  if (timeRange === "ytd") {
    dateRangeLabel = "Year to Date (Jan 1 – Oct 31, 2025)";
    trend = [
      { label: "Jan", date: "2025-01-31", revenue: 8200000, orders: 10400, reservations: 2900, newUsers: 3400 },
      { label: "Feb", date: "2025-02-28", revenue: 9800000, orders: 12200, reservations: 3350, newUsers: 3900 },
      { label: "Mar", date: "2025-03-31", revenue: 11100000, orders: 13800, reservations: 3780, newUsers: 4250 },
      { label: "Apr", date: "2025-04-30", revenue: 12500000, orders: 15600, reservations: 4100, newUsers: 4800 },
      { label: "May", date: "2025-05-31", revenue: 13800000, orders: 17100, reservations: 4450, newUsers: 5100 },
      { label: "Jun", date: "2025-06-30", revenue: 15200000, orders: 18900, reservations: 4850, newUsers: 5450 },
      { label: "Jul", date: "2025-07-31", revenue: 16400000, orders: 20400, reservations: 5200, newUsers: 5700 },
      { label: "Aug", date: "2025-08-31", revenue: 17100000, orders: 21300, reservations: 5390, newUsers: 5900 },
      { label: "Sep", date: "2025-09-30", revenue: 17800000, orders: 22100, reservations: 5700, newUsers: 6200 },
      { label: "Oct", date: "2025-10-31", revenue: 18450200, orders: 23100, reservations: 6400, newUsers: 6590 },
    ];
  } else if (timeRange === "q3") {
    dateRangeLabel = "Q3 Cumulative (Jul 1 – Sep 30, 2025)";
    trend = [
      { label: "Jul", date: "2025-07-31", revenue: 16400000, orders: 20400, reservations: 5200, newUsers: 5700 },
      { label: "Aug", date: "2025-08-31", revenue: 17100000, orders: 21300, reservations: 5390, newUsers: 5900 },
      { label: "Sep", date: "2025-09-30", revenue: 17800000, orders: 22100, reservations: 5700, newUsers: 6200 },
    ];
  } else if (timeRange === "12m") {
    dateRangeLabel = "Trailing 12 Months (Nov 2024 – Oct 2025)";
    trend = [
      { label: "Nov '24", date: "2024-11-30", revenue: 7600000, orders: 9500, reservations: 2500, newUsers: 2900 },
      { label: "Dec '24", date: "2024-12-31", revenue: 8100000, orders: 10100, reservations: 2750, newUsers: 3100 },
      { label: "Jan", date: "2025-01-31", revenue: 8200000, orders: 10400, reservations: 2900, newUsers: 3400 },
      { label: "Feb", date: "2025-02-28", revenue: 9800000, orders: 12200, reservations: 3350, newUsers: 3900 },
      { label: "Mar", date: "2025-03-31", revenue: 11100000, orders: 13800, reservations: 3780, newUsers: 4250 },
      { label: "Apr", date: "2025-04-30", revenue: 12500000, orders: 15600, reservations: 4100, newUsers: 4800 },
      { label: "May", date: "2025-05-31", revenue: 13800000, orders: 17100, reservations: 4450, newUsers: 5100 },
      { label: "Jun", date: "2025-06-30", revenue: 15200000, orders: 18900, reservations: 4850, newUsers: 5450 },
      { label: "Jul", date: "2025-07-31", revenue: 16400000, orders: 20400, reservations: 5200, newUsers: 5700 },
      { label: "Aug", date: "2025-08-31", revenue: 17100000, orders: 21300, reservations: 5390, newUsers: 5900 },
      { label: "Sep", date: "2025-09-30", revenue: 17800000, orders: 22100, reservations: 5700, newUsers: 6200 },
      { label: "Oct", date: "2025-10-31", revenue: 18450200, orders: 23100, reservations: 6400, newUsers: 6590 },
    ];
  } else if (timeRange === "7d") {
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

  const calculatedRevenue = trend.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalRevenue = timeRange === "ytd" ? 148450200 : calculatedRevenue;
  const totalOrders = timeRange === "ytd" ? 184200 : trend.reduce((acc, curr) => acc + curr.orders, 0);
  const totalReservations = timeRange === "ytd" ? 46120 : trend.reduce((acc, curr) => acc + curr.reservations, 0);
  const newPatrons = trend.reduce((acc, curr) => acc + curr.newUsers, 0);
  const avgOrderValue = timeRange === "ytd" ? 805 : (totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0);

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
    {
      id: "v-1",
      name: "The Maple & Vine",
      area: "Corktown, Detroit",
      revenue: 3840000,
      orders: 3420,
      rating: 4.95,
      reviewCount: 640,
      fulfillmentRate: 99.2,
      badge: "Tier 1 Merchant",
      coversLabel: "Dine-in & Courier",
      targetComparison: "+18.2% vs target",
      auditBadge: "Exemplary",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1400&auto=format&fit=crop",
    },
    {
      id: "v-2",
      name: "SmashCraft Studio",
      area: "Dhanmondi 9/A",
      revenue: 2910000,
      orders: 2980,
      rating: 4.70,
      reviewCount: 480,
      fulfillmentRate: 98.7,
      badge: "Express Takeaway",
      coversLabel: "Express Takeaway",
      targetComparison: "+14.6% vs target",
      auditBadge: "Standard",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBFnWjKxjkwbgI3aG-Uip0Ff318GnWmG1Os3sWkW6IJ87ID5un6kmoXK7L20mf25WfX5Uvci6ulJsEv3fjvwcRLwuBPBGXcMCEkst-SDl9QIpHaI_d-KrL1SnMbZOfYXGCst8W_fw1LYMggyHDsoycTAoVxGCfFdn4senVjLUoN5YVh-ocCsBs9ukUMPs1SgYLV0yf3RzX2GGgNkGIGwqsZgBZjBgSHoerDweMP3Ui4ckrske4vo5jIiw",
    },
    {
      id: "v-3",
      name: "Izumi Courtyard",
      area: "Gulshan 2",
      revenue: 2450000,
      orders: 1840,
      rating: 4.95,
      reviewCount: 312,
      fulfillmentRate: 100.0,
      badge: "Omakase Reserve",
      coversLabel: "Omakase & Table Seats",
      targetComparison: "High AOV ($48.00)",
      auditBadge: "Exemplary",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB9lbLtrQOSqX-9Zmz94YpaUD_pDfs0LG8NbovY34RNw38eugh0pDIpU4wDc2qGxcdxg28vMgOvx1Gkfqg4yEX4L4U6qA1RWWy3jI08YimD7gkbIOMtgkp5R-7BqvXQ3llCVrP0yKAL6nHaWgBDbeybOdxL0qhJ-f57fJGfUvDSERt-Thy4ThmrJPJwTWW7nLFwKjJsdrRmjo45GwooSLKaK5YYCZ4ylhuZKy0Mj8NINxmrK-jPR9w4sA",
    },
    {
      id: "v-4",
      name: "Dacca Tehari Ghar",
      area: "Puran Dhaka (Nazira Bazar)",
      revenue: 2120000,
      orders: 4110,
      rating: 4.80,
      reviewCount: 890,
      fulfillmentRate: 97.9,
      badge: "High Volume",
      coversLabel: "High-Volume Delivery",
      targetComparison: "Standard AOV ($18.50)",
      auditBadge: "Standard",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCfN4dIMSu_evO2oGzmWmHyJCPevvNs2ie1GTKbaWocwIwmh1FYqWGLLRWJco1b-oP79keqU6YkQRLEZqWtBDYHQYqS-SPf6YICACB-4x3J9zI0Rdb0GCVw03aC6ItJGQPeMAv6qjDjZOsCFXf_EYcr_P0HxuNKaDsbcon7q3jP7pcuqtem0zAJROXC8LmY3Yz_GwwPdB66Q5_kV8iCJB_5I17X1cvo-9AuNEXOv29G1CX-iH3oNLz61Q",
    },
    {
      id: "v-5",
      name: "Le Sourdough Bistro",
      area: "Banani, Road 11",
      revenue: 1880000,
      orders: 1620,
      rating: 4.91,
      reviewCount: 220,
      fulfillmentRate: 99.5,
      badge: "Artisanal Bakery",
      coversLabel: "Artisanal Bakery & Brunch",
      targetComparison: "+22.1% growth",
      auditBadge: "Exemplary",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBzX3oDqW2Txw-v-07UEW9S9f15KxIgA4r4tecdy--vST6ftMvm7x-3-GW9Ll9i6JCInZyf1QI6c7ssuVKSZfc6pwhO5nrh6-X-8eavhhVQ1mM3JxT9RNZQbKFjSBYY5M9M9geTnRLvzFv-g4Trttt4R1T6TjvZQmiCCVSxOu20_IRbr0EVQefr0E293H9x3bD_BCfkpmAUl22n0IvAYXbAPtr_5cUqVMuYXUZc1P63oAb89HLeEbi17g",
    },
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

// ============================================================================
// SUPER ADMIN: PLATFORM ADMINISTRATORS & RBAC GOVERNANCE
// ============================================================================

export const MOCK_ADMIN_GOVERNANCE_METRICS: AdminGovernanceMetrics = {
  activeAdmins: 12,
  totalSeats: 15,
  elevatedBypassCount: 5,
  twoFactorCompliancePct: 100,
  twoFactorNote: "Strict Hardware Token / App",
  idleTimeoutMinutes: 15,
  idleTimeoutNote: "Automatic cryptokey revocation",
  dualSignoffThresholdBdt: 420000,
  dualSignoffNote: "Super Admin co-signature mandatory",
};

export const MOCK_PLATFORM_ADMINS: PlatformAdminUser[] = [
  {
    id: "adm-1",
    name: "Tahmid Rahman",
    email: "tahmid.super@dinedesk.corp",
    uid: "DD-SA-001",
    role: "Super Admin",
    territory: "Full System Access",
    subScope: "Dhaka, Chittagong, Sylhet Node clusters",
    status: "Active",
    twoFactorStatus: "Enforced (YubiKey)",
    twoFactorType: "hardware",
    lastSession: "Active Now",
    isActiveNow: true,
    avatarUrl:
      "https://lh3.googleusercontent.com/aida/AEtjO1Xvc2MrKyLPPwPKRHPvGiuGzzv3Vl3xudUMnfKmM_OejgtKJObOFHcqNPF4XgM99yJVO2vd5xVNy1ialfL7MMAf-mTYsbOekfDFOQeP3J_05sjjK_dG1-TowYtfmniCeQ5oWP3YUL0mOpQ_Kd_4gnUIQvBpdLJfX7FS7iKDGaNDFcEeOV3fOJ7c2-_IHK7W8BGBNX8pIPLWpzKWXacemtS8HMQtfBJOmvihWXCsfl9OXjXlGaVf6vC98QUC",
    isRootOwner: true,
    canBeRevoked: false,
    dateAdded: "2024-01-15",
    permissions: [
      "system:all",
      "rbac:manage",
      "finance:override",
      "merchants:delist",
      "audit:read_write",
    ],
    phone: "+880 1711-000001",
  },
  {
    id: "adm-2",
    name: "Farhan Chowdhury",
    email: "farhan.ops@dinedesk.corp",
    uid: "DD-OP-014",
    role: "Operations Admin",
    territory: "Banani & Gulshan Zone",
    subScope: "Table inventory, floorplans, onboarding",
    status: "Active",
    twoFactorStatus: "Enforced",
    twoFactorType: "app",
    lastSession: "14 mins ago",
    isActiveNow: false,
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAhtJQi0WcGI2IHmu2wAXnGFQOcDbkvSxGWX-12AsrNdh2A6CK58oB4biEC_xxTyuDw0CPfMMcAqP-Oi_2DFf8F6tXvRXpWGhop7qZgmqIxR3Rit29kq-o8nP9iiEGhDPlcxOv--y6DxSGlkg5cu2z7LRr1IbvMtpYPDLDhZ98hP2fOM1bs3FTmcaHGQCcxuVDS6tw759k9ZMU3Y-RsQCev-p4aksop5IUe4f8hV3bqX_b4N6pG-cKepA",
    isRootOwner: false,
    canBeRevoked: true,
    dateAdded: "2024-03-10",
    permissions: [
      "merchants:onboard",
      "tables:manage",
      "dispatch:supervise",
      "support:escalate",
    ],
    phone: "+880 1819-234567",
  },
  {
    id: "adm-3",
    name: "Nazia Tabassum",
    email: "nazia.finance@dinedesk.corp",
    uid: "DD-FN-008",
    role: "Finance & Treasury Admin",
    territory: "Settlements, Refunds, Stripe",
    subScope: "bKash/Nagad Payout Batches (Dual Auth)",
    status: "Active",
    twoFactorStatus: "Enforced",
    twoFactorType: "hardware",
    lastSession: "1 hour ago",
    isActiveNow: false,
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBxfCr47Lf0sC_IhYd_PUkK4eeTZm_zOsWDv3BsQ2wauT4y2FVdW8cA0sbzppINbIEyw1JmEtsZBXJpt9NeioL1VNvyV543kI1_-TfAnBNvTcREwFR-Ny4-A946tfQ9I13lNlMfpz4GlpzSzmhNVxOhO16dTDpDIVBlkXVw258PrlL-t__TTt9VnxYvGdxJF8UnDtjg9DP62rjvZJFWBU3uII0kz8VsfTpKfEdzKPL31UOcUBpBKdmA9w",
    isRootOwner: false,
    canBeRevoked: true,
    dateAdded: "2024-04-01",
    permissions: [
      "payouts:initiate",
      "refunds:approve",
      "disputes:arbitrate",
      "ledger:read",
    ],
    phone: "+880 1912-345678",
  },
  {
    id: "adm-4",
    name: "Kazi Rezwan",
    email: "rezwan.audit@dinedesk.corp",
    uid: "DD-CA-003",
    role: "Compliance & Audit Admin",
    territory: "Restaurant Verifications & Hygiene",
    subScope: "Trade license validity, Halal certifications",
    status: "Active",
    twoFactorStatus: "2FA Active",
    twoFactorType: "app",
    lastSession: "Yesterday, 19:42",
    isActiveNow: false,
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDRkKE_evbfZvrJhHiaOwv_6W7GCX89tS79au9r_lb7nUx9arKhHH4JeOalxWX0BHHkCaAPCYrD5O9rjgZsxL97fgMKlUqT7q37UrDSL-6mCZJfQK25cMLy4rL6m_4DjV7lypZmBxwGOe7jBEKPGOPi4hCJalDjDsG7Sqe00o8uLqKt5AGbqZzrZBtySoct5irs3BmPH-VqUa_wC_sOr6TP1LTQqIYSORsdyy-dk65IWuMoAY9K813CTg",
    isRootOwner: false,
    canBeRevoked: true,
    dateAdded: "2024-02-18",
    permissions: [
      "compliance:verify",
      "licenses:audit",
      "audit:read",
      "safety:flag",
    ],
    phone: "+880 1713-987654",
  },
  {
    id: "adm-5",
    name: "Mahir Faisal",
    email: "mahir.support@dinedesk.corp",
    uid: "DD-CS-022",
    role: "Customer Support Lead",
    territory: "Inquiries & Order Cancellations",
    subScope: "Direct patron booking dispute triage",
    status: "Active",
    twoFactorStatus: "2FA Active",
    twoFactorType: "app",
    lastSession: "3 hours ago",
    isActiveNow: false,
    avatarUrl: "",
    isRootOwner: false,
    canBeRevoked: true,
    dateAdded: "2024-05-12",
    permissions: [
      "support:manage",
      "bookings:modify",
      "orders:triage",
      "users:contact",
    ],
    phone: "+880 1611-456789",
  },
  {
    id: "adm-6",
    name: "Samin Kazi",
    email: "samin.kazi@dinedesk.corp",
    uid: "DD-SA-002",
    role: "Super Admin",
    territory: "Platform Governance & Infra",
    subScope: "Cloud Cluster EU-1 & Microservices",
    status: "Active",
    twoFactorStatus: "Enforced (YubiKey)",
    twoFactorType: "hardware",
    lastSession: "2 hours ago",
    isActiveNow: false,
    avatarUrl: "",
    isRootOwner: false,
    canBeRevoked: true,
    dateAdded: "2024-01-20",
    permissions: [
      "system:all",
      "infra:manage",
      "security:keys",
      "rbac:manage",
    ],
    phone: "+880 1715-112233",
  },
  {
    id: "adm-7",
    name: "Ananya Sen",
    email: "ananya.ops@dinedesk.corp",
    uid: "DD-OP-019",
    role: "Operations Admin",
    territory: "Dhanmondi & Lalmatia Zone",
    subScope: "Merchant kitchen load & rider dispatch",
    status: "Active",
    twoFactorStatus: "Enforced",
    twoFactorType: "app",
    lastSession: "5 hours ago",
    isActiveNow: false,
    avatarUrl: "",
    isRootOwner: false,
    canBeRevoked: true,
    dateAdded: "2024-06-08",
    permissions: ["merchants:onboard", "tables:manage", "dispatch:supervise"],
    phone: "+880 1817-665544",
  },
  {
    id: "adm-8",
    name: "Zeeshan Mirza",
    email: "zeeshan.finance@dinedesk.corp",
    uid: "DD-FN-012",
    role: "Finance & Treasury Admin",
    territory: "Merchant Tax & Withholding",
    subScope: "Monthly NBR reconciliation & invoicing",
    status: "Active",
    twoFactorStatus: "Enforced",
    twoFactorType: "hardware",
    lastSession: "Yesterday, 16:10",
    isActiveNow: false,
    avatarUrl: "",
    isRootOwner: false,
    canBeRevoked: true,
    dateAdded: "2024-06-15",
    permissions: ["payouts:initiate", "ledger:read", "tax:reconcile"],
    phone: "+880 1914-889900",
  },
  {
    id: "adm-9",
    name: "Tanvir Ahmed",
    email: "tanvir.audit@dinedesk.corp",
    uid: "DD-CA-005",
    role: "Compliance & Audit Admin",
    territory: "Chittagong Hub Verification",
    subScope: "Port city restaurant audits & sanitation",
    status: "Active",
    twoFactorStatus: "2FA Active",
    twoFactorType: "app",
    lastSession: "Oct 29, 14:20",
    isActiveNow: false,
    avatarUrl: "",
    isRootOwner: false,
    canBeRevoked: true,
    dateAdded: "2024-07-01",
    permissions: ["compliance:verify", "licenses:audit", "audit:read"],
    phone: "+880 1718-443322",
  },
  {
    id: "adm-10",
    name: "Nusrat Jahan",
    email: "nusrat.support@dinedesk.corp",
    uid: "DD-CS-025",
    role: "Customer Support Lead",
    territory: "VIP & Corporate Concierge",
    subScope: "High-ticket dining reservations & complaints",
    status: "Active",
    twoFactorStatus: "2FA Active",
    twoFactorType: "app",
    lastSession: "Oct 30, 11:45",
    isActiveNow: false,
    avatarUrl: "",
    isRootOwner: false,
    canBeRevoked: true,
    dateAdded: "2024-07-20",
    permissions: ["support:manage", "bookings:modify", "users:contact"],
    phone: "+880 1612-998877",
  },
  {
    id: "adm-11",
    name: "Sabrina Haque",
    email: "sabrina.ops@dinedesk.corp",
    uid: "DD-OP-021",
    role: "Operations Admin",
    territory: "Uttara & Airport Sector",
    subScope: "Express delivery hub and takeout staging",
    status: "Active",
    twoFactorStatus: "Enforced",
    twoFactorType: "app",
    lastSession: "Oct 31, 09:15",
    isActiveNow: false,
    avatarUrl: "",
    isRootOwner: false,
    canBeRevoked: true,
    dateAdded: "2024-08-10",
    permissions: ["merchants:onboard", "tables:manage", "dispatch:supervise"],
    phone: "+880 1813-774411",
  },
  {
    id: "adm-12",
    name: "Asif Iqbal",
    email: "asif.admin@dinedesk.corp",
    uid: "DD-SA-004",
    role: "Super Admin",
    territory: "Security Incident Response",
    subScope: "Threat detection, IP whitelist & WAF rules",
    status: "Active",
    twoFactorStatus: "Enforced (YubiKey)",
    twoFactorType: "hardware",
    lastSession: "Oct 31, 13:05",
    isActiveNow: false,
    avatarUrl: "",
    isRootOwner: false,
    canBeRevoked: true,
    dateAdded: "2024-04-15",
    permissions: ["system:all", "security:keys", "audit:read_write"],
    phone: "+880 1719-556677",
  },
  {
    id: "adm-13",
    name: "Samiul Alom",
    email: "samiul.ops@dinedesk.corp",
    uid: "DD-OP-029",
    role: "Operations Admin",
    territory: "Mirpur & Pallabi Zone",
    subScope: "Table allocation & courier staging",
    status: "Pending",
    twoFactorStatus: "Pending Setup",
    twoFactorType: "none",
    lastSession: "Never logged in",
    isActiveNow: false,
    avatarUrl: "",
    isRootOwner: false,
    canBeRevoked: true,
    dateAdded: "2024-10-25",
    permissions: ["merchants:onboard", "tables:manage"],
    phone: "+880 1811-223344",
  },
  {
    id: "adm-14",
    name: "Rashedul Islam",
    email: "rashed.audit@dinedesk.corp",
    uid: "DD-CA-009",
    role: "Compliance & Audit Admin",
    territory: "Old Dhaka Historical Outlets",
    subScope: "Legacy vendor registration inspection",
    status: "Suspended",
    twoFactorStatus: "2FA Active",
    twoFactorType: "app",
    lastSession: "Sep 12, 11:20",
    isActiveNow: false,
    avatarUrl: "",
    isRootOwner: false,
    canBeRevoked: true,
    dateAdded: "2024-03-22",
    permissions: ["compliance:verify"],
    phone: "+880 1916-332211",
  },
];

export function getPlatformAdmins(): PlatformAdminUser[] {
  return MOCK_PLATFORM_ADMINS;
}

export function getAdminGovernanceMetrics(): AdminGovernanceMetrics {
  return MOCK_ADMIN_GOVERNANCE_METRICS;
}

// ============================================================================
// SUPER ADMIN: PLATFORM GLOBAL SETTINGS & FEATURED CURATION
// ============================================================================

export const DEFAULT_PLATFORM_SETTINGS: PlatformGlobalSettings = {
  commissionRate: 12.5,
  reservationDepositFee: 250,
  enforcePartyRule: true,
  payoutSchedule: "Automated Daily Settlement (T+1 at midnight BDT)",
  featuredRestaurants: [
    { id: "feat-1", name: "The Maple & Vine", area: "Corktown, Detroit" },
    { id: "feat-2", name: "The Copper Chimney", area: "Downtown Detroit" },
    { id: "feat-3", name: "SmashCraft Burgers", area: "Midtown Detroit" },
    { id: "feat-4", name: "Mori Artisan Sushi", area: "Downtown Detroit" },
    { id: "feat-5", name: "Eastern Market Deli", area: "Eastern Market, Detroit" },
    { id: "feat-6", name: "Cafe De Flore & Bakery", area: "Riverfront, Detroit" },
  ],
  rotationInterval: "Weekly Dynamic Rotation",
  includeHeroVideo: true,
  maintenanceMode: false,
  maintenanceMessage:
    "DineDesk is currently undergoing scheduled platform upgrades. We will be back online shortly!",
  lastModifiedBy: "Tahmid Rahman (Super Admin)",
  lastModifiedAt: "Oct 22, 2025 at 16:45 BDT",
};

export const ELIGIBLE_RESTAURANTS_POOL: FeaturedRestaurantItem[] = [
  { id: "pool-1", name: "Izumi Courtyard", area: "Gulshan 2", cuisine: "Japanese Omakase", rating: 4.95 },
  { id: "pool-2", name: "Le Sourdough Bistro", area: "Banani 11", cuisine: "Artisanal Bakery & Brunch", rating: 4.91 },
  { id: "pool-3", name: "Kagura Japanese Grill", area: "Gulshan 2", cuisine: "Yakitori & Sake", rating: 4.88 },
  { id: "pool-4", name: "Star Kabab & Restaurant", area: "Dhanmondi 2", cuisine: "Charcoal Kebabs", rating: 4.79 },
  { id: "pool-5", name: "Spice Route Thai", area: "Banani 12", cuisine: "Royal Thai", rating: 4.84 },
  { id: "pool-6", name: "Nando's Peri-Peri", area: "Gulshan 1", cuisine: "Flame-Grilled Chicken", rating: 4.65 },
  { id: "pool-7", name: "Madchef Artisanal", area: "Dhanmondi 9/A", cuisine: "Gourmet Burgers", rating: 4.72 },
  { id: "pool-8", name: "Gloria Jean's Coffees", area: "Gulshan 1", cuisine: "Specialty Coffee", rating: 4.60 },
];

export function getPlatformGlobalSettings(): PlatformGlobalSettings {
  return DEFAULT_PLATFORM_SETTINGS;
}

export function getEligibleFeaturedRestaurants(): FeaturedRestaurantItem[] {
  return ELIGIBLE_RESTAURANTS_POOL;
}


