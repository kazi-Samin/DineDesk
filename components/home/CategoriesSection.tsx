"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const EXPANDED_CATEGORIES = [
  {
    id: "cat-italian",
    title: "Italian Artisan",
    subtitle: "Woodfired Neapolitan & Burrata",
    tagline: "Authentic Rome & Naples",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop",
    categoryFilter: "italian",
    avgTime: "25–30 mins",
    featuredDish: "Truffle Prosciutto Pizza",
    rating: "4.9 ★",
    description: "Hand-stretched artisan dough baked in authentic woodfired stone ovens with imported Italian San Marzano tomatoes and creamy fresh burrata cheese."
  },
  {
    id: "cat-burger",
    title: "American Smash",
    subtitle: "Double Smashed & Brioche",
    tagline: "Juicy Signature Patties",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop",
    categoryFilter: "burger",
    avgTime: "20–25 mins",
    featuredDish: "Bacon Cheddar Melt",
    rating: "4.8 ★",
    description: "Crispy-edged double smashed beef patties layered with aged sharp cheddar, caramelized onions, and signature secret sauce on toasted buttered brioche."
  },
  {
    id: "cat-japanese",
    title: "Japanese Raw",
    subtitle: "Maki, Nigiri & Sashimi",
    tagline: "Fresh Ocean Catch",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=800&auto=format&fit=crop",
    categoryFilter: "sushi",
    avgTime: "30–35 mins",
    featuredDish: "Dragon Roll & Salmon Nigiri",
    rating: "4.9 ★",
    description: "Immaculately fresh Atlantic salmon and yellowtail prepared daily by master sushi chefs, served with authentic Wasabi and premium Koshihikari rice."
  },
  {
    id: "cat-european",
    title: "European Bistro",
    subtitle: "Steak Frites & Confit",
    tagline: "Continental Mastery",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop",
    categoryFilter: "european",
    avgTime: "35–40 mins",
    featuredDish: "Ribeye with Herb Butter",
    rating: "4.8 ★",
    description: "Classic continental gastronomy featuring tender prime ribeye steaks, duck confit, and artisanal truffle fries prepared to perfection."
  },
  {
    id: "cat-mexican",
    title: "Mexican Fiesta",
    subtitle: "Birria Tacos & Guacamole",
    tagline: "Vibrant Street Flavors",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=800&auto=format&fit=crop",
    categoryFilter: "mexican",
    avgTime: "20–25 mins",
    featuredDish: "Crispy Birria Quesatacos",
    rating: "4.7 ★",
    description: "Slow-braised tender beef folded into crispy corn tortillas dipped in rich chili consome, topped with fresh cilantro, onions, and melted Oaxaca cheese."
  },
  {
    id: "cat-desi",
    title: "Subcontinental Desi",
    subtitle: "Kacchi, Tehari, Bhorta & Naan",
    tagline: "Heritage Spice Traditions",
    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=800&auto=format&fit=crop",
    categoryFilter: "desi",
    avgTime: "25–35 mins",
    featuredDish: "Special Mutton Kacchi Biryani",
    rating: "4.9 ★",
    description: "Traditional slow-cooked aromatic Chinigura rice layered with tender mutton shank, potatoes, saffron, and authentic dhakai spices sealed in clay pots."
  },
  {
    id: "cat-chinese",
    title: "Wok Heritage",
    subtitle: "Wok Noodles & Dim Sum",
    tagline: "Cantonese & Sichuan",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=800&auto=format&fit=crop",
    categoryFilter: "chinese",
    avgTime: "20–30 mins",
    featuredDish: "Prawn Har Gow & Chili Wontons",
    rating: "4.8 ★",
    description: "High-heat wok tossed noodles, translucent steamed prawn dim sum dumplings, and fiery Sichuan peppercorn specialties."
  },
  {
    id: "cat-dessert",
    title: "Sweet Finish",
    subtitle: "Mishti Doi, Tartlets & Cake",
    tagline: "Artisanal Confectionery",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=800&auto=format&fit=crop",
    categoryFilter: "desserts",
    avgTime: "15–20 mins",
    featuredDish: "Molten Lava Chocolate Cake",
    rating: "4.9 ★",
    description: "Heavenly artisanal desserts combining traditional Bengali clay-pot mishti doi with decadent Belgian chocolate molten cakes and fruit tartlets."
  }
];

export default function CategoriesSection() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<typeof EXPANDED_CATEGORIES[0] | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section className="w-full py-20 bg-surface-container-low overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 mb-12">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <span className="text-xs text-secondary uppercase tracking-widest font-bold">
            Global Cuisines &amp; Specialties
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-primary tracking-tight mt-1">
            Browse by Cuisine &amp; Culture
          </h2>
          <p className="text-sm text-on-surface-variant mt-2">
            Hover to pause and explore world-class culinary traditions. Click any card to view detailed highlights.
          </p>
        </div>
      </div>

      {/* Infinite Marquee Scrolling Track with Pause on Hover */}
      <div className="relative w-full overflow-hidden py-4">
        {/* Gradient Fade Edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-surface-container-low to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-surface-container-low to-transparent z-20 pointer-events-none" />

        <motion.div
          className="flex gap-6 w-max px-6 cursor-pointer"
          animate={{ x: isPaused ? "0%" : ["0%", "-50%"] }}
          transition={
            isPaused
              ? { duration: 0 }
              : { repeat: Infinity, duration: 35, ease: "linear" }
          }
        >
          {/* Duplicate array for seamless infinite marquee loop */}
          {[...EXPANDED_CATEGORIES, ...EXPANDED_CATEGORIES].map((category, index) => (
            <motion.div
              key={`${category.id}-${index}`}
              onHoverStart={() => setIsPaused(true)}
              onHoverEnd={() => setIsPaused(false)}
              onClick={() => setSelectedCategory(category)}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative w-72 h-80 rounded-3xl overflow-hidden shadow-xl border border-outline-variant/60 flex flex-col justify-end p-6 group bg-surface-container"
            >
              {/* Background Image with Zoom */}
              <div className="absolute inset-0">
                <img
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  alt={category.subtitle}
                  src={category.image}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/40 to-transparent" />
              </div>

              {/* Top Floating Rating & Time Pill */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
                <span className="text-[10px] font-bold text-on-primary bg-primary/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                  {category.rating}
                </span>
                <span className="text-[10px] font-bold text-secondary-fixed bg-secondary/90 backdrop-blur-md px-2.5 py-1 rounded-full">
                  {category.avgTime}
                </span>
              </div>

              {/* Content & Hover Info */}
              <div className="relative z-10 text-on-primary flex flex-col gap-1 pointer-events-none">
                <span className="text-[10px] font-extrabold text-[#f7dfd6] uppercase tracking-wider">
                  {category.tagline}
                </span>
                <h3 className="font-heading font-bold text-xl text-on-primary">
                  {category.title}
                </h3>
                <p className="text-xs text-on-primary/80 font-medium">
                  {category.subtitle}
                </p>

                {/* Expanded Details on Hover */}
                <div className="overflow-hidden pt-2 border-t border-white/20 mt-1">
                  <p className="text-[11px] text-[#f7dfd6] font-semibold">
                    🔥 Must Try: <span className="text-white font-normal">{category.featuredDish}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Interactive Details Modal Pop-Up */}
      <AnimatePresence>
        {selectedCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-lg bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden border border-outline-variant"
            >
              {/* Modal Banner Image */}
              <div className="relative h-56 w-full">
                <img
                  src={selectedCategory.image}
                  alt={selectedCategory.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent" />

                <button
                  onClick={() => setSelectedCategory(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center text-on-surface hover:bg-surface-container-lowest transition-colors shadow-md cursor-pointer"
                  aria-label="Close modal"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>

                <div className="absolute bottom-4 left-6 right-6 text-on-primary">
                  <span className="text-[10px] font-extrabold text-[#f7dfd6] uppercase tracking-wider">
                    {selectedCategory.tagline}
                  </span>
                  <h3 className="font-heading font-bold text-2xl text-on-primary">
                    {selectedCategory.title}
                  </h3>
                  <p className="text-xs text-on-primary/80 font-medium">
                    {selectedCategory.subtitle}
                  </p>
                </div>
              </div>

              {/* Modal Body Content */}
              <div className="p-6 flex flex-col gap-4">
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {selectedCategory.description}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-outline-variant/60">
                  <div className="p-3 bg-surface-container rounded-2xl">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase">Average Prep Time</p>
                    <p className="text-xs font-bold text-primary mt-0.5">{selectedCategory.avgTime}</p>
                  </div>
                  <div className="p-3 bg-surface-container rounded-2xl">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase">Average Rating</p>
                    <p className="text-xs font-bold text-secondary mt-0.5">{selectedCategory.rating}</p>
                  </div>
                </div>

                <div className="p-3.5 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-primary uppercase">Chef&apos;s Signature Dish</p>
                    <p className="text-xs font-semibold text-on-surface mt-0.5">{selectedCategory.featuredDish}</p>
                  </div>
                  <span className="material-symbols-outlined text-primary text-xl">restaurant_menu</span>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="flex-1 py-3 bg-surface-container text-on-surface rounded-2xl text-xs font-semibold hover:bg-surface-container-high transition-colors cursor-pointer"
                  >
                    Close Preview
                  </button>
                  <button
                    onClick={() => {
                      const filter = selectedCategory.categoryFilter;
                      setSelectedCategory(null);
                      router.push(`/explore?cuisine=${filter}`);
                    }}
                    className="flex-1 py-3 bg-primary text-on-primary rounded-2xl text-xs font-semibold hover:bg-primary/90 transition-colors shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Browse Kitchens</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}