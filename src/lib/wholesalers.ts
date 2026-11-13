import { StoreCategory } from "./categories";
import { rtdb } from "./firebase";
import { ref as rtdbRef, get as rtdbGet, set as rtdbSet, update as rtdbUpdate } from "firebase/database";

export interface WholesalerPriceTier {
  minQty: number;
  price: number;
}

export interface WholesalerProduct {
  id: string;
  sku: string;
  name: string;
  nameAr: string;
  imageUrl?: string;
  category: StoreCategory;
  basePrice: number;
  msrp: number;
  moq: number;
  unit: "piece" | "pack" | "carton";
  tiers: WholesalerPriceTier[];
  stock: number;
  status: "active" | "paused";
  updatedAt: string;
}

export interface WholesalerContact {
  email: string;
  phone: string;
  whatsapp: string;
}

export interface WholesalerProfile {
  name: string;
  nameAr: string;
  logoUrl?: string;
  description?: string;
  descriptionAr?: string;
  categories: StoreCategory[];
  country: string;
  city: string;
  contact: WholesalerContact;
  minOrderValue: number;
  currency: string;
  status: "active" | "paused";
  createdAt: string;
}

export interface Wholesaler {
  id: string;
  profile: WholesalerProfile;
  products: Record<string, WholesalerProduct>;
}

export interface WholesalerInquiry {
  id: string;
  storeId: string;
  wholesalerId: string;
  productId: string;
  sku: string;
  qty: number;
  offeredPrice: number;
  note?: string;
  createdAt: string;
  status: "new" | "quoted" | "accepted" | "declined";
}

// Canonical Seed Wholesalers matching the working example
export const SEED_WHOLESALERS: Wholesaler[] = [
  {
    id: "wholesaler_clothing_01",
    profile: {
      name: "Nile Garments & Textiles",
      nameAr: "شركة النيل للملابس والمنسوجات",
      logoUrl: "",
      description: "Direct manufacturer & bulk distributor of premium Egyptian cotton apparel.",
      descriptionAr: "المصنّع والموزع المباشر للملابس القطنية المصرية الفاخرة وتجارة الجملة.",
      categories: ["clothing"],
      country: "Egypt",
      city: "Cairo",
      contact: {
        email: "wholesale@nilegarments.eg",
        phone: "+201011112222",
        whatsapp: "+201011112222",
      },
      minOrderValue: 2500,
      currency: "EGP",
      status: "active",
      createdAt: "2026-01-15T09:00:00Z",
    },
    products: {
      prod_cloth_01: {
        id: "prod_cloth_01",
        sku: "NGT-TEE-01",
        name: "Premium Combed Cotton Crew Neck T-Shirt",
        nameAr: "تيشيرت قطن كومباكت فاخر ياقة دائرية",
        category: "clothing",
        basePrice: 180,
        msrp: 320,
        moq: 12,
        unit: "piece",
        tiers: [
          { minQty: 12, price: 170 },
          { minQty: 50, price: 155 },
          { minQty: 100, price: 135 },
        ],
        stock: 1200,
        status: "active",
        updatedAt: "2026-03-01T12:00:00Z",
      },
      prod_cloth_02: {
        id: "prod_cloth_02",
        sku: "NGT-HOOD-02",
        name: "Heavyweight Brushed Fleece Hoodie",
        nameAr: "سويت شيرت هودي صوف ثقيل مبطن",
        category: "clothing",
        basePrice: 420,
        msrp: 750,
        moq: 10,
        unit: "piece",
        tiers: [
          { minQty: 10, price: 400 },
          { minQty: 40, price: 370 },
          { minQty: 100, price: 330 },
        ],
        stock: 650,
        status: "active",
        updatedAt: "2026-03-01T12:00:00Z",
      },
    },
  },
  {
    id: "wholesaler_home_01",
    profile: {
      name: "Delta Electro-Home Appliances",
      nameAr: "شركة دلتا للأجهزة المنزلية والكهربائية",
      logoUrl: "",
      description: "Official factory distributor of modern smart kitchen and household appliances.",
      descriptionAr: "الموزع المعتمد من المصنع لأجهزة المطبخ الذكية والأجهزة المنزلية الحديثة.",
      categories: ["home-appliances"],
      country: "Egypt",
      city: "Giza",
      contact: {
        email: "supply@delta-home.eg",
        phone: "+201099998888",
        whatsapp: "+201099998888",
      },
      minOrderValue: 5000,
      currency: "EGP",
      status: "active",
      createdAt: "2026-01-20T11:00:00Z",
    },
    products: {
      prod_home_01: {
        id: "prod_home_01",
        sku: "DHA-AIR-01",
        name: "Rapid Vortex Digital Air Fryer 6.5L",
        nameAr: "قلاية هوائية رقمية سريعة سعة 6.5 لتر",
        category: "home-appliances",
        basePrice: 2200,
        msrp: 3400,
        moq: 5,
        unit: "piece",
        tiers: [
          { minQty: 5, price: 2100 },
          { minQty: 20, price: 1950 },
          { minQty: 50, price: 1800 },
        ],
        stock: 140,
        status: "active",
        updatedAt: "2026-03-02T14:30:00Z",
      },
      prod_home_02: {
        id: "prod_home_02",
        sku: "DHA-BLND-02",
        name: "Pro-Crush Multi-Blade Blender 1200W",
        nameAr: "خلاط كهربائي عالي القوة متعدد الشفرات 1200 واط",
        category: "home-appliances",
        basePrice: 850,
        msrp: 1450,
        moq: 6,
        unit: "piece",
        tiers: [
          { minQty: 6, price: 810 },
          { minQty: 24, price: 760 },
          { minQty: 60, price: 710 },
        ],
        stock: 320,
        status: "active",
        updatedAt: "2026-03-02T14:30:00Z",
      },
    },
  },
];

const LOCAL_STORAGE_WHOLESALERS_KEY = "matager_wholesalers_v1";
const LOCAL_STORAGE_INQUIRIES_KEY = "matager_wholesaler_inquiries_v1";

/**
 * Filter wholesalers for a specific store.
 * Core Invariant:
 * A store sees a wholesaler iff stores/{storeId}/category in wholesalers/{wid}/profile/categories
 * OR stores/{storeId}/linkedWholesalers/{wid} === true (allow-list override).
 */
export function getVisibleWholesalers(
  storeId: string,
  storeCategory: StoreCategory | string | undefined,
  all: Wholesaler[],
  linkedWholesalers?: Record<string, boolean>
): Wholesaler[] {
  if (!all || all.length === 0) return [];
  return all.filter((w) => {
    // 1. Check linkedWholesalers allow-list override
    if (linkedWholesalers && linkedWholesalers[w.id]) {
      return true;
    }
    // 2. Check store category match
    if (!storeCategory) return false;
    const cats = w.profile?.categories || [];
    return cats.includes(storeCategory as StoreCategory);
  });
}

/**
 * Computes price based on tiered quantity breaks
 */
export function computeTierPrice(product: WholesalerProduct, qty: number): number {
  if (!product.tiers || product.tiers.length === 0) {
    return product.basePrice;
  }
  // Sort tiers ascending by minQty
  const sorted = [...product.tiers].sort((a, b) => a.minQty - b.minQty);
  let applicablePrice = product.basePrice;

  for (const tier of sorted) {
    if (qty >= tier.minQty) {
      applicablePrice = tier.price;
    }
  }
  return applicablePrice;
}

/**
 * Validates volume tier ladder:
 * - minQty must be strictly ascending
 * - price must be strictly descending
 */
export function validateTiers(tiers: WholesalerPriceTier[]): { valid: boolean; error?: string } {
  for (let i = 0; i < tiers.length; i++) {
    const t = tiers[i];
    if (t.minQty <= 0) return { valid: false, error: "Quantity must be greater than 0" };
    if (t.price <= 0) return { valid: false, error: "Price must be greater than 0" };

    if (i > 0) {
      const prev = tiers[i - 1];
      if (t.minQty <= prev.minQty) {
        return { valid: false, error: "Quantities must be strictly ascending (each tier > previous)" };
      }
      if (t.price >= prev.price) {
        return { valid: false, error: "Prices must be strictly descending (higher volume = lower price)" };
      }
    }
  }
  return { valid: true };
}

/**
 * Fetches all wholesalers from RTDB with local storage and SEED fallback
 */
export async function getWholesalers(): Promise<Wholesaler[]> {
  try {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(LOCAL_STORAGE_WHOLESALERS_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    }

    if (rtdb) {
      const snapshot = await rtdbGet(rtdbRef(rtdb, "wholesalers"));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list: Wholesaler[] = Object.keys(data).map((key) => {
          const item = data[key];
          let cats = item.profile?.categories;
          if (cats && typeof cats === "object" && !Array.isArray(cats)) {
            cats = Object.values(cats);
          }
          return {
            id: key,
            profile: {
              ...item.profile,
              categories: cats || [],
            },
            products: item.products || {},
          };
        });
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_STORAGE_WHOLESALERS_KEY, JSON.stringify(list));
        }
        return list;
      }
    }
  } catch (err) {
    console.warn("RTDB wholesalers fetch fallback:", err);
  }

  // Fallback to seeds
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_WHOLESALERS_KEY, JSON.stringify(SEED_WHOLESALERS));
  }
  return SEED_WHOLESALERS;
}

export async function getWholesalerById(id: string): Promise<Wholesaler | null> {
  const all = await getWholesalers();
  return all.find((w) => w.id === id) || null;
}

export async function saveWholesaler(wholesaler: Wholesaler): Promise<void> {
  // Update local
  if (typeof window !== "undefined") {
    const all = await getWholesalers();
    const idx = all.findIndex((w) => w.id === wholesaler.id);
    if (idx >= 0) {
      all[idx] = wholesaler;
    } else {
      all.push(wholesaler);
    }
    localStorage.setItem(LOCAL_STORAGE_WHOLESALERS_KEY, JSON.stringify(all));
  }

  // Update RTDB
  try {
    if (rtdb) {
      // Store categories also as child keys so RTDB security rules .hasChild() functions correctly
      const catsObj: Record<string, boolean> = {};
      wholesaler.profile.categories.forEach((cat) => {
        catsObj[cat] = true;
      });

      await rtdbSet(rtdbRef(rtdb, `wholesalers/${wholesaler.id}/profile`), {
        ...wholesaler.profile,
        categories: {
          ...wholesaler.profile.categories,
          ...catsObj,
        },
      });
      await rtdbSet(rtdbRef(rtdb, `wholesalers/${wholesaler.id}/products`), wholesaler.products);
      await rtdbSet(rtdbRef(rtdb, `users/${wholesaler.id}/role`), "wholesaler");
    }
  } catch (err) {
    console.warn("Failed to persist wholesaler to RTDB:", err);
  }
}

export async function saveWholesalerProduct(
  wholesalerId: string,
  product: WholesalerProduct
): Promise<void> {
  const wholesaler = await getWholesalerById(wholesalerId);
  if (!wholesaler) return;

  wholesaler.products = wholesaler.products || {};
  wholesaler.products[product.id] = product;
  await saveWholesaler(wholesaler);
}

/**
 * Creates a wholesale quote inquiry from a store to a wholesaler
 */
export async function createWholesalerInquiry(
  inquiry: Omit<WholesalerInquiry, "id" | "createdAt" | "status">
): Promise<WholesalerInquiry> {
  const id = `inq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const record: WholesalerInquiry = {
    ...inquiry,
    id,
    createdAt: new Date().toISOString(),
    status: "new",
  };

  if (typeof window !== "undefined") {
    const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_INQUIRIES_KEY) || "[]");
    existing.push(record);
    localStorage.setItem(LOCAL_STORAGE_INQUIRIES_KEY, JSON.stringify(existing));
  }

  try {
    if (rtdb) {
      await rtdbSet(rtdbRef(rtdb, `wholesalerInquiries/${id}`), record);
    }
  } catch (err) {
    console.warn("RTDB inquiry write fallback:", err);
  }

  return record;
}

export async function getWholesalerInquiries(wholesalerId: string): Promise<WholesalerInquiry[]> {
  let list: WholesalerInquiry[] = [];
  try {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(LOCAL_STORAGE_INQUIRIES_KEY);
      if (stored) {
        list = JSON.parse(stored);
      }
    }
    if (rtdb) {
      const snapshot = await rtdbGet(rtdbRef(rtdb, "wholesalerInquiries"));
      if (snapshot.exists()) {
        const data = snapshot.val();
        list = Object.values(data);
      }
    }
  } catch (err) {
    console.warn("Error fetching inquiries:", err);
  }

  // Filter for this wholesaler
  return list.filter((inq) => inq.wholesalerId === wholesalerId);
}

export async function updateInquiryStatus(
  inquiryId: string,
  status: WholesalerInquiry["status"]
): Promise<void> {
  if (typeof window !== "undefined") {
    const list: WholesalerInquiry[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_INQUIRIES_KEY) || "[]");
    const item = list.find((x) => x.id === inquiryId);
    if (item) {
      item.status = status;
      localStorage.setItem(LOCAL_STORAGE_INQUIRIES_KEY, JSON.stringify(list));
    }
  }

  try {
    if (rtdb) {
      await rtdbUpdate(rtdbRef(rtdb, `wholesalerInquiries/${inquiryId}`), { status });
    }
  } catch (err) {
    console.warn("RTDB update inquiry status fallback:", err);
  }
}

