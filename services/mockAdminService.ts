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
  totalUsers: 4820,
  userGrowthPct: 14.2,
  userGrowthNote: "active patrons vs last month",
  userProgressPct: 78,

  activeRestaurants: 1,
  onboardingRestaurants: 4,
  onboardingNote: "floor zones operational",
  restaurantProgressPct: 100,

  completedOrders: 1845,
  fulfillmentRatePct: 99.4,
  fulfillmentNote: "service fulfillment rate",
  orderProgressPct: 99,

  grossGmv: 428045,
  gmvGrowthPct: 19.8,
  gmvGrowthNote: "year-over-year",
  gmvProgressPct: 88,
};

export const MOCK_OPERATIONAL_HEALTH: OperationalHealth = {
  activeCouriers: 6,
  courierCapacityPct: 100,
  disputeRatePct: 0.2,
  disputeBenchmarkPct: 1.0,
  seatedReservations: 1680,
  seatedGrowthPct: 18,
  avgKitchenPrepMinutes: 16.4,
  prepTimeDeltaMinutes: -2.1,
};

export const MOCK_MONTHLY_VOLUME: MonthlyVolumeItem[] = [
  { month: "JAN", fullMonth: "January 2025", revenue: 72000, orders: 1120, isPeak: false, isCurrent: false },
  { month: "FEB", fullMonth: "February 2025", revenue: 81000, orders: 1250, isPeak: false, isCurrent: false },
  { month: "MAR", fullMonth: "March 2025", revenue: 95000, orders: 1390, isPeak: false, isCurrent: false },
  { month: "APR", fullMonth: "April 2025", revenue: 110000, orders: 1510, isPeak: false, isCurrent: false },
  { month: "MAY", fullMonth: "May 2025", revenue: 105000, orders: 1440, isPeak: false, isCurrent: false },
  { month: "JUN", fullMonth: "June 2025", revenue: 122000, orders: 1650, isPeak: false, isCurrent: false },
  { month: "JUL", fullMonth: "July 2025", revenue: 118000, orders: 1580, isPeak: false, isCurrent: false },
  { month: "AUG", fullMonth: "August 2025", revenue: 128000, orders: 1720, isPeak: false, isCurrent: false },
  { month: "SEP", fullMonth: "September 2025", revenue: 134000, orders: 1790, isPeak: false, isCurrent: false },
  { month: "OCT", fullMonth: "October 2025", revenue: 142800, orders: 1845, isPeak: true, isCurrent: true },
];

export const MOCK_EDITORIAL_FEATURES: EditorialFeatureItem[] = [
  {
    id: "top-vendor",
    tag: "Flagship Dining Room",
    title: "Main Hearth Dining Room",
    metrics: "$184k Monthly • 99.8% Guest Rating",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "fastest-kitchen",
    tag: "Kitchen Throughput Benchmark",
    title: "Wood-Fired Hearth & Grill",
    metrics: "16.4 min avg ticket • 890 covers",
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "highest-occupancy",
    tag: "Highest Seat Utilization",
    title: "Wine Cellar Private Reserve",
    metrics: "94% Seat Utilization • Sommelier Curated",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop",
  },
];

export const MOCK_AUDIT_EVENTS: AdminAuditEvent[] = [
  {
    id: "#EVT-9042",
    type: "payout",
    title: "Daily Operating Settlement",
    entityName: "Fifth Third Operating Account",
    contextValue: "$34,820.00",
    operator: "Automated ACH (Batch #88)",
    timestamp: "12 mins ago",
    status: "settled",
    details: "Automated daily merchant payout settled to Fifth Third Operating Account.",
  },
  {
    id: "#EVT-9041",
    type: "verification",
    title: "Wayne County Health Recertification",
    entityName: "The Maple & Vine",
    contextValue: "Grade A (98/100)",
    operator: "Kazi Rezwan (Compliance Admin)",
    timestamp: "45 mins ago",
    status: "verified",
    details: "Wayne County Health Department annual food safety audit verified with zero infractions.",
  },
  {
    id: "#EVT-9040",
    type: "escalation",
    title: "Floor Capacity Threshold Warning",
    entityName: "Main Hearth Dining Room",
    contextValue: "Occupancy > 92%",
    operator: "Sarah Jenkins (Dining Room Lead)",
    timestamp: "2 hours ago",
    status: "rerouted",
    details: "Walk-ins placed on a 25-minute waitlist; patio lounge bar opened for overflow guests.",
  },
  {
    id: "#EVT-9039",
    type: "commission",
    title: "Cellar Stock Reconciliation",
    entityName: "Wine Cellar Reserve",
    contextValue: "99.2% stock accuracy",
    operator: "Thomas Hayes (Sommelier)",
    timestamp: "5 hours ago",
    status: "applied",
    details: "Shift-end cellar audit matched against POS beverage rings with zero variance.",
  },
  {
    id: "#EVT-9038",
    type: "account",
    title: "Executive Floor Shift Signoff",
    entityName: "The Maple & Vine",
    contextValue: "Dinner Service Briefing",
    operator: "Marcus Vance (General Manager)",
    timestamp: "7 hours ago",
    status: "verified",
    details: "Marcus Vance logged full floor briefing; 160 dinner covers prepped across 4 stations.",
  },
  {
    id: "#EVT-9037",
    type: "menu",
    title: "Seasonal Tasting Price Recalibration",
    entityName: "The Maple & Vine",
    contextValue: "6-Course Tasting ($135/guest)",
    operator: "Marcus Vance (General Manager)",
    timestamp: "Yesterday",
    status: "applied",
    details: "Autumn harvest dry-aged ribeye and wild mushroom course pricing updated.",
  },
  {
    id: "#EVT-9036",
    type: "payout",
    title: "Purveyor Payout: Eastern Market Provisions",
    entityName: "Eastern Market Butcher Supply",
    contextValue: "$12,450.00",
    operator: "David Miller (Finance)",
    timestamp: "Yesterday",
    status: "settled",
    details: "Weekly direct credit settlement to Fifth Third business account.",
  },
];

export const MOCK_ADMIN_ALERTS: AdminAlert[] = [
  {
    id: "alt-1",
    title: "Wayne County Health Recertification",
    description: "Annual food safety compliance certificate logged and approved (Grade A - 98/100).",
    severity: "success",
    timestamp: "15 mins ago",
    unread: true,
    link: "/dashboard/admin/restaurants",
  },
  {
    id: "alt-2",
    title: "Friday Evening Reservation Peak",
    description: "Main Hearth and Wine Cellar are 96% booked for Friday 7:00 PM - 9:30 PM.",
    severity: "info",
    timestamp: "1 hour ago",
    unread: true,
  },
  {
    id: "alt-3",
    title: "Automated Daily Payout Dispatched",
    description: "$34,820.00 disbursed to Fifth Third Operating Account successfully.",
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
    { name: "Wood-Fired Steaks & Chops", orderSharePct: 38.5, revenue: 164900, growthPct: 22.4, topDish: "45-Day Dry-Aged Ribeye" },
    { name: "Hand-Rolled Pastas & Primi", orderSharePct: 24.2, revenue: 103500, growthPct: 18.1, topDish: "Truffle Tagliolini" },
    { name: "Charred Seafood & Raw Bar", orderSharePct: 16.8, revenue: 71900, growthPct: 15.6, topDish: "Pan-Seared Diver Scallops" },
    { name: "Sommelier Reserve Wine Flights", orderSharePct: 12.3, revenue: 52600, growthPct: 11.2, topDish: "Napa Valley Cellar Pairing" },
    { name: "Craft Cocktails & Digestifs", orderSharePct: 8.2, revenue: 35145, growthPct: 9.8, topDish: "Smoked Maple Old Fashioned" },
  ];

  const topVendors: VendorPerformance[] = [
    {
      id: "st-1",
      name: "Main Hearth Dining Room",
      area: "Floor 1 • Tables 1-10",
      revenue: 184000,
      orders: 1420,
      rating: 4.96,
      reviewCount: 640,
      fulfillmentRate: 99.4,
      badge: "Primary Dining Zone",
      coversLabel: "42 Seats • Floor Open",
      targetComparison: "+18.2% vs target",
      auditBadge: "Exemplary",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1400&auto=format&fit=crop",
    },
    {
      id: "st-2",
      name: "Wine Cellar Private Reserve",
      area: "Sub-Level Cellar • Tables 11-14",
      revenue: 124500,
      orders: 480,
      rating: 4.98,
      reviewCount: 312,
      fulfillmentRate: 100.0,
      badge: "VIP & Tasting Lounge",
      coversLabel: "18 Seats • Reserved Seating",
      targetComparison: "High AOV ($148.00)",
      auditBadge: "Exemplary",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1400&auto=format&fit=crop",
    },
    {
      id: "st-3",
      name: "Garden Patio & Pergola",
      area: "Terrace Hearth • Tables 15-18",
      revenue: 68400,
      orders: 620,
      rating: 4.88,
      reviewCount: 220,
      fulfillmentRate: 98.9,
      badge: "Outdoor Terrace",
      coversLabel: "16 Seats • Weather Active",
      targetComparison: "+14.6% vs target",
      auditBadge: "Standard",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1400&auto=format&fit=crop",
    },
    {
      id: "st-4",
      name: "Chef's Tasting Counter & Bar",
      area: "Exhibition Hearth • Tables 19-22",
      revenue: 51145,
      orders: 290,
      rating: 5.0,
      reviewCount: 180,
      fulfillmentRate: 100.0,
      badge: "Tasting Experience",
      coversLabel: "8 Seats • Omakase Pacing",
      targetComparison: "Tasting Menu ($135/pp)",
      auditBadge: "Exemplary",
      image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=1400&auto=format&fit=crop",
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
  activeAdmins: 8,
  totalSeats: 10,
  elevatedBypassCount: 2,
  twoFactorCompliancePct: 100,
  twoFactorNote: "Strict Hardware Token / App",
  idleTimeoutMinutes: 15,
  idleTimeoutNote: "Automatic session lock & signoff",
  dualSignoffThresholdBdt: 25000,
  dualSignoffNote: "Super Admin co-signature mandatory",
};

export const MOCK_PLATFORM_ADMINS: PlatformAdminUser[] = [
  {
    id: "adm-1",
    name: "Samin Kazi",
    email: "owner@mapleandvine.com",
    uid: "MV-OWN-001",
    role: "Super Admin",
    territory: "The Maple & Vine (Proprietor)",
    subScope: "Executive Ownership, Financial Ledgers & Security Controls",
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
    phone: "(313) 555-0101",
  },
  {
    id: "adm-2",
    name: "Marcus Vance",
    email: "manager@mapleandvine.com",
    uid: "MV-GM-002",
    role: "General Manager",
    territory: "Restaurant Operations & Staff",
    subScope: "Shift Scheduling, Table Inventory, Vendor Orders & Floor Plan",
    status: "Active",
    twoFactorStatus: "Enforced",
    twoFactorType: "app",
    lastSession: "14 mins ago",
    isActiveNow: true,
    avatarUrl:
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=300&auto=format&fit=crop",
    isRootOwner: false,
    canBeRevoked: true,
    dateAdded: "2024-02-01",
    permissions: [
      "merchants:onboard",
      "tables:manage",
      "dispatch:supervise",
      "support:escalate",
      "menu:manage",
    ],
    phone: "(313) 555-0142",
  },
  {
    id: "adm-3",
    name: "Sarah Jenkins",
    email: "host@mapleandvine.com",
    uid: "MV-HST-003",
    role: "Dining Room Lead",
    territory: "Front of House & Host Stand",
    subScope: "24-Table Seating Matrix, VIP Holds & Walk-in Arrivals",
    status: "Active",
    twoFactorStatus: "2FA Active",
    twoFactorType: "app",
    lastSession: "25 mins ago",
    isActiveNow: true,
    avatarUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop",
    isRootOwner: false,
    canBeRevoked: true,
    dateAdded: "2024-03-10",
    permissions: [
      "tables:manage",
      "bookings:modify",
      "users:contact",
    ],
    phone: "(313) 555-0148",
  },
  {
    id: "adm-4",
    name: "David Miller",
    email: "cashier@mapleandvine.com",
    uid: "MV-FIN-004",
    role: "Head Cashier & Finance",
    territory: "Daily Settlement & POS Till",
    subScope: "Guest Billing, Card Processing Reconciliations & Refunds",
    status: "Active",
    twoFactorStatus: "Enforced",
    twoFactorType: "hardware",
    lastSession: "1 hour ago",
    isActiveNow: false,
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop",
    isRootOwner: false,
    canBeRevoked: true,
    dateAdded: "2024-04-01",
    permissions: [
      "payouts:initiate",
      "refunds:approve",
      "ledger:read",
      "tax:reconcile",
    ],
    phone: "(313) 555-0155",
  },
  {
    id: "adm-5",
    name: "Kazi Rezwan",
    email: "compliance@mapleandvine.com",
    uid: "MV-CMP-005",
    role: "Compliance & Audit Admin",
    territory: "Health, Safety & City Licensing",
    subScope: "Wayne County Food Safety, Liquor License & Protocol Audit",
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
    phone: "(313) 555-0166",
  },
  {
    id: "adm-6",
    name: "Emily Watson",
    email: "concierge@mapleandvine.com",
    uid: "MV-CS-006",
    role: "Customer Support Lead",
    territory: "Patron Relations & Events",
    subScope: "Private Dining Inquiries, Catering & Dietary Special Requests",
    status: "Active",
    twoFactorStatus: "2FA Active",
    twoFactorType: "app",
    lastSession: "3 hours ago",
    isActiveNow: false,
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop",
    isRootOwner: false,
    canBeRevoked: true,
    dateAdded: "2024-05-12",
    permissions: [
      "support:manage",
      "bookings:modify",
      "orders:triage",
      "users:contact",
    ],
    phone: "(313) 555-0177",
  },
  {
    id: "adm-7",
    name: "Arthur Pendelton",
    email: "operations@mapleandvine.com",
    uid: "MV-OPS-007",
    role: "Operations Admin",
    territory: "Procurement & Storage Log",
    subScope: "Supplier Deliveries, Cold Storage Verification & Linens",
    status: "Active",
    twoFactorStatus: "Enforced",
    twoFactorType: "app",
    lastSession: "5 hours ago",
    isActiveNow: false,
    avatarUrl: "",
    isRootOwner: false,
    canBeRevoked: true,
    dateAdded: "2024-06-08",
    permissions: ["tables:manage", "dispatch:supervise", "safety:flag"],
    phone: "(313) 555-0188",
  },
  {
    id: "adm-8",
    name: "Thomas Hayes",
    email: "sommelier@mapleandvine.com",
    uid: "MV-SOM-008",
    role: "Dining Room Lead",
    territory: "Cellar & Beverage Curation",
    subScope: "Wine Cellar List, Bar Service Pairing & Tasting Flight Notes",
    status: "Active",
    twoFactorStatus: "2FA Active",
    twoFactorType: "app",
    lastSession: "Yesterday, 16:10",
    isActiveNow: false,
    avatarUrl: "",
    isRootOwner: false,
    canBeRevoked: true,
    dateAdded: "2024-06-15",
    permissions: ["menu:manage", "tables:manage"],
    phone: "(313) 555-0199",
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
  commissionRate: 6.0, // Michigan state sales tax
  reservationDepositFee: 25, // $25 reservation deposit for parties 6+
  enforcePartyRule: true,
  payoutSchedule: "Automated Daily Settlement (T+1 at midnight EST)",
  featuredRestaurants: [
    { id: "feat-1", name: "Main Hearth Dining Room", area: "Corktown, Detroit" },
    { id: "feat-2", name: "Wine Cellar Private Reserve", area: "Corktown, Detroit" },
    { id: "feat-3", name: "Garden Patio & Pergola", area: "Corktown, Detroit" },
    { id: "feat-4", name: "Chef's Tasting Counter & Bar", area: "Corktown, Detroit" },
  ],
  rotationInterval: "Weekly Dynamic Rotation",
  includeHeroVideo: true,
  maintenanceMode: false,
  maintenanceMessage:
    "The Maple & Vine portal is currently undergoing scheduled platform upgrades. We will be back online shortly!",
  lastModifiedBy: "Samin Kazi (Proprietor & Super Admin)",
  lastModifiedAt: "Oct 22, 2025 at 16:45 EST",
};

export const ELIGIBLE_RESTAURANTS_POOL: FeaturedRestaurantItem[] = [
  { id: "pool-1", name: "Main Hearth Dining Room", area: "Floor 1 • Tables 1-10", cuisine: "Wood-Fired Steaks & Chops", rating: 4.96 },
  { id: "pool-2", name: "Wine Cellar Private Reserve", area: "Sub-Level Cellar • Tables 11-14", cuisine: "Sommelier Tasting & VIP", rating: 4.98 },
  { id: "pool-3", name: "Garden Patio & Pergola", area: "Terrace Hearth • Tables 15-18", cuisine: "Wood-Fired & Alfresco", rating: 4.88 },
  { id: "pool-4", name: "Chef's Tasting Counter & Bar", area: "Exhibition Hearth • Tables 19-22", cuisine: "Tasting Experience", rating: 5.0 },
  { id: "pool-5", name: "Corktown Lounge & Bar", area: "Front Parlor • Tables 23-26", cuisine: "Cocktails & Small Plates", rating: 4.92 },
  { id: "pool-6", name: "Mezzanine Private Boardroom", area: "Upper Level • Tables 27-28", cuisine: "Executive Private Dining", rating: 4.95 },
];

export function getPlatformGlobalSettings(): PlatformGlobalSettings {
  return DEFAULT_PLATFORM_SETTINGS;
}

export function getEligibleFeaturedRestaurants(): FeaturedRestaurantItem[] {
  return ELIGIBLE_RESTAURANTS_POOL;
}


