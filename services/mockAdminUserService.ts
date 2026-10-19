import { AdminUser, UserSummaryStats, NewUserInput, UserRole } from "@/types/adminUser";

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: "USR-1082",
    name: "Arthur Pendelton",
    email: "arthur.p@detroitfinance.com",
    phone: "(313) 555-0188",
    role: "diner",
    roleLabel: "VIP Patron",
    location: "Corktown, Detroit",
    tag: "Sommelier Club Member",
    joinedDate: "14 Oct 2024",
    lastActive: "12 mins ago",
    isOnline: true,
    accountStatus: "active",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop",
    initials: "AP",
    loyaltyPoints: 1450,
    ordersCount: 28,
  },
  {
    id: "USR-1081",
    name: "Marcus Vance",
    email: "manager@mapleandvine.com",
    phone: "(313) 555-0142",
    role: "restaurant_owner",
    roleLabel: "General Manager",
    location: "Corktown, Detroit",
    tag: "The Maple & Vine Operations",
    joinedDate: "02 Sep 2023",
    lastActive: "Active now",
    isOnline: true,
    accountStatus: "active",
    avatarUrl:
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=300&auto=format&fit=crop",
    initials: "MV",
    ordersCount: 2840,
  },
  {
    id: "USR-1080",
    name: "Sarah Lin",
    email: "sarah.lin@detroitlaw.org",
    phone: "(313) 555-0149",
    role: "diner",
    roleLabel: "VIP Patron",
    location: "Downtown Detroit",
    tag: "Corporate Dining Account",
    joinedDate: "28 Jan 2024",
    lastActive: "Yesterday",
    isOnline: false,
    accountStatus: "active",
    avatarUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop",
    initials: "SL",
    loyaltyPoints: 3120,
    ordersCount: 52,
  },
  {
    id: "USR-1079",
    name: "Thomas Hayes",
    email: "sommelier@mapleandvine.com",
    phone: "(313) 555-0199",
    role: "admin",
    roleLabel: "Head Sommelier",
    location: "Corktown, Detroit",
    tag: "Wine Cellar Curation",
    joinedDate: "11 Nov 2023",
    lastActive: "3 hours ago",
    isOnline: false,
    accountStatus: "active",
    avatarUrl:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=300&auto=format&fit=crop",
    initials: "TH",
    ordersCount: 840,
  },
  {
    id: "USR-1078",
    name: "Jordan Miller",
    email: "jordan.m@gmail.com",
    phone: "(313) 555-0164",
    role: "diner",
    roleLabel: "Patron",
    location: "Midtown, Detroit",
    tag: "Tasting Menu Regular",
    joinedDate: "04 May 2024",
    lastActive: "14 days ago",
    isOnline: false,
    accountStatus: "active",
    initials: "JM",
    loyaltyPoints: 480,
    ordersCount: 8,
  },
  {
    id: "USR-1077",
    name: "Emily Watson",
    email: "concierge@mapleandvine.com",
    phone: "(313) 555-0177",
    role: "support_admin",
    roleLabel: "Customer Support & Events",
    location: "Corktown, Detroit",
    tag: "Private Dining Concierge",
    joinedDate: "19 Aug 2023",
    lastActive: "Active now",
    isOnline: true,
    accountStatus: "active",
    initials: "EW",
  },
  {
    id: "USR-1076",
    name: "Elena Rostova",
    email: "elena.r@motorcapital.com",
    phone: "(313) 555-0191",
    role: "diner",
    roleLabel: "VIP Patron",
    location: "Riverfront, Detroit",
    tag: "Wine Club Platinum",
    joinedDate: "15 Mar 2024",
    lastActive: "4 hours ago",
    isOnline: true,
    accountStatus: "active",
    avatarUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&auto=format&fit=crop",
    initials: "ER",
    loyaltyPoints: 2890,
    ordersCount: 46,
  },
  {
    id: "USR-1075",
    name: "David Miller",
    email: "cashier@mapleandvine.com",
    phone: "(313) 555-0155",
    role: "admin",
    roleLabel: "Head Cashier & Finance",
    location: "Corktown, Detroit",
    tag: "Settlement Till Supervisor",
    joinedDate: "10 Dec 2023",
    lastActive: "2 hours ago",
    isOnline: true,
    accountStatus: "active",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop",
    initials: "DM",
    ordersCount: 1720,
  },
  {
    id: "USR-1074",
    name: "Zachary Vance",
    email: "zachary.vance@detroithospitality.com",
    phone: "(313) 555-0172",
    role: "diner",
    roleLabel: "Patron",
    location: "Woodbridge, Detroit",
    tag: "Sunday Brunch Regular",
    joinedDate: "01 Aug 2024",
    lastActive: "5 days ago",
    isOnline: false,
    accountStatus: "pending",
    initials: "ZV",
    ordersCount: 12,
  },
  {
    id: "USR-1073",
    name: "Samin Kazi",
    email: "owner@mapleandvine.com",
    phone: "(313) 555-0101",
    role: "admin",
    roleLabel: "Super Admin",
    location: "Corktown, Detroit",
    tag: "Proprietor & Partner",
    joinedDate: "15 Jul 2023",
    lastActive: "Active now",
    isOnline: true,
    accountStatus: "active",
    initials: "SK",
  },
  {
    id: "USR-1072",
    name: "Chloe Bennett",
    email: "chloe.b@architectsdetroit.com",
    phone: "(313) 555-0183",
    role: "diner",
    roleLabel: "Patron",
    location: "Brush Park, Detroit",
    tag: "Chef Counter Enthusiast",
    joinedDate: "22 Feb 2024",
    lastActive: "6 hours ago",
    isOnline: false,
    accountStatus: "active",
    initials: "CB",
    loyaltyPoints: 3410,
    ordersCount: 58,
  },
  {
    id: "USR-1071",
    name: "Sarah Jenkins",
    email: "host@mapleandvine.com",
    phone: "(313) 555-0148",
    role: "restaurant_owner",
    roleLabel: "Dining Room Lead",
    location: "Corktown, Detroit",
    tag: "FOH Floor Supervisor",
    joinedDate: "18 Oct 2023",
    lastActive: "30 mins ago",
    isOnline: true,
    accountStatus: "active",
    initials: "SJ",
    ordersCount: 1870,
  },
];

export function getAdminUsers(): AdminUser[] {
  return INITIAL_ADMIN_USERS;
}

export function getUserSummaryStats(users: AdminUser[]): UserSummaryStats {
  const dinersCount = users.filter((u) => u.role === "diner").length;
  const venuesCount = users.filter((u) => u.role === "restaurant_owner").length;
  const adminsCount = users.filter((u) => u.role === "admin" || u.role === "support_admin").length;

  return {
    totalDirectory: 4820,
    totalGrowth: "+14.2% mo",
    activeDiners: 4610,
    dinersShare: "95.6% share",
    venuesAndOwners: 1,
    venuesOnboarding: "The Maple & Vine (Corktown)",
    staffAndAdmins: 8,
    staffHighPrivileges: "4 elevated roles",
  };
}

export function formatRoleLabel(role: UserRole): string {
  switch (role) {
    case "diner":
      return "Patron";
    case "restaurant_owner":
      return "Floor Manager";
    case "support_admin":
      return "Customer Support";
    case "admin":
      return "Super Admin";
    default:
      return "User";
  }
}

export function exportUsersToCsv(filename: string, users: AdminUser[]) {
  const headers = [
    "User ID",
    "Full Name",
    "Email Address",
    "Phone Number",
    "Role",
    "Location / Tag",
    "Joined Date",
    "Last Active",
    "Account Status",
    "Orders Count",
  ];

  const rows = users.map((u) => [
    u.id,
    u.name,
    u.email,
    u.phone,
    formatRoleLabel(u.role),
    `${u.location}${u.tag ? ` (${u.tag})` : ""}`,
    u.joinedDate,
    u.lastActive,
    u.accountStatus,
    (u.ordersCount ?? 0).toString(),
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${cell.replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
