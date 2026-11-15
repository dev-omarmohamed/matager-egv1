export const STORE_CATEGORIES = [
  "clothing",
  "home-appliances",
  "electronics",
  "beauty",
  "vape-tobacco",
  "jewelry",
  "3d-works",
  "food-ordering",
  "food-beverage",
  "general-retail",
  "services",
] as const;

export type StoreCategory = typeof STORE_CATEGORIES[number];

export const CATEGORY_LABELS: Record<StoreCategory, { en: string; ar: string }> = {
  clothing:          { en: "Clothing & Fashion",         ar: "الملابس والأزياء" },
  "home-appliances": { en: "Home Appliances",            ar: "الأجهزة المنزلية" },
  electronics:       { en: "Electronics",                ar: "الإلكترونيات" },
  beauty:            { en: "Health & Beauty",            ar: "الصحة والجمال" },
  "vape-tobacco":    { en: "Vape, E-Liquid & Tobacco",   ar: "فيب، سوائل إلكترونية وتبغ" },
  jewelry:           { en: "Jewelry & Accessories",      ar: "المجوهرات والإكسسوارات" },
  "3d-works":        { en: "3D Works (Files or Products)", ar: "أعمال وتصاميم 3D (ملفات أو منتجات)" },
  "food-ordering":   { en: "Food & Restaurant Ordering",  ar: "أطعمة ومطاعم وطلبات طعام" },
  "food-beverage":   { en: "Food & Beverage",            ar: "الأغذية والمشروبات العامة" },
  "general-retail":  { en: "General Retail",             ar: "تجزئة عامة" },
  services:          { en: "Services",                   ar: "الخدمات" },
};
