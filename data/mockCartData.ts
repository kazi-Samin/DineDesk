import { CartItem, CartRecommendation } from "@/types/cart";
import { DeliveryAddress, CustomerContact } from "@/types/order";

export const INITIAL_CART_ITEMS: CartItem[] = [
  {
    id: "item-1",
    name: "Heritage Dry-Aged Ribeye (14oz)",
    price: 48,
    quantity: 2,
    variant: "Rosemary butter & garlic • $48 each",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=400&auto=format&fit=crop",
    imageAlt: "Dry-aged prime ribeye steak seared on cast iron with herb butter",
  },
  {
    id: "item-2",
    name: "Wood-Fired Hearth Chicken",
    price: 28,
    quantity: 1,
    variant: "Wild thyme glaze • $28 each",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=400&auto=format&fit=crop",
    imageAlt: "Roasted half chicken with crisp skin and herb butter glaze",
  },
  {
    id: "item-3",
    name: "Artisanal Michigan Cider (750ml)",
    price: 14,
    quantity: 2,
    variant: "Chilled bottle • $14 each",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=400&auto=format&fit=crop",
    imageAlt: "Bottle of chilled artisanal Michigan cider with glassware",
  },
];

export const CHEF_RECOMMENDATION: CartRecommendation = {
  id: "item-rec-1",
  name: "Artisanal Honey Panna Cotta",
  price: 8,
  description: "+$8 (Special seasonal dessert pairing)",
};

export const SAVED_ADDRESSES: DeliveryAddress[] = [
  {
    id: "addr-home",
    type: "home",
    label: "Home",
    street: "2100 Michigan Avenue",
    apartment: "Apt 4B (Corktown)",
    floor: "4th Floor / Elevator 2",
    instructions: "Leave at reception or ring front bell once.",
    isDefault: true,
  },
  {
    id: "addr-office",
    type: "office",
    label: "Office",
    street: "100 Woodward Avenue",
    apartment: "Suite 902 (Downtown)",
    floor: "9th Floor",
    instructions: "Call on arrival; drop at building security desk.",
    isDefault: false,
  },
];

export const DEFAULT_CONTACT: CustomerContact = {
  fullName: "David Miller",
  phone: "(313) 555-0142",
  email: "david.miller@example.com",
};
