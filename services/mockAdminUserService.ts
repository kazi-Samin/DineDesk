import { AdminUser, UserSummaryStats, NewUserInput, UserRole } from "@/types/adminUser";

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: "USR-1082",
    name: "Tahmid Rahman",
    email: "tahmid.r@example.com",
    phone: "+880 1711-209841",
    role: "diner",
    roleLabel: "Diner",
    location: "Banani, Dhaka",
    tag: "VIP Diner",
    joinedDate: "14 Oct 2024",
    lastActive: "12 mins ago",
    isOnline: true,
    accountStatus: "active",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop",
    initials: "TR",
    loyaltyPoints: 1450,
    ordersCount: 28,
  },
  {
    id: "USR-1081",
    name: "Chef Kabir Alam",
    email: "sultan.heritage@dinedesk.com",
    phone: "+880 1819-332190",
    role: "restaurant_owner",
    roleLabel: "Restaurant Owner",
    location: "Banani 11",
    tag: "Sultan's Heritage",
    joinedDate: "02 Sep 2023",
    lastActive: "1 hour ago",
    isOnline: true,
    accountStatus: "active",
    avatarUrl:
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=300&auto=format&fit=crop",
    initials: "CK",
    ordersCount: 2840,
  },
  {
    id: "USR-1080",
    name: "Farzana Haque",
    email: "farzana.h@fintech.bd",
    phone: "+880 1912-764902",
    role: "diner",
    roleLabel: "Diner",
    location: "Gulshan 2, Dhaka",
    tag: "Corporate Connoisseur",
    joinedDate: "28 Jan 2024",
    lastActive: "Yesterday",
    isOnline: false,
    accountStatus: "active",
    avatarUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop",
    initials: "FH",
    loyaltyPoints: 3120,
    ordersCount: 52,
  },
  {
    id: "USR-1079",
    name: "Anisur Rahman",
    email: "anis@copperchimney.bd",
    phone: "+880 1623-881240",
    role: "restaurant_owner",
    roleLabel: "Restaurant Owner",
    location: "The Copper Chimney",
    tag: "Gulshan Bistro",
    joinedDate: "11 Nov 2023",
    lastActive: "3 days ago",
    isOnline: false,
    accountStatus: "active",
    avatarUrl:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=300&auto=format&fit=crop",
    initials: "AR",
    ordersCount: 1540,
  },
  {
    id: "USR-1078",
    name: "Sarah Mustaq",
    email: "sarah.m@gmail.com",
    phone: "+880 1789-943012",
    role: "diner",
    roleLabel: "Diner",
    location: "Dhanmondi, Dhaka",
    tag: "Patron",
    joinedDate: "04 May 2024",
    lastActive: "14 days ago",
    isOnline: false,
    accountStatus: "active",
    initials: "SM",
    loyaltyPoints: 480,
    ordersCount: 8,
  },
  {
    id: "USR-1077",
    name: "Rafiqul Islam",
    email: "rafiq@dinedesk.corp",
    phone: "+880 1515-442801",
    role: "support_admin",
    roleLabel: "Support Admin",
    location: "Dhaka HQ Office",
    tag: "Dispatch Governance",
    joinedDate: "19 Aug 2023",
    lastActive: "Active now",
    isOnline: true,
    accountStatus: "active",
    initials: "RI",
  },
  {
    id: "USR-1076",
    name: "Nusrat Jahan",
    email: "nusrat.j@example.com",
    phone: "+880 1718-992211",
    role: "diner",
    roleLabel: "Diner",
    location: "Uttara Sector 4, Dhaka",
    tag: "VIP Gourmet",
    joinedDate: "15 Mar 2024",
    lastActive: "4 hours ago",
    isOnline: true,
    accountStatus: "active",
    avatarUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&auto=format&fit=crop",
    initials: "NJ",
    loyaltyPoints: 2890,
    ordersCount: 46,
  },
  {
    id: "USR-1075",
    name: "Tanvir Hasan",
    email: "tanvir@smashcraft.bd",
    phone: "+880 1611-223344",
    role: "restaurant_owner",
    roleLabel: "Restaurant Owner",
    location: "Dhanmondi 27",
    tag: "SmashCraft Studio",
    joinedDate: "10 Dec 2023",
    lastActive: "2 hours ago",
    isOnline: true,
    accountStatus: "active",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop",
    initials: "TH",
    ordersCount: 1720,
  },
  {
    id: "USR-1074",
    name: "Aminul Chowdhury",
    email: "aminul@chowdhury.bd",
    phone: "+880 1912-889900",
    role: "restaurant_owner",
    roleLabel: "Restaurant Owner",
    location: "Uttara Sector 7",
    tag: "Chowdhury Khana",
    joinedDate: "01 Aug 2024",
    lastActive: "5 days ago",
    isOnline: false,
    accountStatus: "pending",
    initials: "AC",
    ordersCount: 0,
  },
  {
    id: "USR-1073",
    name: "Samin Kazi",
    email: "samin.kazi@dinedesk.bd",
    phone: "+880 1700-112233",
    role: "admin",
    roleLabel: "Super Admin",
    location: "Dhaka HQ",
    tag: "Platform Architect",
    joinedDate: "15 Jul 2023",
    lastActive: "Active now",
    isOnline: true,
    accountStatus: "active",
    initials: "SK",
  },
  {
    id: "USR-1072",
    name: "Ayesha Siddiqua",
    email: "ayesha.s@example.com",
    phone: "+880 1817-665544",
    role: "diner",
    roleLabel: "Diner",
    location: "Bashundhara R/A, Dhaka",
    tag: "Gold Connoisseur",
    joinedDate: "22 Feb 2024",
    lastActive: "6 hours ago",
    isOnline: false,
    accountStatus: "active",
    initials: "AS",
    loyaltyPoints: 3410,
    ordersCount: 58,
  },
  {
    id: "USR-1071",
    name: "Zubair Rahman",
    email: "zubair@brassspoon.bd",
    phone: "+880 1715-778899",
    role: "restaurant_owner",
    roleLabel: "Restaurant Owner",
    location: "Banani Road 8",
    tag: "The Brass Spoon",
    joinedDate: "18 Oct 2023",
    lastActive: "30 mins ago",
    isOnline: true,
    accountStatus: "active",
    initials: "ZR",
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
    totalDirectory: 48290,
    totalGrowth: "+4.2% mo",
    activeDiners: 46110,
    dinersShare: "95.4% share",
    venuesAndOwners: 142,
    venuesOnboarding: "8 onboarding",
    staffAndAdmins: 38,
    staffHighPrivileges: "12 high privileges",
  };
}

export function formatRoleLabel(role: UserRole): string {
  switch (role) {
    case "diner":
      return "Diner";
    case "restaurant_owner":
      return "Restaurant Owner";
    case "support_admin":
      return "Support Admin";
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
