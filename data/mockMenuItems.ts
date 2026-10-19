import { MenuItem } from "@/types/menu";

export const SEED_MENU_ITEMS: MenuItem[] = [
  // 1. Special Mutton Kacchi Biryani (Full)
  {
    id: "item-1",
    restaurantId: "the-maple-and-vine",
    name: "Special Mutton Kacchi Biryani (Full)",
    description:
      "Slow-cooked tender baby mutton layers with pure ghee basmati, saffron, and shahi spices.",
    category: "Heritage Mains",
    price: 650,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAnJqvvt5EBgy4uJqz-HLn3H7c9Tly3PZYiCMVF8Jhfym9_phUBe7AiCQOpS3zFaR0YJxosB1D5X4FAVajRn-BgNUDoPfuRVIaEZRAXu_HGbnkYcMmqp89wStKLIEoyOjxwd_i53pPEVpOve-casivoYnEcs3WBo-EnPV8noYbjjjxKZZ_Qm47-y-Qx5WoqUHqsvduaAP7Yy4jGG5E9CE-9VKGQczjyh2OrpO2dLfWtjoGYiC1eP_j1BQ",
    imageAlt: "Steaming platter of authentic Bangladeshi mutton kacchi biryani",
    isAvailable: true,
    prepTime: "20 mins",
    dailySales: 42,
    marginPercent: 72.5,
    badge: "Chef Signature",
    tags: ["Halal", "100% Khasi Mutton", "Mild Spice"],
    dietary: {
      halal: true,
      chefRecommended: true,
      spicy: false,
      vegetarian: false,
      glutenFree: true,
    },
    isFeatured: true,
    createdAt: "2026-09-01T10:00:00Z",
    updatedAt: "2026-10-15T10:00:00Z",
  },

  // 2. Shahi Reshmi Kebab (4 pcs)
  {
    id: "item-2",
    restaurantId: "the-maple-and-vine",
    name: "Shahi Reshmi Kebab (4 pcs)",
    description:
      "Velvety chicken mince marinated with clotted malai, crushed cashew paste, and white pepper.",
    category: "Starters & Kebabs",
    price: 420,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCNU5Zt7DeIl9zbYugav403bJQz9qTHsZvCyQdngw-oOXSP-G9RDjeGRIn8WGntCAt2vvGDvJfWZ3QPiu_5TxIUMivU6QMWnsvueGaC3XACCqIhsjO7t9TjCFx7RWsK9XMuoDe86QwbcEYeqUqCtmPrAeui4iZNfQAeZzAO2-1CakYLb7pgrg7DnZppER8R1XxXp6cSpQAiMWRjjNsn-ATnMXZLKpZVgm3pTELXz9X5x5q37A6VZ-1pxg",
    imageAlt: "Skewered golden brown Shahi Reshmi Kebabs with fresh coriander and mint chutney",
    isAvailable: true,
    prepTime: "15 mins",
    dailySales: 28,
    marginPercent: 66.0,
    badge: "Tandoor Special",
    tags: ["Halal", "Creamy Texture"],
    dietary: {
      halal: true,
      chefRecommended: true,
      spicy: false,
      vegetarian: false,
      glutenFree: false,
    },
    isFeatured: true,
    createdAt: "2026-09-02T10:00:00Z",
    updatedAt: "2026-10-15T10:00:00Z",
  },

  // 3. Old Dhaka Beef Tehari
  {
    id: "item-3",
    restaurantId: "the-maple-and-vine",
    name: "Old Dhaka Beef Tehari",
    description:
      "Aromatic chinigura rice infused with pure cold-pressed mustard oil, green chilies, and soft beef chunks.",
    category: "Heritage Mains",
    price: 480,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDL1yWcv58t1o0McpN_7rgMIuSkaQVn-ygwICE1Kcb1msEsGYvfCPD1BP9ORfyTnpHrOiCxyhk0B4dUIr4Kpm23_PLY4QsNsYHvjye6-Ra6hqpBO29274q3gU5BmYhOgrN1qWsweJcetVlb1QFBWwg6rP3SfQx07EYh7FERtDlNW3sKVeKm2Fhs8WSNmAI_rnMliZquHOW38jhwVCkQ2rj537HrcYepCDIARiCgXkJlwXQTgSZu8jl_iw",
    imageAlt: "Traditional Old Dhaka beef tehari rice plate with mustard oil aroma and beresta onions",
    isAvailable: true,
    prepTime: "15 mins",
    dailySales: 36,
    marginPercent: 69.2,
    tags: ["Halal", "Spicy"],
    dietary: {
      halal: true,
      chefRecommended: false,
      spicy: true,
      vegetarian: false,
      glutenFree: true,
    },
    isFeatured: true,
    createdAt: "2026-09-03T10:00:00Z",
    updatedAt: "2026-10-15T10:00:00Z",
  },

  // 4. Chicken Roast with Saffron Polao
  {
    id: "item-4",
    restaurantId: "the-maple-and-vine",
    name: "Chicken Roast with Saffron Polao",
    description:
      "Classic Biye Bari style whole quarter leg braised in yogurt, poppy seeds, and golden fried onions.",
    category: "Heritage Mains",
    price: 520,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDyqiKymR9nzVdkrrPHgdv8_jjn6jxBnHo3LBcOh-eJUshWtObIQqokugr0L1tFEGdOmjhfRaIsEr1qU6PjET4mo728H9XJHXovb1uJMiN4IEA4JULT-tio4mkCTCwTte3o58pIspxZotRL2j9ZzW6j1iaS4HpN7yBS1QQUNtYW0f36qbYOKnbZdr1D461zZ7NKahXjThM5Tdv1TD68ArZgunboTWuF5-XQQeyvy7-BrwRRABq8Bd5TGQ",
    imageAlt: "Bengali wedding feast style chicken roast in thick gravy beside yellow saffron polao",
    isAvailable: true,
    prepTime: "25 mins",
    dailySales: 19,
    marginPercent: 64.5,
    tags: ["Halal", "Traditional"],
    dietary: {
      halal: true,
      chefRecommended: false,
      spicy: false,
      vegetarian: false,
      glutenFree: false,
    },
    isFeatured: false,
    createdAt: "2026-09-04T10:00:00Z",
    updatedAt: "2026-10-15T10:00:00Z",
  },

  // 5. Dhakai Paneer Tikka
  {
    id: "item-5",
    restaurantId: "the-maple-and-vine",
    name: "Dhakai Paneer Tikka",
    description:
      "Fresh artisanal cottage cheese cubes roasted over live charcoal with bell peppers and roasted cumin.",
    category: "Starters & Kebabs",
    price: 380,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD-B2QY3leAqoYdN_g3dfsfHD8mShhuC9xS_6phQOE6E87eR9gHsbYIBGQ5Ss-t3qDnlYMPPl_oMLo8CRPN7hdQRkcAMj4d4xhKT7ubzZYhA_h5VKmId9dgUyG-iyVgBdj28t9Sj5FHjLMidqmnGGWIR6mvHIi40k0qM95OJFgfxqPDtWKKpQevOVrpH0t66zo4ZGFJYLZ878OwJQewyRhPqUZGx870GNOeIV0wBK-l9hb76oqhZ2XdpQ",
    imageAlt: "Clay oven roasted Dhakai paneer cubes with bell peppers and tandoori spices",
    isAvailable: true,
    prepTime: "15 mins",
    dailySales: 14,
    marginPercent: 61.0,
    tags: ["Vegetarian", "Clay Oven"],
    dietary: {
      halal: true,
      chefRecommended: false,
      spicy: false,
      vegetarian: true,
      glutenFree: true,
    },
    isFeatured: false,
    createdAt: "2026-09-05T10:00:00Z",
    updatedAt: "2026-10-15T10:00:00Z",
  },

  // 6. Traditional Mishti Doi in Clay Pot
  {
    id: "item-6",
    restaurantId: "the-maple-and-vine",
    name: "Traditional Mishti Doi in Clay Pot",
    description:
      "Authentic Bogra-style caramelized milk fermented slowly in unglazed terracotta cups.",
    category: "Desserts",
    price: 140,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDcmKzY7r5ZBGlIqstCEIfMxt8q61T1InMj5wQDDOauY7c0TTy0LW5fKR3MJWxXzc2Hv2PpGGuqB_0YxbYNDVn-DaPPrMKbv34dsjeUCEXcD4OvV0asT69loyJHo-s9ptl71URnO_iXRYaXGD2i9U5maGmDCKQXxsuugDtSWWwH5_cTqp6fQk-n7DBArr-OOwjYova3PG29agqNBogyh3YP_zCg6yYJARnYLDzGBvQyK5ozi2Oydcas8Q",
    imageAlt: "Terracotta clay pot filled with thick caramelized Mishti Doi sweet yogurt",
    isAvailable: true,
    prepTime: "5 mins",
    dailySales: 51,
    marginPercent: 78.0,
    tags: ["Artisanal Dairy", "Sweet"],
    dietary: {
      halal: true,
      chefRecommended: true,
      spicy: false,
      vegetarian: true,
      glutenFree: true,
    },
    isFeatured: true,
    createdAt: "2026-09-06T10:00:00Z",
    updatedAt: "2026-10-15T10:00:00Z",
  },

  // 7. Shahi Borhani (500ml)
  {
    id: "item-7",
    restaurantId: "the-maple-and-vine",
    name: "Shahi Borhani (500ml)",
    description:
      "Spiced digestive yogurt beverage infused with roasted cumin, black salt, and freshly extracted mint puree.",
    category: "Traditional Refreshers",
    price: 110,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCvNp1f908Vg5Y4fRG5XSejBYazIyKlRdcYBjHndYk4McQvK9iiwTAPYeE3Rh4iNDFipaLFTxfi0VUtnkCwAvJEl6JeLqLZn2man_NS-jKUgCeGF7yKruQCh_1lq_PGvY56-txq3Mq3xuTH151hCx0wH4FA7FvCDgKxzfBQNdBudSiL_gbus_ii2KjIcve9MOx9QBvXEhMliaqMuTLNNO2TVZsWrpyKi_GKML8IUQys74m8aZEsMTXNmA",
    imageAlt: "Chilled glass bottle of spicy savory Bengali Shahi Borhani yogurt drink",
    isAvailable: true,
    prepTime: "5 mins",
    dailySales: 64,
    marginPercent: 82.5,
    tags: ["Cold Beverage", "Digestive"],
    dietary: {
      halal: true,
      chefRecommended: false,
      spicy: false,
      vegetarian: true,
      glutenFree: true,
    },
    isFeatured: true,
    createdAt: "2026-09-07T10:00:00Z",
    updatedAt: "2026-10-15T10:00:00Z",
  },

  // 8. Mutton Galaouti with Mini Sheermal
  {
    id: "item-8",
    restaurantId: "the-maple-and-vine",
    name: "Mutton Galaouti with Mini Sheermal",
    description:
      "Melt-in-mouth smoked lamb patties prepared with papaya tenderizer and 32 aromatic herbs.",
    category: "Starters & Kebabs",
    price: 580,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC1ELt5SLrUoi-g2me7Oadg-5Eitd5_9PwfnuD_RercyFLJRcEzhwtueLP9S4g2xF8oM_SdtXWwdNVx45zZqH53SWiXa21G1OhR3NrbZGxvLFeCyI0wa5Iw14ctECQ--ThDg_W0Tqv-vk0iMJ4CHiU-YZtux9mYNB9GoZQhIptf5SQMFbpLV01WCvJRwPeI737dlGg-irLpQABzLDJq-0IY5eNJkdmf3G8EY0pntTsxtdNibyAMjxkBVA",
    imageAlt: "Mutton galouti kebab patties served on warm saffron-scented mini sheermal rounds",
    isAvailable: false,
    prepTime: "25 mins",
    dailySales: 22,
    marginPercent: 67.0,
    badge: "Sold Out",
    tags: ["Signature Kebab", "Smoked"],
    dietary: {
      halal: true,
      chefRecommended: true,
      spicy: false,
      vegetarian: false,
      glutenFree: false,
    },
    isFeatured: true,
    createdAt: "2026-09-08T10:00:00Z",
    updatedAt: "2026-10-15T10:00:00Z",
  },

  // 9. Saffron Zafrani Pulao with Tender Mutton Korma
  {
    id: "item-9",
    restaurantId: "the-maple-and-vine",
    name: "Saffron Zafrani Pulao with Tender Mutton Korma",
    description:
      "Fragrant long-grain aged basmati layered with tender baby goat cuts, dried prunes, saffron-infused milk, and fried golden onions.",
    category: "Heritage Mains",
    price: 590,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB_Z9C3mv7zEqS4eDmDyj8HS7FsG3HxvU6ybx-yrvbyn6Q18xREFL-q3wbYDyUUG8PtCI4NePuDtS1dlKlMBA165PDmfT_lNVT6k54sAhEeLQ_WFtv5BLfpVnQcD0lI5K-nwYfG8pd_AWA9kFhCkAuzLkVKy1kPuFFTQ-LdkhvD4Ege3B7EjKLZDcVkwZrrYW--jJJudT-BYU_rwAVg2iLqmAq06dgfCej8RWPZswPDCMe3dTW-ZmXHTQ",
    imageAlt: "Saffron Zafrani Pulao with roasted cashew garnish and rich mutton korma gravy",
    isAvailable: true,
    prepTime: "25 mins",
    dailySales: 31,
    marginPercent: 70.0,
    badge: "Chef Signature",
    tags: ["Halal", "Royal Special"],
    dietary: {
      halal: true,
      chefRecommended: true,
      spicy: false,
      vegetarian: false,
      glutenFree: false,
    },
    isFeatured: true,
    createdAt: "2026-09-09T10:00:00Z",
    updatedAt: "2026-10-15T10:00:00Z",
  },

  // 10. Chittagong Beef Kala Bhuna
  {
    id: "item-10",
    restaurantId: "the-maple-and-vine",
    name: "Chittagong Beef Kala Bhuna",
    description:
      "Slow-braised dark caramelized prime beef shoulder with roasted radhuni, fried shallots, and spicy mustard oil.",
    category: "Heritage Mains",
    price: 620,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAnJqvvt5EBgy4uJqz-HLn3H7c9Tly3PZYiCMVF8Jhfym9_phUBe7AiCQOpS3zFaR0YJxosB1D5X4FAVajRn-BgNUDoPfuRVIaEZRAXu_HGbnkYcMmqp89wStKLIEoyOjxwd_i53pPEVpOve-casivoYnEcs3WBo-EnPV8noYbjjjxKZZ_Qm47-y-Qx5WoqUHqsvduaAP7Yy4jGG5E9CE-9VKGQczjyh2OrpO2dLfWtjoGYiC1eP_j1BQ",
    imageAlt: "Chittagong traditional beef kala bhuna in cast iron kadai",
    isAvailable: true,
    prepTime: "20 mins",
    dailySales: 38,
    marginPercent: 71.5,
    badge: "Crowd Favorite",
    tags: ["Halal", "Spicy Special", "Traditional"],
    dietary: {
      halal: true,
      chefRecommended: true,
      spicy: true,
      vegetarian: false,
      glutenFree: true,
    },
    isFeatured: true,
    createdAt: "2026-09-10T10:00:00Z",
    updatedAt: "2026-10-15T10:00:00Z",
  },

  // 11. Traditional Shahi Morog Polao
  {
    id: "item-11",
    restaurantId: "the-maple-and-vine",
    name: "Traditional Shahi Morog Polao",
    description:
      "Country rooster braised gently in mawa and ghee-steamed chinigura rice, served with boiled spiced egg.",
    category: "Heritage Mains",
    price: 490,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDyqiKymR9nzVdkrrPHgdv8_jjn6jxBnHo3LBcOh-eJUshWtObIQqokugr0L1tFEGdOmjhfRaIsEr1qU6PjET4mo728H9XJHXovb1uJMiN4IEA4JULT-tio4mkCTCwTte3o58pIspxZotRL2j9ZzW6j1iaS4HpN7yBS1QQUNtYW0f36qbYOKnbZdr1D461zZ7NKahXjThM5Tdv1TD68ArZgunboTWuF5-XQQeyvy7-BrwRRABq8Bd5TGQ",
    imageAlt: "Shahi morog polao with whole desi chicken piece and golden beresta",
    isAvailable: true,
    prepTime: "20 mins",
    dailySales: 27,
    marginPercent: 65.0,
    tags: ["Halal", "Biye Bari Style"],
    dietary: {
      halal: true,
      chefRecommended: false,
      spicy: false,
      vegetarian: false,
      glutenFree: false,
    },
    isFeatured: false,
    createdAt: "2026-09-11T10:00:00Z",
    updatedAt: "2026-10-15T10:00:00Z",
  },

  // 12. Royal Murgh Musallam (Whole)
  {
    id: "item-12",
    restaurantId: "the-maple-and-vine",
    name: "Royal Murgh Musallam (Whole)",
    description:
      "Whole roasted spring chicken stuffed with spiced boiled eggs and minced meat, blanketed in rich almond-saffron gravy.",
    category: "Heritage Mains",
    price: 950,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDyqiKymR9nzVdkrrPHgdv8_jjn6jxBnHo3LBcOh-eJUshWtObIQqokugr0L1tFEGdOmjhfRaIsEr1qU6PjET4mo728H9XJHXovb1uJMiN4IEA4JULT-tio4mkCTCwTte3o58pIspxZotRL2j9ZzW6j1iaS4HpN7yBS1QQUNtYW0f36qbYOKnbZdr1D461zZ7NKahXjThM5Tdv1TD68ArZgunboTWuF5-XQQeyvy7-BrwRRABq8Bd5TGQ",
    imageAlt: "Whole roasted royal murgh musallam garnished with silver vark and almonds",
    isAvailable: true,
    prepTime: "40 mins",
    dailySales: 8,
    marginPercent: 74.0,
    badge: "Mughal Feast",
    tags: ["Halal", "Feast for 3-4"],
    dietary: {
      halal: true,
      chefRecommended: true,
      spicy: false,
      vegetarian: false,
      glutenFree: false,
    },
    isFeatured: true,
    createdAt: "2026-09-12T10:00:00Z",
    updatedAt: "2026-10-15T10:00:00Z",
  },

  // 13. Mutton Nalli Nihari with Roghani Naan
  {
    id: "item-13",
    restaurantId: "the-maple-and-vine",
    name: "Mutton Nalli Nihari with Roghani Naan",
    description:
      "12-hour simmered mutton shank stew with bone marrow, ginger juliennes, green chilies, and fresh tandoori roghani naan.",
    category: "Heritage Mains",
    price: 680,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAnJqvvt5EBgy4uJqz-HLn3H7c9Tly3PZYiCMVF8Jhfym9_phUBe7AiCQOpS3zFaR0YJxosB1D5X4FAVajRn-BgNUDoPfuRVIaEZRAXu_HGbnkYcMmqp89wStKLIEoyOjxwd_i53pPEVpOve-casivoYnEcs3WBo-EnPV8noYbjjjxKZZ_Qm47-y-Qx5WoqUHqsvduaAP7Yy4jGG5E9CE-9VKGQczjyh2OrpO2dLfWtjoGYiC1eP_j1BQ",
    imageAlt: "Slow cooked mutton nalli nihari in rich brown broth",
    isAvailable: true,
    prepTime: "15 mins",
    dailySales: 21,
    marginPercent: 68.5,
    tags: ["Halal", "Slow Cooked"],
    dietary: {
      halal: true,
      chefRecommended: false,
      spicy: true,
      vegetarian: false,
      glutenFree: false,
    },
    isFeatured: false,
    createdAt: "2026-09-13T10:00:00Z",
    updatedAt: "2026-10-15T10:00:00Z",
  },

  // 14. Hilsa Paturi in Banana Leaf
  {
    id: "item-14",
    restaurantId: "the-maple-and-vine",
    name: "Hilsa Paturi in Banana Leaf",
    description:
      "Padma River Ilish steak smothered in pungent yellow and black mustard paste with green chilies, steam-wrapped in banana leaf.",
    category: "Heritage Mains",
    price: 750,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDyqiKymR9nzVdkrrPHgdv8_jjn6jxBnHo3LBcOh-eJUshWtObIQqokugr0L1tFEGdOmjhfRaIsEr1qU6PjET4mo728H9XJHXovb1uJMiN4IEA4JULT-tio4mkCTCwTte3o58pIspxZotRL2j9ZzW6j1iaS4HpN7yBS1QQUNtYW0f36qbYOKnbZdr1D461zZ7NKahXjThM5Tdv1TD68ArZgunboTWuF5-XQQeyvy7-BrwRRABq8Bd5TGQ",
    imageAlt: "Steamed ilish paturi wrapped in char-grilled green banana leaf",
    isAvailable: true,
    prepTime: "25 mins",
    dailySales: 16,
    marginPercent: 65.0,
    badge: "Padma River Pride",
    tags: ["Traditional Fish", "Mustard Infused"],
    dietary: {
      halal: true,
      chefRecommended: true,
      spicy: true,
      vegetarian: false,
      glutenFree: true,
    },
    isFeatured: true,
    createdAt: "2026-09-14T10:00:00Z",
    updatedAt: "2026-10-15T10:00:00Z",
  },

  // 15. Boti Kebab Platter
  {
    id: "item-15",
    restaurantId: "the-maple-and-vine",
    name: "Boti Kebab Platter",
    description:
      "Charcoal-skewered spiced beef cubes marinated in raw papaya, toasted coriander, and hot smoked mustard glaze.",
    category: "Starters & Kebabs",
    price: 460,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCNU5Zt7DeIl9zbYugav403bJQz9qTHsZvCyQdngw-oOXSP-G9RDjeGRIn8WGntCAt2vvGDvJfWZ3QPiu_5TxIUMivU6QMWnsvueGaC3XACCqIhsjO7t9TjCFx7RWsK9XMuoDe86QwbcEYeqUqCtmPrAeui4iZNfQAeZzAO2-1CakYLb7pgrg7DnZppER8R1XxXp6cSpQAiMWRjjNsn-ATnMXZLKpZVgm3pTELXz9X5x5q37A6VZ-1pxg",
    imageAlt: "Hot sizzler plate of tender beef boti kebabs with lemon and onion rings",
    isAvailable: true,
    prepTime: "20 mins",
    dailySales: 25,
    marginPercent: 66.5,
    tags: ["Halal", "Smoky Charcoal"],
    dietary: {
      halal: true,
      chefRecommended: false,
      spicy: true,
      vegetarian: false,
      glutenFree: true,
    },
    isFeatured: false,
    createdAt: "2026-09-15T10:00:00Z",
    updatedAt: "2026-10-15T10:00:00Z",
  },

  // 16. Chicken Malai Tikka
  {
    id: "item-16",
    restaurantId: "the-maple-and-vine",
    name: "Chicken Malai Tikka (6 pcs)",
    description:
      "Boneless chicken breast pieces marinated in strained curd, cardamom, and fresh double cream, grilled in clay oven.",
    category: "Starters & Kebabs",
    price: 390,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCNU5Zt7DeIl9zbYugav403bJQz9qTHsZvCyQdngw-oOXSP-G9RDjeGRIn8WGntCAt2vvGDvJfWZ3QPiu_5TxIUMivU6QMWnsvueGaC3XACCqIhsjO7t9TjCFx7RWsK9XMuoDe86QwbcEYeqUqCtmPrAeui4iZNfQAeZzAO2-1CakYLb7pgrg7DnZppER8R1XxXp6cSpQAiMWRjjNsn-ATnMXZLKpZVgm3pTELXz9X5x5q37A6VZ-1pxg",
    imageAlt: "Juicy cream-coated chicken malai tikka with green mint dip",
    isAvailable: true,
    prepTime: "18 mins",
    dailySales: 34,
    marginPercent: 67.5,
    tags: ["Halal", "Mild & Creamy"],
    dietary: {
      halal: true,
      chefRecommended: false,
      spicy: false,
      vegetarian: false,
      glutenFree: true,
    },
    isFeatured: false,
    createdAt: "2026-09-16T10:00:00Z",
    updatedAt: "2026-10-15T10:00:00Z",
  },

  // 17. Sheekh Kebab Supreme
  {
    id: "item-17",
    restaurantId: "the-maple-and-vine",
    name: "Sheekh Kebab Supreme (3 Skewers)",
    description:
      "Minced mutton and beef blend seasoned with crushed pomegranate seeds, fresh mint, and garam masala on iron skewers.",
    category: "Starters & Kebabs",
    price: 450,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCNU5Zt7DeIl9zbYugav403bJQz9qTHsZvCyQdngw-oOXSP-G9RDjeGRIn8WGntCAt2vvGDvJfWZ3QPiu_5TxIUMivU6QMWnsvueGaC3XACCqIhsjO7t9TjCFx7RWsK9XMuoDe86QwbcEYeqUqCtmPrAeui4iZNfQAeZzAO2-1CakYLb7pgrg7DnZppER8R1XxXp6cSpQAiMWRjjNsn-ATnMXZLKpZVgm3pTELXz9X5x5q37A6VZ-1pxg",
    imageAlt: "Skewered sheekh kebabs with mint chutney and laccha onions",
    isAvailable: true,
    prepTime: "20 mins",
    dailySales: 29,
    marginPercent: 65.5,
    tags: ["Halal", "Charcoal Grilled"],
    dietary: {
      halal: true,
      chefRecommended: false,
      spicy: true,
      vegetarian: false,
      glutenFree: true,
    },
    isFeatured: false,
    createdAt: "2026-09-17T10:00:00Z",
    updatedAt: "2026-10-15T10:00:00Z",
  },

  // 18. Shahi Firni in Earthen Bowl
  {
    id: "item-18",
    restaurantId: "the-maple-and-vine",
    name: "Shahi Firni in Earthen Bowl",
    description:
      "Slow-reduced ground aromatic chinigura rice pudding scented with kewra water, crushed green cardamom, and silver leaf.",
    category: "Desserts",
    price: 120,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDcmKzY7r5ZBGlIqstCEIfMxt8q61T1InMj5wQDDOauY7c0TTy0LW5fKR3MJWxXzc2Hv2PpGGuqB_0YxbYNDVn-DaPPrMKbv34dsjeUCEXcD4OvV0asT69loyJHo-s9ptl71URnO_iXRYaXGD2i9U5maGmDCKQXxsuugDtSWWwH5_cTqp6fQk-n7DBArr-OOwjYova3PG29agqNBogyh3YP_zCg6yYJARnYLDzGBvQyK5ozi2Oydcas8Q",
    imageAlt: "Chilled shahi firni in rustic clay bowl garnished with pistachios",
    isAvailable: true,
    prepTime: "5 mins",
    dailySales: 44,
    marginPercent: 77.0,
    tags: ["Traditional Sweet", "Clay Pot"],
    dietary: {
      halal: true,
      chefRecommended: false,
      spicy: false,
      vegetarian: true,
      glutenFree: true,
    },
    isFeatured: false,
    createdAt: "2026-09-18T10:00:00Z",
    updatedAt: "2026-10-15T10:00:00Z",
  },

  // 19. Malpua with Kheer Dipped (2 pcs)
  {
    id: "item-19",
    restaurantId: "the-maple-and-vine",
    name: "Malpua with Kheer Dipped (2 pcs)",
    description:
      "Crispy-edged deep fried sweet semolina pancakes soaked in saffron sugar syrup and dipped in thick creamy rabri.",
    category: "Desserts",
    price: 160,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDcmKzY7r5ZBGlIqstCEIfMxt8q61T1InMj5wQDDOauY7c0TTy0LW5fKR3MJWxXzc2Hv2PpGGuqB_0YxbYNDVn-DaPPrMKbv34dsjeUCEXcD4OvV0asT69loyJHo-s9ptl71URnO_iXRYaXGD2i9U5maGmDCKQXxsuugDtSWWwH5_cTqp6fQk-n7DBArr-OOwjYova3PG29agqNBogyh3YP_zCg6yYJARnYLDzGBvQyK5ozi2Oydcas8Q",
    imageAlt: "Warm malpua swimming in thickened rabri milk sauce",
    isAvailable: true,
    prepTime: "10 mins",
    dailySales: 18,
    marginPercent: 70.0,
    tags: ["Warm Dessert", "Artisanal"],
    dietary: {
      halal: true,
      chefRecommended: false,
      spicy: false,
      vegetarian: true,
      glutenFree: false,
    },
    isFeatured: false,
    createdAt: "2026-09-19T10:00:00Z",
    updatedAt: "2026-10-15T10:00:00Z",
  },

  // 20. Gulab Jamun with Rose Rabri
  {
    id: "item-20",
    restaurantId: "the-maple-and-vine",
    name: "Gulab Jamun with Rose Rabri",
    description:
      "Warm khoya dumplings stuffed with pistachios and soaked in rose water syrup, served on chilled malai rabri.",
    category: "Desserts",
    price: 150,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDcmKzY7r5ZBGlIqstCEIfMxt8q61T1InMj5wQDDOauY7c0TTy0LW5fKR3MJWxXzc2Hv2PpGGuqB_0YxbYNDVn-DaPPrMKbv34dsjeUCEXcD4OvV0asT69loyJHo-s9ptl71URnO_iXRYaXGD2i9U5maGmDCKQXxsuugDtSWWwH5_cTqp6fQk-n7DBArr-OOwjYova3PG29agqNBogyh3YP_zCg6yYJARnYLDzGBvQyK5ozi2Oydcas8Q",
    imageAlt: "Glossy brown gulab jamun in thick sweet cream bowl",
    isAvailable: true,
    prepTime: "5 mins",
    dailySales: 37,
    marginPercent: 73.0,
    tags: ["Classic Sweet"],
    dietary: {
      halal: true,
      chefRecommended: false,
      spicy: false,
      vegetarian: true,
      glutenFree: false,
    },
    isFeatured: false,
    createdAt: "2026-09-20T10:00:00Z",
    updatedAt: "2026-10-15T10:00:00Z",
  },

  // 21. Nawab's Special Falooda
  {
    id: "item-21",
    restaurantId: "the-maple-and-vine",
    name: "Nawab's Special Falooda",
    description:
      "Layered tall glass of chilled sweet rose milk, sabja basil seeds, handmade vermicelli, malai kulfi, and crushed pistachios.",
    category: "Traditional Refreshers",
    price: 220,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCvNp1f908Vg5Y4fRG5XSejBYazIyKlRdcYBjHndYk4McQvK9iiwTAPYeE3Rh4iNDFipaLFTxfi0VUtnkCwAvJEl6JeLqLZn2man_NS-jKUgCeGF7yKruQCh_1lq_PGvY56-txq3Mq3xuTH151hCx0wH4FA7FvCDgKxzfBQNdBudSiL_gbus_ii2KjIcve9MOx9QBvXEhMliaqMuTLNNO2TVZsWrpyKi_GKML8IUQys74m8aZEsMTXNmA",
    imageAlt: "Layered royal falooda with scoops of kulfi and ruby rose syrup",
    isAvailable: true,
    prepTime: "8 mins",
    dailySales: 48,
    marginPercent: 75.0,
    badge: "Summer Favorite",
    tags: ["Cold Dessert Drink", "Kulfi Topped"],
    dietary: {
      halal: true,
      chefRecommended: true,
      spicy: false,
      vegetarian: true,
      glutenFree: true,
    },
    isFeatured: true,
    createdAt: "2026-09-21T10:00:00Z",
    updatedAt: "2026-10-15T10:00:00Z",
  },

  // 22. Aam Panna Cooler
  {
    id: "item-22",
    restaurantId: "the-maple-and-vine",
    name: "Aam Panna Cooler",
    description:
      "Fire-roasted green raw mango cooler with fresh mint, rock salt, roasted cumin powder, and cracked ice.",
    category: "Traditional Refreshers",
    price: 130,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCvNp1f908Vg5Y4fRG5XSejBYazIyKlRdcYBjHndYk4McQvK9iiwTAPYeE3Rh4iNDFipaLFTxfi0VUtnkCwAvJEl6JeLqLZn2man_NS-jKUgCeGF7yKruQCh_1lq_PGvY56-txq3Mq3xuTH151hCx0wH4FA7FvCDgKxzfBQNdBudSiL_gbus_ii2KjIcve9MOx9QBvXEhMliaqMuTLNNO2TVZsWrpyKi_GKML8IUQys74m8aZEsMTXNmA",
    imageAlt: "Chilled tangy green aam panna drink with mint sprig",
    isAvailable: true,
    prepTime: "5 mins",
    dailySales: 26,
    marginPercent: 80.0,
    tags: ["Tangy & Refreshing", "Raw Mango"],
    dietary: {
      halal: true,
      chefRecommended: false,
      spicy: false,
      vegetarian: true,
      glutenFree: true,
    },
    isFeatured: false,
    createdAt: "2026-09-22T10:00:00Z",
    updatedAt: "2026-10-15T10:00:00Z",
  },

  // 23. Royal Heritage Tasting Platter
  {
    id: "item-23",
    restaurantId: "the-maple-and-vine",
    name: "Royal Heritage Tasting Platter",
    description:
      "A majestic sampler feast: mini portions of Mutton Kacchi Biryani, Beef Tehari, Shahi Reshmi Kebab, Chicken Roast, Borhani, and Mishti Doi.",
    category: "Chef's Tasting Sets",
    price: 1450,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAnJqvvt5EBgy4uJqz-HLn3H7c9Tly3PZYiCMVF8Jhfym9_phUBe7AiCQOpS3zFaR0YJxosB1D5X4FAVajRn-BgNUDoPfuRVIaEZRAXu_HGbnkYcMmqp89wStKLIEoyOjxwd_i53pPEVpOve-casivoYnEcs3WBo-EnPV8noYbjjjxKZZ_Qm47-y-Qx5WoqUHqsvduaAP7Yy4jGG5E9CE-9VKGQczjyh2OrpO2dLfWtjoGYiC1eP_j1BQ",
    imageAlt: "Grand brass thali loaded with signature Bangladeshi dishes and kebabs",
    isAvailable: true,
    prepTime: "30 mins",
    dailySales: 15,
    marginPercent: 71.0,
    badge: "Grand Sampler",
    tags: ["Feast for 2", "Curated Selection"],
    dietary: {
      halal: true,
      chefRecommended: true,
      spicy: false,
      vegetarian: false,
      glutenFree: false,
    },
    isFeatured: true,
    createdAt: "2026-09-23T10:00:00Z",
    updatedAt: "2026-10-15T10:00:00Z",
  },

  // 24. Maple & Vine 5-Course Tasting Experience
  {
    id: "item-24",
    restaurantId: "the-maple-and-vine",
    name: "Maple & Vine 5-Course Tasting Experience",
    description:
      "Executive Chef's bespoke 5-course seasonal tasting menu: Seared Scallops, Heritage Dry-Aged Ribeye, Truffle Risotto, and Artisanal Desserts.",
    category: "Chef's Tasting Sets",
    price: 125,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDyqiKymR9nzVdkrrPHgdv8_jjn6jxBnHo3LBcOh-eJUshWtObIQqokugr0L1tFEGdOmjhfRaIsEr1qU6PjET4mo728H9XJHXovb1uJMiN4IEA4JULT-tio4mkCTCwTte3o58pIspxZotRL2j9ZzW6j1iaS4HpN7yBS1QQUNtYW0f36qbYOKnbZdr1D461zZ7NKahXjThM5Tdv1TD68ArZgunboTWuF5-XQQeyvy7-BrwRRABq8Bd5TGQ",
    imageAlt: "Opulent 5-course imperial tasting menu banquet arrangement",
    isAvailable: true,
    prepTime: "45 mins",
    dailySales: 9,
    marginPercent: 73.5,
    badge: "Signature Tasting Set",
    tags: ["5-Course Banquet", "VIP Experience"],
    dietary: {
      halal: true,
      chefRecommended: true,
      spicy: false,
      vegetarian: false,
      glutenFree: false,
    },
    isFeatured: true,
    createdAt: "2026-09-24T10:00:00Z",
    updatedAt: "2026-10-15T10:00:00Z",
  },
];
