export type AdminTimeRange = "ytd" | "q3" | "12m" | "7d" | "30d" | "90d" | "custom";

export interface AdminOverviewKpis {
  totalUsers: number;
  userGrowthPct: number;
  userGrowthNote: string;
  userProgressPct: number;

  activeRestaurants: number;
  onboardingRestaurants: number;
  onboardingNote: string;
  restaurantProgressPct: number;

  completedOrders: number;
  fulfillmentRatePct: number;
  fulfillmentNote: string;
  orderProgressPct: number;

  grossGmv: number;
  gmvGrowthPct: number;
  gmvGrowthNote: string;
  gmvProgressPct: number;
}

export interface OperationalHealthMetric {
  title: string;
  value: string;
  subValue: string;
  benchmarkNote: string;
  progressPct: number;
  icon: string;
  accentColor: "primary" | "secondary" | "tint";
}

export interface OperationalHealth {
  activeCouriers: number;
  courierCapacityPct: number;
  disputeRatePct: number;
  disputeBenchmarkPct: number;
  seatedReservations: number;
  seatedGrowthPct: number;
  avgKitchenPrepMinutes: number;
  prepTimeDeltaMinutes: number;
}

export interface MonthlyVolumeItem {
  month: string;
  fullMonth: string;
  revenue: number; // In BDT
  orders: number;
  isPeak: boolean;
  isCurrent: boolean;
}

export type AuditEventStatus =
  | "settled"
  | "verified"
  | "rerouted"
  | "applied"
  | "pending"
  | "flagged";

export interface AdminAuditEvent {
  id: string;
  type: "payout" | "verification" | "escalation" | "commission" | "account" | "menu";
  title: string;
  entityName: string;
  contextValue: string;
  operator: string;
  timestamp: string;
  status: AuditEventStatus;
  details?: string;
}

export interface AdminAlert {
  id: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "error" | "success";
  timestamp: string;
  unread: boolean;
  link?: string;
}

export interface EditorialFeatureItem {
  id: string;
  tag: string;
  title: string;
  metrics: string;
  image: string;
}

export interface AnalyticsTrendPoint {
  label: string;
  date: string;
  revenue: number;
  orders: number;
  reservations: number;
  newUsers: number;
}

export interface CuisinePerformance {
  name: string;
  orderSharePct: number;
  revenue: number;
  growthPct: number;
  topDish: string;
}

export interface VendorPerformance {
  id: string;
  name: string;
  area: string;
  revenue: number;
  orders: number;
  rating: number;
  fulfillmentRate: number;
  badge: string;
  image?: string;
  reviewCount?: number;
  coversLabel?: string;
  targetComparison?: string;
  auditBadge?: "Exemplary" | "Standard" | "Audited";
}

export interface OrderStatusBreakdown {
  status: string;
  label: string;
  count: number;
  percentage: number;
  badgeColor: string;
}

export interface AdminAnalyticsData {
  timeRange: AdminTimeRange;
  dateRangeLabel: string;
  summary: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    totalReservations: number;
    newPatrons: number;
    revenueGrowthPct: number;
    ordersGrowthPct: number;
  };
  trend: AnalyticsTrendPoint[];
  orderStatusDistribution: OrderStatusBreakdown[];
  topCuisines: CuisinePerformance[];
  topVendors: VendorPerformance[];
}

export type PlatformAdminRole =
  | "Super Admin"
  | "General Manager"
  | "Dining Room Lead"
  | "Head Cashier & Finance"
  | "Operations Admin"
  | "Finance & Treasury Admin"
  | "Compliance & Audit Admin"
  | "Customer Support Lead";

export type AdminAccountStatus = "Active" | "Pending" | "Suspended";

export interface PlatformAdminUser {
  id: string;
  name: string;
  email: string;
  uid: string;
  role: PlatformAdminRole;
  territory: string;
  subScope: string;
  status: AdminAccountStatus;
  twoFactorStatus: "Enforced (YubiKey)" | "Enforced" | "2FA Active" | "Pending Setup";
  twoFactorType: "hardware" | "app" | "none";
  lastSession: string;
  isActiveNow: boolean;
  avatarUrl?: string;
  isRootOwner?: boolean;
  canBeRevoked?: boolean;
  dateAdded: string;
  permissions: string[];
  phone?: string;
}

export interface AdminGovernanceMetrics {
  activeAdmins: number;
  totalSeats: number;
  elevatedBypassCount: number;
  twoFactorCompliancePct: number;
  twoFactorNote: string;
  idleTimeoutMinutes: number;
  idleTimeoutNote: string;
  dualSignoffThresholdBdt: number;
  dualSignoffNote: string;
}

export interface FeaturedRestaurantItem {
  id: string;
  name: string;
  area: string;
  cuisine?: string;
  rating?: number;
  image?: string;
}

export interface PlatformGlobalSettings {
  commissionRate: number; // e.g. 12.5%
  reservationDepositFee: number; // e.g. 250 BDT
  enforcePartyRule: boolean; // Mandatory for parties of 5+
  payoutSchedule: string;
  featuredRestaurants: FeaturedRestaurantItem[];
  rotationInterval: string;
  includeHeroVideo: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  lastModifiedBy: string;
  lastModifiedAt: string;
}


