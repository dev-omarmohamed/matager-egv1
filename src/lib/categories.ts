export const STORE_CATEGORIES = [
  "clothing",
  "home-appliances",
  "electronics",
  "beauty",
  "food-beverage",
  "general-retail",
  "services",
] as const;

export type StoreCategory = typeof STORE_CATEGORIES[number];

export const CATEGORY_LABELS: Record<StoreCategory, { en: string; ar: string }> = {
  clothing:          { en: "Clothing & Fashion", ar: "الملابس والأزياء" },
  "home-appliances": { en: "Home Appliances",    ar: "الأجهزة المنزلية" },
  electronics:       { en: "Electronics",        ar: "الإلكترونيات" },
  beauty:            { en: "Health & Beauty",    ar: "الصحة والجمال" },
  "food-beverage":   { en: "Food & Beverage",    ar: "الأغذية والمشروبات" },
  "general-retail":  { en: "General Retail",     ar: "تجزئة عامة" },
  services:          { en: "Services",           ar: "الخدمات" },
};

