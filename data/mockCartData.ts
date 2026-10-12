import { CartItem, CartRecommendation } from "@/types/cart";
import { DeliveryAddress, CustomerContact } from "@/types/order";

export const INITIAL_CART_ITEMS: CartItem[] = [
  {
    id: "item-1",
    name: "Special Mutton Kacchi Biryani (Full)",
    price: 650,
    quantity: 2,
    variant: "Extra Aloo included • ৳650 each",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA7X0pqpr4zWKJSOW1yg6Q1wHcLeMs6EGG-TH_aD1-B_jFLIgbvYfSSZAiOjMJCheHkOw4FyxquD_cbcZcQTz3F1WXsiAtJgoz2b8PAkLr5k-hd6Q8x5Q7xS5HAZryGJPZTi3zt2KW2tEDNlug-VwitgFPl-GniSeKlskZAof9XH3hr1Ezr2tALNgAi_f4L6nh6isNBFedsJDEYEP-Ky9vb5jnVBPjoQm6yCbxd-LvX7ckX_1Y7hwXUtw",
    imageAlt: "Traditional Bangladeshi Special Mutton Kacchi Biryani with golden potato, fragrant chinigura rice, and tender mutton shank plated in a vintage brass handi with warm ambient lighting",
  },
  {
    id: "item-2",
    name: "Shahi Reshmi Kebab (4 pcs)",
    price: 420,
    quantity: 1,
    variant: "Mint chutney dip • ৳420 each",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDRddE1No1-8UBjIEENwZNzCg6buFLmesK8CRGKfvQ8tpvMwWsOUjLk9uZh5RcfuDUywaVp4kJd8guNlbmZbSWrXj0JXPFjCDuIaCW06qfmNSEF3TWGuQwQSh6nqr3Bj091wQ_a4_P2xyv796ICsRmIexZBI80-rxmHQ9CM8AFOIY8rnOBc0-Ainp4OU-ghtu6_CI1mrtUVjGmlBsIwmhYLL8XxpFX-sCsT9DLCbeVQ4-NimPc6_H2RGQ",
    imageAlt: "Charcoal grilled Shahi Reshmi Kebab skewers with aromatic green mint curd chutney and lemon wedges on handmade dark stoneware",
  },
  {
    id: "item-3",
    name: "Shahi Borhani (500ml)",
    price: 110,
    quantity: 2,
    variant: "Chilled • ৳110 each",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuABHC2j7I6n9koI7TEVw_kkzSpmiGEn8N45zHVtKmpE758Ur-Qpt4S-NmtLMzn2y-zazt5OHt6QKp29nYnM6LnojyO17mSBhHNLNn1S78XjJu-Sfzv3r_lU-Nvjk0bClKOvufahX1DuQcqZJ6HyGj9HKdrW2IeW3MUgQyshr-joUuN5OQt9k_uDbYgnOcqCljEhitnUw-cZaxNmHjrKaseVdHiPFPz1g7rs3nV6Y6rSbdz4NyQvjYQbpA",
    imageAlt: "Traditional spiced yogurt drink Shahi Borhani in a traditional terra-cotta clay pot decorated with fresh mint sprigs in soft restaurant daylight",
  },
];

export const CHEF_RECOMMENDATION: CartRecommendation = {
  id: "item-rec-1",
  name: "Firni & Zarda Duo",
  price: 140,
  description: "+৳140 (Special dessert pairing)",
};

export const SAVED_ADDRESSES: DeliveryAddress[] = [
  {
    id: "addr-home",
    type: "home",
    label: "Home",
    street: "House 42, Road 11, Block D",
    apartment: "Flat 4B (South Suite)",
    floor: "4th Floor / Lift 02",
    instructions: "Leave at reception or ring bell once. Do not knock.",
    isDefault: true,
  },
  {
    id: "addr-office",
    type: "office",
    label: "Office",
    street: "Tower 71, Level 9, Gulshan 2 Avenue",
    apartment: "Suite 902",
    floor: "9th Floor",
    instructions: "Call on arrival; drop at front desk.",
    isDefault: false,
  },
];

export const DEFAULT_CONTACT: CustomerContact = {
  fullName: "Tahmid Rahman",
  phone: "+880 1712-345678",
  email: "tahmid@example.com",
};
