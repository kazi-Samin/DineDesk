import { CustomerProfileData, CustomerAddress } from "@/types/customerProfile";

export const INITIAL_CUSTOMER_PROFILE: CustomerProfileData = {
  fullName: "Tahmid Rahman",
  email: "tahmid.rahman@example.com",
  phone: "+880 1712-345678",
  language: "en",
  dietaryPreferences: ["halal_only", "nut_allergy"],
  avatarUrl:
    "https://lh3.googleusercontent.com/aida/AEtjO1Xvc2MrKyLPPwPKRHPvGiuGzzv3Vl3xudUMnfKmM_OejgtKJObOFHcqNPF4XgM99yJVO2vd5xVNy1ialfL7MMAf-mTYsbOekfDFOQeP3J_05sjjK_dG1-TowYtfmniCeQ5oWP3YUL0mOpQ_Kd_4gnUIQvBpdLJfX7FS7iKDGaNDFcEeOV3fOJ7c2-_IHK7W8BGBNX8pIPLWpzKWXacemtS8HMQtfBJOmvihWXCsfl9OXjXlGaVf6vC98QUC",
  isEmailVerified: true,
  isPhoneVerified: true,
  roleBadge: "Verified Foodie",
  memberSince: "Patron since 2023",
  passwordLastChangedDays: 42,
  twoFactorPhone: "+880 1712-345678",
  stats: {
    totalOrders: 28,
    activeBookings: 1,
    savedSpots: 14,
    loyaltyPoints: 1450,
  },
};

export const INITIAL_CUSTOMER_ADDRESSES: CustomerAddress[] = [
  {
    id: "addr-home-1",
    label: "Home (Banani Residence)",
    category: "home",
    subtitle: "Residential Hub • Verified GPS",
    recipientName: "Tahmid Rahman",
    contactNumber: "+880 1712-345678",
    building: "House 42",
    road: "Road 11, Block D",
    apartment: "Flat 4B (South Suite)",
    city: "Dhaka",
    postalCode: "1213",
    deliveryInstructions:
      "Leave at reception or ring bell once. Do not knock after 9 PM.",
    isDefault: true,
  },
  {
    id: "addr-office-2",
    label: "Office (Gulshan Hub)",
    category: "office",
    subtitle: "Corporate Office • Freight Elevator Access",
    recipientName: "Tahmid Rahman",
    contactNumber: "+880 1712-345678",
    building: "Level 9, Tower 71",
    road: "Road 36, Gulshan 2",
    apartment: "",
    city: "Dhaka",
    postalCode: "1212",
    deliveryInstructions:
      "Reception desk delivery during working hours 9 AM - 6 PM.",
    isDefault: false,
  },
  {
    id: "addr-family-3",
    label: "Family Home (Dhanmondi)",
    category: "family",
    subtitle: "Weekend Residence",
    recipientName: "Tahmid Rahman",
    contactNumber: "+880 1712-345678",
    building: "House 18",
    road: "Road 7A, Dhanmondi R/A",
    apartment: "",
    city: "Dhaka",
    postalCode: "1209",
    deliveryInstructions: "",
    isDefault: false,
  },
];
