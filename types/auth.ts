export type UserRole = "USER" | "VENDOR" | "ADMIN";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  avatarUrl?: string | null;
  loyaltyPoints?: number;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  data?: AuthUser;
  errors?: Array<{ field: string; message: string }>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: "USER" | "VENDOR";
}
