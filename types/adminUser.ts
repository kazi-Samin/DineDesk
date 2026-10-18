export type UserRole = "diner" | "restaurant_owner" | "admin" | "support_admin";
export type UserAccountStatus = "active" | "suspended" | "pending";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  roleLabel: string;
  location: string;
  tag?: string;
  joinedDate: string;
  lastActive: string;
  isOnline: boolean;
  accountStatus: UserAccountStatus;
  avatarUrl?: string;
  initials: string;
  loyaltyPoints?: number;
  ordersCount?: number;
}

export interface UserSummaryStats {
  totalDirectory: number;
  totalGrowth: string;
  activeDiners: number;
  dinersShare: string;
  venuesAndOwners: number;
  venuesOnboarding: string;
  staffAndAdmins: number;
  staffHighPrivileges: string;
}

export interface NewUserInput {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  location: string;
  accountStatus: UserAccountStatus;
}
