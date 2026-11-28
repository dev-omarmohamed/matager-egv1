"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useDash } from "@/lib/useDash";
import { rtdb } from "@/lib/firebase";
import { getApp } from "firebase/app";
import {
  getDatabase,
  ref as rtdbRef,
  get as rtdbGet,
  set as rtdbSet,
} from "firebase/database";
import {
  inputCls,
  btnPrimary,
  btnGhost,
  btnIconDanger,
  eyebrow,
} from "./ui/styles";

import categoryTree from "@/data/categories.json";

const CATALOG_META = (categoryTree as any) || {};
const RTDB_URL: string =
  CATALOG_META?.defaults?.rtdbUrl ||
  "https://matager-egv01-default-rtdb.europe-west1.firebasedatabase.app";
const DEFAULT_STORE_OWNER_UID: string =
  CATALOG_META?.defaults?.storeOwnerUid || "A3ireYsqqIMJ5ORmeRxuWeg1EqM2";
const MAX_BUNDLES = Number(CATALOG_META?.defaults?.maxBundles) || 3;
const STORAGE_DRAFT_KEY = "matager_product_wizard_autosave";

const PRESET_COLORS: { name: string; hex: string }[] = Array.isArray(
  CATALOG_META?.defaults?.presetColors
)
  ? CATALOG_META.defaults.presetColors
  : [
    { name: "Black", hex: "#111827" },
    { name: "White", hex: "#F9FAFB" },
    { name: "Navy", hex: "#1E3A8A" },
    { name: "Red", hex: "#DC2626" },
    { name: "Green", hex: "#16A34A" },
  ];

const ORDERED_INTERVALS: Record<string, string[]> =
  CATALOG_META?.defaults?.orderedIntervals &&
    typeof CATALOG_META.defaults.orderedIntervals === "object"
    ? CATALOG_META.defaults.orderedIntervals
    : {
      clothingSizes: ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"],
    };

const getTargetDb = () => {
  try {
    const app = getApp();
    return getDatabase(app, RTDB_URL);
  } catch {
    return rtdb;
  }
};

type JsonInnerSubmain = string | { name?: string };
type JsonSubmain = {
  name: string;
  innersubmain?: JsonInnerSubmain[];
  valueSuggestions?: string[];
  defaultAttributeName?: string;
  intervalKey?: string;
};
type JsonCategory = {
  main: string;
  defaultAttributeName?: string;
  intervalKey?: string;
  attributeSuggestions?: string[];
  valueSuggestions?: string[];
  submain: JsonSubmain[];
};

const CATEGORY_TREE: JsonCategory[] = Array.isArray(CATALOG_META?.categories)
  ? CATALOG_META.categories
  : [];

const getCategoryNode = (main: string): JsonCategory | undefined =>
  CATEGORY_TREE.find((c) => c.main === main);

const getSubNode = (main: string, sub: string): JsonSubmain | undefined =>
  getCategoryNode(main)?.submain.find((s) => s.name === sub);

const getSubsFor = (main: string): string[] => {
  const found = getCategoryNode(main);
  return found ? found.submain.map((s) => s.name) : [];
};

const getInnerSubsFor = (main: string, sub: string): string[] => {
  const foundSub = getSubNode(main, sub);
  if (!foundSub?.innersubmain?.length) return [];
  return foundSub.innersubmain
    .map((item) => (typeof item === "string" ? item : item?.name || ""))
    .filter(Boolean);
};

const resolveSellingCategories = (route?: string): JsonCategory[] => {
  if (!route || !route.trim()) return CATEGORY_TREE;
  const q = route.toLowerCase().trim();
  const exact = CATEGORY_TREE.filter((c) => c.main.toLowerCase() === q);
  if (exact.length) return exact;
  const partial = CATEGORY_TREE.filter(
    (c) =>
      c.main.toLowerCase().includes(q) || q.includes(c.main.toLowerCase())
  );
  return partial.length ? partial : CATEGORY_TREE;
};

const getDefaultAttributeName = (
  baseCategory: string,
  subCategory?: string
): string => {
  const subNode = subCategory ? getSubNode(baseCategory, subCategory) : undefined;
  if (subNode?.defaultAttributeName) return subNode.defaultAttributeName;
  const catNode = getCategoryNode(baseCategory);
  if (catNode?.defaultAttributeName) return catNode.defaultAttributeName;
  return "Variant";
};

const getAttributeNameSuggestions = (
  baseCategory: string,
  subCategory: string
): string[] => {
  const catNode = getCategoryNode(baseCategory);
  const subs = getSubsFor(baseCategory);
  const inner = getInnerSubsFor(baseCategory, subCategory);
  const fromJson = Array.isArray(catNode?.attributeSuggestions)
    ? catNode.attributeSuggestions
    : [];
  return Array.from(new Set([...fromJson, ...inner, ...subs.slice(0, 4)]));
};

const getAttributeValueSuggestions = (
  baseCategory: string,
  subCategory: string
): string[] => {
  const catNode = getCategoryNode(baseCategory);
  const subNode = getSubNode(baseCategory, subCategory);
  const subs = getSubsFor(baseCategory);
  const inner = getInnerSubsFor(baseCategory, subCategory);
  const fromCat = Array.isArray(catNode?.valueSuggestions)
    ? catNode.valueSuggestions
    : [];
  const fromSub = Array.isArray(subNode?.valueSuggestions)
    ? subNode.valueSuggestions
    : [];
  return Array.from(new Set([...fromSub, ...fromCat, ...inner, ...subs]));
};

const resolveKnowledgeInterval = (
  baseCategory: string,
  subCategory: string,
  fromVal: string,
  toVal: string
): { sequence: string[]; display: string } => {
  const f = fromVal.trim();
  const t = toVal.trim();
  if (!f && !t) return { sequence: [], display: "" };
  if (f && !t) return { sequence: [f], display: f };
  if (!f && t) return { sequence: [t], display: t };

  const subNode = getSubNode(baseCategory, subCategory);
  const catNode = getCategoryNode(baseCategory);
  const intervalKey =
    subNode?.intervalKey ||
    catNode?.intervalKey ||
    (/clothing|fashion|apparel|tops|bottoms|leg wear/i.test(
      `${baseCategory} ${subCategory}`
    )
      ? "clothingSizes"
      : "");

  const list = intervalKey ? ORDERED_INTERVALS[intervalKey] || [] : [];
  if (list.length > 0) {
    const startIdx = list.findIndex(
      (item) => item.toLowerCase() === f.toLowerCase()
    );
    const endIdx = list.findIndex(
      (item) => item.toLowerCase() === t.toLowerCase()
    );
    if (startIdx !== -1 && endIdx !== -1) {
      const low = Math.min(startIdx, endIdx);
      const high = Math.max(startIdx, endIdx);
      const slice =
        startIdx <= endIdx
          ? list.slice(low, high + 1)
          : [...list.slice(low, high + 1)].reverse();
      return {
        sequence: slice,
        display: slice.join(" - "),
      };
    }
  }

  return {
    sequence: [f, t],
    display: `${f} - ${t}`,
  };
};

const formatNotesWithLeadingDash = (raw: string): string => {
  if (!raw) return "";
  const lines = raw.split(/\r?\n/);
  return lines
    .map((line, index) => {
      if (index === 0) {
        if (line.trim() === "") return "";
        return /^\s*-\s?/.test(line) ? line : `- ${line}`;
      }
      if (/^\s*-\s/.test(line)) return line;
      if (/^\s*-\s*$/.test(line)) return "- ";
      return `- ${line.replace(/^\s+/, "")}`;
    })
    .join("\n");
};

const sampleColorFromImageUrl = (
  url: string
): Promise<{ hex: string; label: string } | null> => {
  return new Promise((resolve) => {
    if (!url || typeof document === "undefined") {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0, 16, 16);
        const data = ctx.getImageData(0, 0, 16, 16).data;
        let r = 0;
        let g = 0;
        let b = 0;
        let count = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 128) continue;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
        if (!count) {
          resolve(null);
          return;
        }
        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);
        const hex = `#${[r, g, b]
          .map((x) => x.toString(16).padStart(2, "0"))
          .join("")
          .toUpperCase()}`;

        let closestName = hex;
        let minDist = Infinity;
        for (const preset of PRESET_COLORS) {
          const pHex = preset.hex.replace("#", "");
          const pr = parseInt(pHex.slice(0, 2), 16);
          const pg = parseInt(pHex.slice(2, 4), 16);
          const pb = parseInt(pHex.slice(4, 6), 16);
          const dist = Math.hypot(r - pr, g - pg, b - pb);
          if (dist < minDist) {
            minDist = dist;
            closestName = preset.name;
          }
        }
        resolve({ hex, label: `${closestName} (${hex})` });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
};

export interface ProductVariant {
  id: string;
  attributeName: string;
  attribute: string;
  color: string;
  colorHex?: string;
  colorRefImage?: string;
  useCustomPrice?: boolean;
  price?: number | string;
  stockQty: number | string;
  mainImage?: string;
  imageUrls: string[];
  imageUrl?: string;
}

const migrateVariants = (
  vars: any[],
  baseCategory: string,
  subCategory: string,
  fallbackStock: number | string = 0
): ProductVariant[] => {
  const defaultName = getDefaultAttributeName(baseCategory, subCategory);
  return vars.map((v, i) => {
    const imgs: string[] = Array.isArray(v.imageUrls)
      ? v.imageUrls.filter((u: any) => typeof u === "string" && u.trim())
      : v.imageUrl
        ? [String(v.imageUrl)]
        : [];
    const mainImg = v.mainImage || imgs[0] || v.imageUrl || "";
    const hasPrice =
      v.price !== "" && v.price !== undefined && v.price !== null;
    return {
      id: v.id || `v_${i}_${Math.random().toString(36).slice(2, 6)}`,
      attributeName: v.attributeName || defaultName,
      attribute: v.attribute || "",
      color: v.color || "Black",
      colorHex: v.colorHex || "#0F172A",
      colorRefImage: v.colorRefImage || "",
      useCustomPrice: v.useCustomPrice ?? hasPrice,
      price: v.price ?? "",
      stockQty: v.stockQty ?? (i === 0 ? fallbackStock : 0),
      mainImage: mainImg,
      imageUrls: imgs,
      imageUrl: mainImg || imgs[0] || v.imageUrl || "",
    };
  });
};

export interface BundleTier {
  id: string;
  targetVariantId: string;
  qty: number | string;
  payAmount: number | string;
  freeShipping: boolean;
}

export interface ProductWizardData {
  draftId?: string;
  isDraft?: boolean;
  name: string;
  brand: string;
  price: number;
  hidePrice?: boolean;
  askForPrice?: boolean;
  stockQty: number;
  sellingChannel: "both" | "pos" | "storefront";
  baseCategory: string;
  subCategory: string;
  images: string[];
  variants: ProductVariant[];
  notes: string;
  freeDelivery: boolean;
  attachedManual?: string;
  bundlesEnabled: boolean;
  bundles: {
    id?: string;
    targetVariantId?: string;
    qty: number;
    payAmount: number;
    discountPercent: number;
    freeShipping: boolean;
  }[];
  promoCode: string;
  promoDiscountPercent: number;
}

interface ProductWizardModalProps {
  initialData?: Partial<ProductWizardData>;
  targetUid?: string;
  storeOwnerUid?: string;
  sellingRoute?: string;
  posEnabled?: boolean;
  storefrontEnabled?: boolean;
  onClose: () => void;
  onSaved: (product: any) => Promise<void> | void;
}

type FieldKey = "name" | "price";

export const ProductWizardModal: React.FC<ProductWizardModalProps> = ({
  initialData,
  targetUid = DEFAULT_STORE_OWNER_UID,
  storeOwnerUid,
  sellingRoute,
  posEnabled = true,
  storefrontEnabled = true,
  onClose,
  onSaved,
}) => {
  const effectiveOwnerUid =
    storeOwnerUid || targetUid || DEFAULT_STORE_OWNER_UID;
  const storageKey = `${STORAGE_DRAFT_KEY}_${effectiveOwnerUid}`;
  const { tr, isRtl } = useDash();

  const restoredSnapshot = useMemo(() => {
    if (initialData) return null;
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, [initialData, storageKey]);

  const seed = initialData || restoredSnapshot?.data || {};

  const [step, setStep] = useState<1 | 2 | 3 | 4>(
    !initialData &&
      [1, 2, 3, 4].includes(Number(restoredSnapshot?.step))
      ? (Number(restoredSnapshot.step) as 1 | 2 | 3 | 4)
      : 1
  );
  const [restoredFromStorage, setRestoredFromStorage] = useState<boolean>(
    !initialData && !!restoredSnapshot?.data
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [draftStatusMsg, setDraftStatusMsg] = useState<string | null>(null);
  const [duplicateNotice, setDuplicateNotice] = useState<string | null>(null);
  const [collapsedVariants, setCollapsedVariants] = useState<
    Record<string, boolean>
  >({});
  const [openSuggestionMenu, setOpenSuggestionMenu] = useState<{
    variantId: string;
    field: "attrName" | "attrValue" | "rangeFrom" | "rangeTo";
  } | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const variantCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [draftId, setDraftId] = useState<string>(
    seed?.draftId || `draft_${Date.now()}`
  );

  const [fieldErrors, setFieldErrors] = useState<Record<FieldKey, boolean>>({
    name: false,
    price: false,
  });

  const availableCategories = useMemo(
    () => resolveSellingCategories(sellingRoute),
    [sellingRoute]
  );
  const availableMains = useMemo(
    () => availableCategories.map((c) => c.main),
    [availableCategories]
  );

  const [name, setName] = useState(seed?.name || "");
  const [brand, setBrand] = useState(seed?.brand || "");
  const [price, setPrice] = useState<number | string>(seed?.price ?? "");
  const [hidePrice, setHidePrice] = useState<boolean>(!!seed?.hidePrice);
  const [askForPrice, setAskForPrice] = useState<boolean>(!!seed?.askForPrice);
  const [sellingChannel, setSellingChannel] = useState<
    "both" | "pos" | "storefront"
  >(seed?.sellingChannel || "both");

  const [baseCategory, setBaseCategory] = useState<string>(() => {
    if (seed?.baseCategory && availableMains.includes(seed.baseCategory))
      return seed.baseCategory;
    return availableMains[0] || "";
  });

  const [subCategory, setSubCategory] = useState<string>(() => {
    const base = seed?.baseCategory || availableMains[0] || "";
    const subs = getSubsFor(base);
    if (seed?.subCategory && subs.includes(seed.subCategory))
      return seed.subCategory;
    return subs[0] || "";
  });

  const [subCategories, setSubCategories] = useState<string[]>(() =>
    getSubsFor(seed?.baseCategory || availableMains[0] || "")
  );
  const [userSubs, setUserSubs] = useState<string[]>([]);

  const [isAddingSubCategory, setIsAddingSubCategory] = useState(false);
  const [newSubCategoryInput, setNewSubCategoryInput] = useState("");
  const [isSavingSubCategory, setIsSavingSubCategory] = useState(false);

  const [images, setImages] = useState<string[]>(seed?.images || []);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isDraggingMedia, setIsDraggingMedia] = useState(false);

  const [variants, setVariants] = useState<ProductVariant[]>(() => {
    const initBase = seed?.baseCategory || availableMains[0] || "";
    const initSub = seed?.subCategory || getSubsFor(initBase)[0] || "";
    if (seed?.variants && seed.variants.length) {
      return migrateVariants(
        seed.variants,
        initBase,
        initSub,
        seed?.stockQty ?? 0
      );
    }
    return [
      {
        id: "v1",
        attributeName: getDefaultAttributeName(initBase, initSub),
        attribute: "",
        color: "Black",
        colorHex: "#0F172A",
        colorRefImage: "",
        useCustomPrice: false,
        price: "",
        stockQty: seed?.stockQty ?? 1,
        mainImage: "",
        imageUrls: [],
        imageUrl: "",
      },
    ];
  });

  const [variantRangeMode, setVariantRangeMode] = useState<
    Record<string, { from: string; to: string }>
  >({});

  const totalStockQty = useMemo(() => {
    return variants.reduce((sum, v) => sum + (Number(v.stockQty) || 0), 0);
  }, [variants]);

  const [notes, setNotes] = useState<string>(() =>
    formatNotesWithLeadingDash(seed?.notes || "")
  );
  const notesTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [freeDelivery, setFreeDelivery] = useState<boolean>(
    !!seed?.freeDelivery
  );
  const [attachedManual, setAttachedManual] = useState<string>(
    seed?.attachedManual || ""
  );

  const [bundlesEnabled, setBundlesEnabled] = useState<boolean>(
    !!seed?.bundlesEnabled
  );
  const [bundles, setBundles] = useState<BundleTier[]>(() => {
    const src = seed?.bundles;
    if (src && src.length) {
      return src.slice(0, MAX_BUNDLES).map((b: any, i: number) => ({
        id: b.id || `b_${i}_${Math.random().toString(36).slice(2, 6)}`,
        targetVariantId: b.targetVariantId || "all",
        qty: b.qty ?? "",
        payAmount: b.payAmount ?? "",
        freeShipping: !!b.freeShipping,
      }));
    }
    return [
      {
        id: "b_1",
        targetVariantId: "all",
        qty: 2,
        payAmount: "",
        freeShipping: false,
      },
    ];
  });

  const [promoCode, setPromoCode] = useState(seed?.promoCode || "");
  const [promoDiscountPercent, setPromoDiscountPercent] = useState<
    number | string
  >(seed?.promoDiscountPercent ?? "");

  const isPublishedRef = useRef(false);

  const persistToLocalStorage = useMemo(
    () => () => {
      if (isPublishedRef.current || typeof window === "undefined") return;
      try {
        window.localStorage.setItem(
          storageKey,
          JSON.stringify({
            step,
            savedAt: new Date().toISOString(),
            data: {
              draftId,
              name,
              brand,
              price,
              hidePrice,
              askForPrice,
              sellingChannel,
              baseCategory,
              subCategory,
              images,
              variants,
              notes,
              freeDelivery,
              attachedManual,
              bundlesEnabled,
              bundles,
              promoCode,
              promoDiscountPercent,
            },
          })
        );
      } catch {
        // Ignore storage quota errors
      }
    },
    [
      storageKey,
      step,
      draftId,
      name,
      brand,
      price,
      hidePrice,
      askForPrice,
      sellingChannel,
      baseCategory,
      subCategory,
      images,
      variants,
      notes,
      freeDelivery,
      attachedManual,
      bundlesEnabled,
      bundles,
      promoCode,
      promoDiscountPercent,
    ]
  );

  useEffect(() => {
    persistToLocalStorage();
  }, [persistToLocalStorage]);

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const clearLocalStorageSnapshot = () => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // Ignore
    }
  };

  const handleCloseWizard = () => {
    persistToLocalStorage();
    onClose();
  };

  const inputClsR = (err?: boolean, extra = "") =>
    `${inputCls} !rounded-[10px] transition-all duration-200 ease-out ${err
      ? "!border-[var(--color-status-red)] !ring-2 !ring-[var(--color-status-red)]/25 focus:!border-[var(--color-status-red)] focus:!ring-[var(--color-status-red)]/40 focus:!outline-none focus:!ring-offset-0"
      : ""
      } ${extra}`.trim();

  const clearErr = (field: FieldKey) =>
    setFieldErrors((e) => (e[field] ? { ...e, [field]: false } : e));

  const attributeNameSuggestions = useMemo(
    () => getAttributeNameSuggestions(baseCategory, subCategory),
    [baseCategory, subCategory]
  );
  const attributeValueSuggestions = useMemo(
    () => getAttributeValueSuggestions(baseCategory, subCategory),
    [baseCategory, subCategory]
  );

  useEffect(() => {
    const bothOk = posEnabled && storefrontEnabled;
    if (sellingChannel === "both" && !bothOk) {
      setSellingChannel(
        posEnabled ? "pos" : storefrontEnabled ? "storefront" : "pos"
      );
    } else if (sellingChannel === "pos" && !posEnabled) {
      setSellingChannel(storefrontEnabled ? "storefront" : "both");
    } else if (sellingChannel === "storefront" && !storefrontEnabled) {
      setSellingChannel(posEnabled ? "pos" : "both");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posEnabled, storefrontEnabled]);

  useEffect(() => {
    if (availableMains.length && !availableMains.includes(baseCategory)) {
      setBaseCategory(availableMains[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableMains]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const db = getTargetDb();
      if (!db) return;
      try {
        const subRef = rtdbRef(db, `${effectiveOwnerUid}/storeconfig/subcategories`);
        const subSnap = await rtdbGet(subRef);
        if (alive && subSnap.exists()) {
          const val = subSnap.val();
          let list: string[] = [];
          if (Array.isArray(val))
            list = val.filter((x) => typeof x === "string");
          else if (val && typeof val === "object")
            list = (Object.values(val).flat() as any[]).filter(
              (x) => typeof x === "string"
            );
          setUserSubs(list);
        }
      } catch (err) {
        console.warn("RTDB subcategory fetch warning:", err);
      }
    })();
    return () => {
      alive = false;
    };
  }, [effectiveOwnerUid]);

  useEffect(() => {
    const jsonSubs = getSubsFor(baseCategory);
    const merged = Array.from(new Set([...jsonSubs, ...userSubs]));
    setSubCategories(merged);
    if (!merged.includes(subCategory)) setSubCategory(merged[0] || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseCategory, userSubs]);

  const isClothing =
    /clothing|fashion|apparel|tops|bottoms|leg wear|footwear/i.test(
      baseCategory
    ) || /clothing|fashion|apparel/i.test(subCategory);

  const isStep1Valid = useMemo(() => {
    const priceOk =
      hidePrice ||
      askForPrice ||
      (price !== "" && !Number.isNaN(Number(price)) && Number(price) > 0);
    return (
      name.trim().length > 0 &&
      priceOk &&
      baseCategory.trim().length > 0 &&
      subCategory.trim().length > 0
    );
  }, [name, price, hidePrice, askForPrice, baseCategory, subCategory]);

  const isStep2Valid = useMemo(() => {
    return images.length > 0;
  }, [images]);

  const isStep3Valid = useMemo(() => {
    if (!variants.length) return false;
    return variants.every((v) => {
      const hasAttr = v.attribute.trim().length > 0;
      const hasStock =
        v.stockQty !== "" &&
        !Number.isNaN(Number(v.stockQty)) &&
        Number(v.stockQty) >= 0;
      return hasAttr && hasStock;
    });
  }, [variants]);

  const isCurrentStepNextDisabled = useMemo(() => {
    if (step === 1) return !isStep1Valid;
    if (step === 2) return !isStep2Valid;
    if (step === 3) return !isStep3Valid;
    return false;
  }, [step, isStep1Valid, isStep2Valid, isStep3Valid]);

  const handleNextStep = () => {
    setOpenSuggestionMenu(null);
    if (step === 1) {
      const errs: Record<FieldKey, boolean> = {
        name: !name.trim(),
        price:
          !hidePrice &&
          !askForPrice &&
          (price === "" || Number(price) <= 0),
      };
      setFieldErrors(errs);
      if (!isStep1Valid) return;
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!isStep2Valid) return;
      setStep(3);
      return;
    }
    if (step === 3) {
      if (!isStep3Valid) return;
      setStep(4);
    }
  };

  const getBundleUnitPrice = (targetVariantId: string): number => {
    if (!targetVariantId || targetVariantId === "all") {
      return Number(price) || 0;
    }
    const found = variants.find((v) => v.id === targetVariantId);
    if (
      found &&
      found.useCustomPrice &&
      found.price !== "" &&
      Number(found.price) > 0
    ) {
      return Number(found.price);
    }
    return Number(price) || 0;
  };

  const calcBundlePreview = (
    targetVariantId: string,
    qty: number | string,
    payAmount: number | string
  ) => {
    const q = Number(qty) || 0;
    const p = Number(payAmount) || 0;
    const unit = getBundleUnitPrice(targetVariantId);
    const original = unit * q;
    if (q <= 0 || unit <= 0) return null;
    const hasPay = p > 0;
    const saved = hasPay ? original - p : 0;
    const pct = hasPay && original > 0 ? (saved / original) * 100 : 0;
    return { q, unit, original, hasPay, saved, pct };
  };

  const addBundleTier = () => {
    if (bundles.length >= MAX_BUNDLES) return;
    setBundles((prev) => [
      ...prev,
      {
        id: `b_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        targetVariantId: "all",
        qty: 2,
        payAmount: "",
        freeShipping: false,
      },
    ]);
  };

  const removeBundleTier = (id: string) => {
    if (bundles.length <= 1) return;
    setBundles((prev) => prev.filter((b) => b.id !== id));
  };

  const updateBundleTier = (
    id: string,
    field: "targetVariantId" | "qty" | "payAmount" | "freeShipping",
    value: any
  ) => {
    setBundles((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  const handleAddNewSubCategory = async () => {
    const trimmed = newSubCategoryInput.trim();
    if (!trimmed) return;
    setIsSavingSubCategory(true);
    try {
      const nextUserSubs = Array.from(new Set([...userSubs, trimmed]));
      setUserSubs(nextUserSubs);
      setSubCategory(trimmed);
      setNewSubCategoryInput("");
      setIsAddingSubCategory(false);

      const db = getTargetDb();
      if (db) {
        await rtdbSet(
          rtdbRef(db, `${effectiveOwnerUid}/storeconfig/subcategories`),
          nextUserSubs
        );
        await rtdbSet(
          rtdbRef(db, `stores/${effectiveOwnerUid}/storeconfig/subcategories`),
          nextUserSubs
        );
      }
    } catch (err) {
      console.warn("Error saving subcategory:", err);
    } finally {
      setIsSavingSubCategory(false);
    }
  };

  const appendMediaUrls = (raw: string) => {
    const parts = raw
      .split(/[\n,\s]+/)
      .map((s) => s.trim())
      .filter((s) => /^(https?:\/\/|data:image\/)/i.test(s));
    if (!parts.length) return false;
    setImages((prev) => Array.from(new Set([...prev, ...parts])));
    return true;
  };

  const handleAddImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    if (!appendMediaUrls(trimmed)) {
      setImages((prev) => Array.from(new Set([...prev, trimmed])));
    }
    setImageUrlInput("");
  };

  const handleMediaPaste = (
    e: React.ClipboardEvent<HTMLInputElement | HTMLDivElement>
  ) => {
    const pastedText = e.clipboardData?.getData("text/plain") || "";
    if (/https?:\/\//i.test(pastedText)) {
      const added = appendMediaUrls(pastedText);
      if (added) {
        e.preventDefault();
        setImageUrlInput("");
      }
    }
  };

  const handleMediaDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingMedia(false);

    const uriList = e.dataTransfer?.getData("text/uri-list") || "";
    const textPlain = e.dataTransfer?.getData("text/plain") || "";
    if (appendMediaUrls(`${uriList}\n${textPlain}`)) return;

    const files = Array.from(e.dataTransfer?.files || []);
    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            setImages((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleRemoveImage = (index: number) => {
    const removedUrl = images[index];
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (removedUrl) {
      setVariants((prev) =>
        prev.map((v) => {
          const nextImgs = (v.imageUrls || []).filter((u) => u !== removedUrl);
          const nextMain =
            v.mainImage === removedUrl ? nextImgs[0] || "" : v.mainImage || "";
          return {
            ...v,
            imageUrls: nextImgs,
            mainImage: nextMain,
            imageUrl: nextMain || nextImgs[0] || "",
            colorRefImage:
              v.colorRefImage === removedUrl ? "" : v.colorRefImage,
          };
        })
      );
    }
  };

  const handleAddVariant = () => {
    const newId = `v_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setVariants((prev) => [
      ...prev,
      {
        id: newId,
        attributeName: getDefaultAttributeName(baseCategory, subCategory),
        attribute: "",
        color: "Black",
        colorHex: "#0F172A",
        colorRefImage: "",
        useCustomPrice: false,
        price: "",
        stockQty: 0,
        mainImage: images[0] || "",
        imageUrls: [],
        imageUrl: images[0] || "",
      },
    ]);
  };

  const handleDuplicateVariant = (variantId: string) => {
    const source = variants.find((v) => v.id === variantId);
    if (!source) return;
    const newId = `v_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const cloned: ProductVariant = {
      ...source,
      id: newId,
      imageUrls: [...(source.imageUrls || [])],
      mainImage: source.mainImage || source.imageUrls?.[0] || "",
      imageUrl: source.mainImage || source.imageUrls?.[0] || source.imageUrl || "",
    };

    setVariants((prev) => {
      const idx = prev.findIndex((v) => v.id === variantId);
      if (idx === -1) return [...prev, cloned];
      const next = [...prev];
      next.splice(idx + 1, 0, cloned);
      return next;
    });

    setCollapsedVariants((prev) => ({ ...prev, [newId]: false }));

    if (variantRangeMode[variantId]) {
      setVariantRangeMode((prev) => ({
        ...prev,
        [newId]: { ...prev[variantId] },
      }));
    }

    setDuplicateNotice(
      tr(
        "Variant duplicated — scrolled smoothly to the new variant.",
        "تم تكرار المتغير — تم الانتقال بسلاسة إلى المتغير الجديد."
      )
    );

    requestAnimationFrame(() => {
      const targetEl = variantCardRefs.current[newId];
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  };

  const toggleCollapseVariant = (variantId: string) => {
    setCollapsedVariants((prev) => ({
      ...prev,
      [variantId]: !prev[variantId],
    }));
  };

  const getRangeState = (v: ProductVariant) => variantRangeMode[v.id];

  const toggleRangeMode = (v: ProductVariant) => {
    setOpenSuggestionMenu(null);
    if (variantRangeMode[v.id]) {
      setVariantRangeMode((prev) => {
        const next = { ...prev };
        delete next[v.id];
        return next;
      });
    } else {
      const parts = v.attribute
        .split(/\s*[-–]\s*/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (parts.length >= 2) {
        const resolved = resolveKnowledgeInterval(
          baseCategory,
          subCategory,
          parts[0],
          parts[parts.length - 1]
        );
        setVariantRangeMode((prev) => ({
          ...prev,
          [v.id]: { from: parts[0], to: parts[parts.length - 1] },
        }));
        if (resolved.display) {
          handleUpdateVariant(v.id, "attribute", resolved.display);
        }
      } else {
        setVariantRangeMode((prev) => ({
          ...prev,
          [v.id]: { from: v.attribute || "", to: "" },
        }));
      }
    }
  };

  const updateRange = (
    v: ProductVariant,
    field: "from" | "to",
    value: string
  ) => {
    const current = variantRangeMode[v.id] || { from: "", to: "" };
    const next = { ...current, [field]: value };
    setVariantRangeMode((prev) => ({ ...prev, [v.id]: next }));
    const resolved = resolveKnowledgeInterval(
      baseCategory,
      subCategory,
      next.from,
      next.to
    );
    handleUpdateVariant(v.id, "attribute", resolved.display);
  };

  const handleUpdateVariant = (
    id: string,
    field: keyof ProductVariant,
    value: any
  ) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const handleUseImageAsColorReference = async (
    variantId: string,
    imgUrl: string
  ) => {
    const sampled = await sampleColorFromImageUrl(imgUrl);
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id !== variantId) return v;
        return {
          ...v,
          colorRefImage: imgUrl,
          colorHex: sampled?.hex || v.colorHex || "#0F172A",
          color: sampled?.label || v.color || "Image Reference",
        };
      })
    );
  };

  const handleClickVariantImageChip = (variantId: string, imgUrl: string) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id !== variantId) return v;
        const current = v.imageUrls || [];
        const isAlreadyLinked = current.includes(imgUrl);

        if (!isAlreadyLinked) {
          const nextUrls = [...current, imgUrl];
          const nextMain = v.mainImage || nextUrls[0] || "";
          return {
            ...v,
            imageUrls: nextUrls,
            mainImage: nextMain,
            imageUrl: nextMain || nextUrls[0] || "",
          };
        }

        return {
          ...v,
          mainImage: imgUrl,
          imageUrl: imgUrl,
        };
      })
    );
  };

  const handleUnlinkVariantImage = (variantId: string, imgUrl: string) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id !== variantId) return v;
        const nextUrls = (v.imageUrls || []).filter((u) => u !== imgUrl);
        const nextMain =
          v.mainImage === imgUrl ? nextUrls[0] || "" : v.mainImage || "";
        return {
          ...v,
          imageUrls: nextUrls,
          mainImage: nextMain,
          imageUrl: nextMain || nextUrls[0] || "",
        };
      })
    );
  };

  const handleRemoveVariant = (id: string) => {
    if (variants.length <= 1) return;
    setVariants((prev) => prev.filter((v) => v.id !== id));
    setVariantRangeMode((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(formatNotesWithLeadingDash(e.target.value));
  };

  const handleNotesKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const el = e.currentTarget;
      const start = el.selectionStart ?? notes.length;
      const end = el.selectionEnd ?? notes.length;
      const insertion = "\n- ";
      const updated = notes.slice(0, start) + insertion + notes.slice(end);
      setNotes(formatNotesWithLeadingDash(updated));
      requestAnimationFrame(() => {
        if (notesTextareaRef.current) {
          const pos = start + insertion.length;
          notesTextareaRef.current.selectionStart = pos;
          notesTextareaRef.current.selectionEnd = pos;
        }
      });
    }
  };

  const buildPayload = (isDraftFlag: boolean) => {
    const prodId = isDraftFlag ? draftId : `prod_${Date.now()}`;
    const primaryImage =
      images[0] ||
      (isClothing
        ? "https://assets.adidas.com/images/w_1880,f_auto,q_auto/a4ff4a779ee34deca8cc9a6f1f411440_9366/KC6611_HM1.jpg"
        : "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80");

    const categoryFull = `${baseCategory} > ${subCategory}`;
    const formattedNotes = formatNotesWithLeadingDash(notes);
    const normalizedVariants = variants.map((v) => {
      const imgs =
        v.imageUrls && v.imageUrls.length
          ? v.imageUrls
          : v.imageUrl
            ? [v.imageUrl]
            : [];
      const resolvedMain = v.mainImage || imgs[0] || v.imageUrl || "";
      return {
        ...v,
        stockQty: Number(v.stockQty) || 0,
        price: v.useCustomPrice ? Number(v.price) || 0 : "",
        mainImage: resolvedMain,
        imageUrls: imgs,
        imageUrl: resolvedMain || imgs[0] || "",
      };
    });

    const computedStock = normalizedVariants.reduce(
      (acc, item) => acc + (Number(item.stockQty) || 0),
      0
    );

    const priceIsHidden = !!(hidePrice || askForPrice);

    return {
      id: prodId,
      storeOwnerUid: effectiveOwnerUid,
      isDraft: isDraftFlag,
      status: isDraftFlag ? "draft" : "published",
      name: name.trim(),
      brand: brand.trim(),
      price: priceIsHidden ? 0 : Number(price) || 0,
      hidePrice: priceIsHidden,
      askForPrice: priceIsHidden,
      priceDisplayMode: priceIsHidden ? "ask_for_price" : "fixed",
      currency: CATALOG_META?.defaults?.currency || "EGP",
      stockQty: computedStock,
      stockText: `${computedStock} in Stock`,
      sellingChannel,
      baseCategory,
      subCategory,
      category: categoryFull,
      images,
      image: primaryImage,
      variants: normalizedVariants,
      notes: formattedNotes,
      freeDelivery,
      attachedManual,
      bundlesEnabled,
      bundles: bundlesEnabled
        ? bundles
          .map((b) => {
            const qty = Number(b.qty) || 0;
            const pay = Number(b.payAmount) || 0;
            const unit = getBundleUnitPrice(b.targetVariantId);
            const original = unit * qty;
            const pct =
              original > 0 && pay > 0 && pay < original
                ? (1 - pay / original) * 100
                : 0;
            return {
              id: b.id,
              targetVariantId: b.targetVariantId || "all",
              qty,
              unitPrice: unit,
              bundleBasePrice: original,
              payAmount: pay,
              discountPercent: Math.round(pct * 100) / 100,
              freeShipping: !!b.freeShipping,
            };
          })
          .filter((b) => b.qty > 0 && (b.payAmount > 0 || priceIsHidden))
        : [],
      promoCode: promoCode.trim(),
      promoDiscountPercent: Number(promoDiscountPercent) || 0,
      updated_at: new Date().toISOString(),
      created_at: initialData ? undefined : new Date().toISOString(),
      statusVariant:
        computedStock > 5 ? "success" : computedStock > 0 ? "pending" : "danger",
    };
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    setSubmitError(null);
    setDraftStatusMsg(null);
    try {
      const payload = buildPayload(true);
      const db = getTargetDb();
      if (db) {
        await rtdbSet(
          rtdbRef(
            db,
            `stores/${effectiveOwnerUid}/productDrafts/${payload.id}`
          ),
          {
            ...payload,
            created_at: payload.created_at || new Date().toISOString(),
          }
        );
      }
      setDraftId(payload.id);
      setDraftStatusMsg(
        tr("Draft saved to RTDB.", "تم حفظ المسودة في قاعدة البيانات.")
      );
      await onSaved(payload);
    } catch (err: any) {
      console.error("Error saving draft:", err);
      setSubmitError(
        err?.message || tr("Failed to save draft.", "فشل في حفظ المسودة.")
      );
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleFinalSubmit = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    if (!isStep1Valid) {
      setFieldErrors({
        name: !name.trim(),
        price:
          !hidePrice &&
          !askForPrice &&
          (price === "" || Number(price) <= 0),
      });
      setStep(1);
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);

    const payload = buildPayload(false);
    const { created_at, ...cleanPayload } = payload;
    const productJson = {
      ...cleanPayload,
      created_at: created_at || new Date().toISOString(),
    };

    try {
      const db = getTargetDb();
      if (db) {
        const productsBaseRef = rtdbRef(
          db,
          `stores/${effectiveOwnerUid}/products`
        );
        const existingSnap = await rtdbGet(productsBaseRef);
        const existingObj =
          existingSnap.exists() && typeof existingSnap.val() === "object"
            ? existingSnap.val()
            : {};
        const existingCat =
          existingObj?.category && typeof existingObj.category === "object"
            ? existingObj.category
            : {};

        await rtdbSet(productsBaseRef, {
          ...existingObj,
          [productJson.id]: productJson,
          category: {
            ...existingCat,
            [productJson.id]: productJson.category,
          },
        });
      }
      isPublishedRef.current = true;
      clearLocalStorageSnapshot();
      await onSaved(productJson);
      onClose();
    } catch (err: any) {
      console.error("Error creating product:", err);
      setSubmitError(
        err?.message || tr("Failed to save product.", "فشل في حفظ المنتج.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const channelOptions = [
    {
      id: "both" as const,
      label: tr("Both", "الكل"),
      icon: "bi-shop",
      disabled: !posEnabled || !storefrontEnabled,
    },
    {
      id: "pos" as const,
      label: tr("POS", "الكاشير"),
      icon: "bi-pc-display",
      disabled: !posEnabled,
    },
    {
      id: "storefront" as const,
      label: tr("Store", "المتجر"),
      icon: "bi-globe",
      disabled: !storefrontEnabled,
    },
  ];

  const nextStepLabel = useMemo(() => {
    if (step === 1) return tr("Next: Media", "التالي: الصور");
    if (step === 2) return tr("Next: Variants", "التالي: المتغيرات");
    if (step === 3) return tr("Next: Additional", "التالي: الإضافات");
    return tr("Publish Product", "حفظ ونشر المنتج");
  }, [step, tr]);

  const progressPct = ((step - 1) / 3) * 100;
  const freeShippingTierCount = bundles.filter((b) => b.freeShipping).length;

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden h-full">
      <style>{`
        .matager-swatch-circle::-webkit-color-swatch-wrapper {
          padding: 0;
        }
        .matager-swatch-circle::-webkit-color-swatch {
          border: none;
          border-radius: 9999px;
        }
        .matager-swatch-circle::-moz-color-swatch {
          border: none;
          border-radius: 9999px;
        }
      `}</style>

      {/* ─── SLIDER WITHOUT TEXTS ─── */}
      <div className="px-5 sm:px-8 py-2.5 bg-[var(--color-surface)] shrink-0 sticky top-0 z-10 border-b border-[var(--color-border-subtle)]">
        <div className="relative flex items-center justify-between py-1">
          <div className="absolute left-2 right-2 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--color-primary-light)] transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {[1, 2, 3, 4].map((num) => {
            const isDone = step > num;
            const isCurrent = step === num;
            return (
              <button
                key={num}
                type="button"
                onClick={() => num < step && setStep(num as 1 | 2 | 3 | 4)}
                disabled={num > step}
                aria-label={`Step ${num}`}
                className={`relative z-10 w-3.5 h-3.5 rounded-full transition-all duration-300 ease-out ${isDone || isCurrent
                  ? "bg-[var(--color-primary-light)]"
                  : "bg-[var(--color-surface)] border-2 border-[var(--color-border-subtle)]"
                  } ${num < step ? "cursor-pointer" : "cursor-default"}`}
              />
            );
          })}
        </div>
      </div>

      {/* ─── BODY ─── */}
      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 overflow-y-auto scroll-smooth overscroll-contain px-4 sm:px-5 py-4 space-y-4 custom-scrollbar"
      >
        {restoredFromStorage && (
          <div className="p-2.5 rounded-[10px] flex items-center justify-between gap-2 text-xs bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] transition-all duration-300 ease-out">
            <span>
              {tr(
                "Restored unsaved wizard progress from local storage.",
                "تمت استعادة البيانات غير المحفوظة تلقائياً من التخزين المحلي."
              )}
            </span>
            <button
              type="button"
              onClick={() => {
                clearLocalStorageSnapshot();
                setRestoredFromStorage(false);
              }}
              className="text-[11px] font-bold text-[var(--color-primary-light)] hover:underline shrink-0 transition-opacity duration-200"
            >
              {tr("Clear", "مسح")}
            </button>
          </div>
        )}

        {submitError && (
          <div
            role="alert"
            className="p-3 rounded-[10px] flex items-center gap-2 text-xs bg-[var(--color-status-red-bg)] border border-[var(--color-status-red-border)] text-[var(--color-status-red)] transition-all duration-300 ease-out"
          >
            <i className="bi bi-exclamation-circle shrink-0" />
            <span className="flex-1 font-medium">{submitError}</span>
          </div>
        )}

        {draftStatusMsg && (
          <div
            role="status"
            className="p-2.5 rounded-[10px] flex items-center justify-between gap-2 text-xs bg-[var(--color-status-green-bg)] border border-[var(--color-status-green-border)] text-[var(--color-status-green)] transition-all duration-300 ease-out"
          >
            <span className="flex items-center gap-2 font-medium">
              <i className="bi bi-check-circle-fill shrink-0" />
              {draftStatusMsg}
            </span>
            <button
              type="button"
              onClick={() => setDraftStatusMsg(null)}
              className="text-[11px] underline"
            >
              {tr("Dismiss", "إغلاق")}
            </button>
          </div>
        )}

        {/* ─── STEP 1 ─── */}
        {step === 1 && (
          <div className="space-y-4 transition-all duration-300 ease-out">
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-primary)] font-subtitle mb-1">
                  {tr("Product Name", "اسم المنتج")}{" "}
                  <span className="text-[var(--color-status-red)]">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearErr("name");
                  }}
                  placeholder={tr(
                    "e.g. Classic Oversized Cotton Hoodie",
                    "مثال: هودي قطني كلاسيكي"
                  )}
                  required
                  aria-invalid={fieldErrors.name}
                  className={inputClsR(fieldErrors.name)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-primary)] font-subtitle mb-1">
                    {tr("Brand (Optional)", "الماركة (اختياري)")}
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder={tr(
                      "e.g. Matager Collection",
                      "مثال: تشكيلة متاجر"
                    )}
                    className={inputClsR(false)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-primary)] font-subtitle mb-1">
                    {tr("Base Price (EGP)", "السعر الأساسي (ج.م)")}{" "}
                    {!hidePrice && !askForPrice && (
                      <span className="text-[var(--color-status-red)]">*</span>
                    )}
                  </label>
                  <input
                    type="number"
                    min="0"
                    disabled={hidePrice || askForPrice}
                    value={hidePrice || askForPrice ? "" : price}
                    onChange={(e) => {
                      setPrice(
                        e.target.value === "" ? "" : Number(e.target.value)
                      );
                      clearErr("price");
                    }}
                    placeholder={
                      hidePrice || askForPrice
                        ? tr("Ask for Price", "اطلب السعر")
                        : "450"
                    }
                    required={!hidePrice && !askForPrice}
                    aria-invalid={fieldErrors.price}
                    className={inputClsR(
                      fieldErrors.price,
                      hidePrice || askForPrice ? "opacity-50" : ""
                    )}
                  />
                </div>
              </div>

              <div className="p-3 rounded-[10px] bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] flex items-center justify-between gap-3 transition-colors duration-200 ease-out">
                <div>
                  <p className="text-xs font-bold text-[var(--color-text-primary)]">
                    {tr(
                      "Hide Price & Show 'Ask for Price' Button",
                      "إخفاء السعر وإظهار زر 'اطلب السعر'"
                    )}
                  </p>
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    {tr(
                      "Storefront visitors will see an Ask for Price inquiry option instead of a fixed price.",
                      "سيظهر للعملاء في المتجر خيار طلب السعر بدلاً من السعر الثابت."
                    )}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={hidePrice || askForPrice}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setHidePrice(checked);
                    setAskForPrice(checked);
                    if (checked) clearErr("price");
                  }}
                  className="w-5 h-5 rounded accent-[var(--color-primary-light)] cursor-pointer shrink-0 transition-transform duration-200 ease-out"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-primary)] font-subtitle mb-1.5">
                  {tr("Selling Channel", "قناة البيع")}
                </label>
                <div className="p-1 rounded-[10px] bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] grid grid-cols-3 gap-1">
                  {channelOptions.map((ch) => {
                    const active = sellingChannel === ch.id;
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        disabled={ch.disabled}
                        onClick={() =>
                          !ch.disabled && setSellingChannel(ch.id)
                        }
                        title={
                          ch.disabled
                            ? tr(
                              "Channel is disabled in store settings.",
                              "هذه القناة معطلة من إعدادات المتجر."
                            )
                            : undefined
                        }
                        className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-[8px] text-[11px] font-bold transition-all duration-200 ease-out ${active
                          ? "bg-[var(--color-primary-light)] text-white shadow-sm"
                          : ch.disabled
                            ? "text-[var(--color-text-muted)] opacity-40 cursor-not-allowed"
                            : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
                          }`}
                      >
                        <i className={`bi ${ch.icon} text-xs`} />
                        <span className="truncate">{ch.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-[10px] bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] space-y-3 transition-all duration-300 ease-out">
              <div className="flex items-center justify-between">
                <span className={eyebrow}>
                  {tr("Category Architecture", "هيكلية التصنيف")}
                </span>
                <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                  {availableMains.length} / {CATEGORY_TREE.length}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-primary)] font-subtitle mb-1">
                    {tr("Base Category", "التصنيف الرئيسي")}{" "}
                    <span className="text-[var(--color-status-red)]">*</span>
                  </label>
                  <select
                    value={baseCategory}
                    onChange={(e) => setBaseCategory(e.target.value)}
                    className={inputClsR(false, "!font-semibold")}
                  >
                    {availableMains.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-[var(--color-text-primary)] font-subtitle">
                      {tr("Sub-Category", "التصنيف الفرعي")}{" "}
                      <span className="text-[var(--color-status-red)]">*</span>
                    </label>
                    {!isAddingSubCategory && (
                      <button
                        type="button"
                        onClick={() => setIsAddingSubCategory(true)}
                        className="text-[11px] font-bold text-[var(--color-primary-light)] hover:underline flex items-center gap-1 transition-all duration-200 ease-out"
                      >
                        <i className="bi bi-plus" />
                        <span>{tr("+ Add New", "+ إضافة جديد")}</span>
                      </button>
                    )}
                  </div>

                  {isAddingSubCategory ? (
                    <div className="space-y-1.5 transition-all duration-300 ease-out">
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={newSubCategoryInput}
                          onChange={(e) => setNewSubCategoryInput(e.target.value)}
                          placeholder={tr(
                            "e.g. Custom sub-category",
                            "مثال: تصنيف فرعي مخصص"
                          )}
                          className={inputClsR(false)}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleAddNewSubCategory}
                          disabled={
                            isSavingSubCategory || !newSubCategoryInput.trim()
                          }
                          className={`${btnPrimary} !rounded-[10px] !px-3 shrink-0`}
                        >
                          {isSavingSubCategory ? (
                            <i className="bi bi-arrow-repeat animate-spin" />
                          ) : (
                            tr("Save", "حفظ")
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingSubCategory(false);
                            setNewSubCategoryInput("");
                          }}
                          className={`${btnGhost} !rounded-[10px] !px-2.5 shrink-0`}
                        >
                          <i className="bi bi-x-lg" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <select
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      className={inputClsR(false)}
                    >
                      {subCategories.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 2 ─── */}
        {step === 2 && (
          <div className="transition-all duration-300 ease-out">
            <div className="p-4 sm:p-5 rounded-[10px] bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] space-y-4">
              <div className="flex items-center justify-between">
                <span className={eyebrow}>
                  {tr(
                    "Step 2 · Media Gallery (Drop or Paste URL)",
                    "الخطوة ٢ · معرض الصور (إفلات أو لصق رابط)"
                  )}{" "}
                  <span className="text-[var(--color-status-red)]">*</span>
                </span>
                <span className="text-[11px] font-mono text-[var(--color-text-muted)]">
                  {images.length} {tr("media item(s)", "عنصر وسائط")}
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  onPaste={handleMediaPaste}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddImageUrl();
                    }
                  }}
                  placeholder={tr(
                    "Paste image URL(s) here (https://...)",
                    "الصق رابط الصورة أو عدة روابط هنا (https://...)"
                  )}
                  className={inputClsR(false)}
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  disabled={!imageUrlInput.trim()}
                  className={`${btnPrimary} !rounded-[10px] shrink-0`}
                >
                  <i className="bi bi-plus-lg" />
                  <span className="hidden sm:inline">{tr("Add", "إضافة")}</span>
                </button>
              </div>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingMedia(true);
                }}
                onDragLeave={() => setIsDraggingMedia(false)}
                onDrop={handleMediaDrop}
                onPaste={handleMediaPaste}
                className={`border-2 border-dashed rounded-[10px] p-4 text-center text-xs transition-all duration-200 ease-out ${isDraggingMedia
                  ? "border-[var(--color-primary-light)] bg-[var(--color-primary-light)]/10 text-[var(--color-primary-light)]"
                  : "border-[var(--color-border-subtle)] text-[var(--color-text-muted)]"
                  }`}
              >
                <i className="bi bi-cloud-arrow-up text-xl text-[var(--color-primary-light)] block mb-1" />
                <p className="font-semibold text-[var(--color-text-secondary)]">
                  {tr(
                    "Drag & drop image files or links here, or paste URLs",
                    "اسحب وأفلت ملفات الصور أو الروابط هنا، أو الصق الروابط"
                  )}
                </p>
                <p className="text-[10px] mt-0.5">
                  {tr(
                    "Add at least 1 image to continue to Step 3.",
                    "أضف صورة واحدة على الأقل للانتقال إلى الخطوة ٣."
                  )}
                </p>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 pt-1 transition-all duration-300 ease-out">
                  {images.map((img, idx) => (
                    <div
                      key={`${img}_${idx}`}
                      className="relative aspect-square rounded-[10px] overflow-hidden border border-[var(--color-border-subtle)] group bg-[var(--color-surface)] transition-transform duration-200 ease-out hover:scale-[1.02]"
                    >
                      <img
                        src={img}
                        alt={`Media ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 end-1 w-5 h-5 rounded-full bg-red-600/85 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out"
                        aria-label="Remove image"
                      >
                        <i className="bi bi-x text-xs" />
                      </button>
                      <span className="absolute bottom-0 inset-x-0 bg-black/65 text-white text-[8px] text-center font-bold py-0.5">
                        {idx === 0
                          ? tr("Main #1", "رئيسية #1")
                          : `#${idx + 1}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── STEP 3 ─── */}
        {step === 3 && (
          <div className="transition-all duration-300 ease-out">
            <div className="p-4 sm:p-5 rounded-[10px] bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className={eyebrow}>
                    {tr(
                      "Step 3 · Dynamic Variant Builder",
                      "الخطوة ٣ · منشئ المتغيرات الديناميكي"
                    )}
                  </span>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                    {tr(
                      `Total Variant Stock: ${totalStockQty}`,
                      `إجمالي مخزون المتغيرات: ${totalStockQty}`
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const allCollapsed = variants.every(
                        (item) => !!collapsedVariants[item.id]
                      );
                      const nextState: Record<string, boolean> = {};
                      variants.forEach((item) => {
                        nextState[item.id] = !allCollapsed;
                      });
                      setCollapsedVariants(nextState);
                    }}
                    className={`${btnGhost} !rounded-[10px] !px-2.5 !py-1 text-[11px]`}
                  >
                    {variants.every((item) => !!collapsedVariants[item.id])
                      ? tr("Expand All", "توسيع الكل")
                      : tr("Collapse All", "طي الكل")}
                  </button>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className={`${btnGhost} !rounded-[10px] !px-2.5 !py-1 text-xs shrink-0`}
                  >
                    <span>{tr("+ Add Variant", "+ إضافة متغير")}</span>
                  </button>
                </div>
              </div>

              {duplicateNotice && (
                <div
                  role="status"
                  className="p-2.5 rounded-[10px] flex items-center justify-between gap-2 text-xs bg-[var(--color-status-green-bg)] border border-[var(--color-status-green-border)] text-[var(--color-status-green)] transition-all duration-300 ease-out"
                >
                  <span className="flex items-center gap-2 font-bold">
                    <i className="bi bi-check2-circle shrink-0" />
                    {duplicateNotice}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDuplicateNotice(null)}
                    className="text-[11px] underline"
                  >
                    {tr("OK", "حسناً")}
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {variants.map((v, vIdx) => {
                  const rangeState = getRangeState(v);
                  const isCollapsed = !!collapsedVariants[v.id];
                  const linkedImgs =
                    v.imageUrls && v.imageUrls.length
                      ? v.imageUrls
                      : v.imageUrl
                        ? [v.imageUrl]
                        : [];
                  const activeMainImg =
                    v.mainImage || linkedImgs[0] || images[0] || "";

                  return (
                    <div
                      key={v.id}
                      ref={(el) => {
                        variantCardRefs.current[v.id] = el;
                      }}
                      className="p-4 rounded-[10px] bg-[var(--color-surface)] border border-[var(--color-border-subtle)] transition-all duration-300 ease-out"
                    >
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[var(--color-border-subtle)]">
                        <div className="flex items-center gap-2 min-w-0">
                          <button
                            type="button"
                            onClick={() => toggleCollapseVariant(v.id)}
                            className="w-6 h-6 rounded-[8px] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] flex items-center justify-center text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] shrink-0 transition-transform duration-200 ease-out"
                            aria-label={
                              isCollapsed
                                ? "Expand variant"
                                : "Collapse variant"
                            }
                          >
                            <i
                              className={`bi transition-transform duration-300 ease-out ${isCollapsed ? "bi-chevron-down" : "bi-chevron-up"
                                }`}
                            />
                          </button>
                          <span className="text-[11px] font-bold text-[var(--color-text-primary)] truncate">
                            {tr(`Variant #${vIdx + 1}`, `متغير #${vIdx + 1}`)}
                            {v.attribute ? ` · ${v.attribute}` : ""}
                            {v.color ? ` · ${v.color}` : ""}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleDuplicateVariant(v.id)}
                            className={`${btnGhost} !rounded-[8px] !px-2.5 !py-1 text-[11px] flex items-center gap-1`}
                            title={tr(
                              "Duplicate variant with all values and linked images",
                              "تكرار المتغير بكل بياناته والصور المرتبطة"
                            )}
                          >
                            <i className="bi bi-copy text-xs" />
                            <span>{tr("Duplicate", "تكرار")}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(v.id)}
                            disabled={variants.length <= 1}
                            className={btnIconDanger}
                            aria-label="Delete variant"
                          >
                            <i className="bi bi-trash3 text-xs" />
                          </button>
                        </div>
                      </div>

                      {/* Smooth Expand / Collapse Grid Transition */}
                      <div
                        className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out ${isCollapsed
                          ? "grid-rows-[0fr] opacity-0 mt-0"
                          : "grid-rows-[1fr] opacity-100 mt-4"
                          }`}
                      >
                        <div className="overflow-hidden space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3.5 items-start">
                            {/* Attribute Name */}
                            <div className="flex flex-col gap-1.5 relative">
                              <span className="block text-[9px] uppercase font-bold text-[var(--color-text-muted)] h-4 truncate">
                                {tr("Attribute Name", "اسم الخاصية")}
                              </span>
                              <input
                                type="text"
                                value={v.attributeName}
                                onFocus={() =>
                                  setOpenSuggestionMenu({
                                    variantId: v.id,
                                    field: "attrName",
                                  })
                                }
                                onBlur={() =>
                                  setTimeout(
                                    () => setOpenSuggestionMenu(null),
                                    140
                                  )
                                }
                                onChange={(e) =>
                                  handleUpdateVariant(
                                    v.id,
                                    "attributeName",
                                    e.target.value
                                  )
                                }
                                placeholder={tr("e.g. Size", "مثال: المقاس")}
                                className={inputClsR(false, "!py-1.5 !text-xs w-full")}
                              />
                              {openSuggestionMenu?.variantId === v.id &&
                                openSuggestionMenu?.field === "attrName" &&
                                attributeNameSuggestions.length > 0 && (
                                  <div className="absolute top-full inset-x-0 mt-1 z-30 rounded-[10px] bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] shadow-lg p-1.5 max-h-44 overflow-y-auto scroll-smooth space-y-0.5 transition-all duration-200 ease-out">
                                    {attributeNameSuggestions.map((s) => (
                                      <button
                                        key={s}
                                        type="button"
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          handleUpdateVariant(
                                            v.id,
                                            "attributeName",
                                            s
                                          );
                                          setOpenSuggestionMenu(null);
                                        }}
                                        className="w-full text-start px-2.5 py-1.5 rounded-[7px] text-xs font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-primary-light)]/15 hover:text-[var(--color-primary-light)] transition-colors duration-150 ease-out"
                                      >
                                        {s}
                                      </button>
                                    ))}
                                  </div>
                                )}
                            </div>

                            {/* Value (Single or Knowledge-Base Interval) */}
                            <div className="flex flex-col gap-1.5 relative">
                              <div className="flex items-center justify-between h-4">
                                <span className="block text-[9px] uppercase font-bold text-[var(--color-text-muted)] truncate">
                                  {tr("Value", "القيمة")}{" "}
                                  <span className="text-[var(--color-status-red)]">
                                    *
                                  </span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => toggleRangeMode(v)}
                                  className={`text-[9px] font-bold px-2 py-0.5 rounded-[4px] border transition-all duration-200 ease-out leading-none ${rangeState
                                    ? "bg-[var(--color-primary-light)] text-white border-[var(--color-primary-light)]"
                                    : "bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] border-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)]"
                                    }`}
                                >
                                  {rangeState
                                    ? tr("Single", "مفرد")
                                    : tr("Range", "نطاق")}
                                </button>
                              </div>

                              {rangeState ? (
                                <div className="space-y-1 transition-all duration-200 ease-out">
                                  <div className="flex items-center gap-1">
                                    <div className="relative flex-1">
                                      <input
                                        type="text"
                                        value={rangeState.from}
                                        onFocus={() =>
                                          setOpenSuggestionMenu({
                                            variantId: v.id,
                                            field: "rangeFrom",
                                          })
                                        }
                                        onBlur={() =>
                                          setTimeout(
                                            () => setOpenSuggestionMenu(null),
                                            140
                                          )
                                        }
                                        onChange={(e) =>
                                          updateRange(v, "from", e.target.value)
                                        }
                                        placeholder={tr(
                                          "From (e.g. s)",
                                          "من (مثال: s)"
                                        )}
                                        className={inputClsR(
                                          false,
                                          "!py-1.5 !text-xs w-full !px-2"
                                        )}
                                      />
                                      {openSuggestionMenu?.variantId === v.id &&
                                        openSuggestionMenu?.field ===
                                        "rangeFrom" && (
                                          <div className="absolute top-full inset-x-0 mt-1 z-30 rounded-[10px] bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] shadow-lg p-1 max-h-36 overflow-y-auto scroll-smooth space-y-0.5 transition-all duration-200 ease-out">
                                            {attributeValueSuggestions.map(
                                              (s) => (
                                                <button
                                                  key={s}
                                                  type="button"
                                                  onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    updateRange(v, "from", s);
                                                    setOpenSuggestionMenu(null);
                                                  }}
                                                  className="w-full text-start px-2 py-1 rounded-[6px] text-[11px] font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-primary-light)]/15 hover:text-[var(--color-primary-light)] transition-colors duration-150 ease-out"
                                                >
                                                  {s}
                                                </button>
                                              )
                                            )}
                                          </div>
                                        )}
                                    </div>

                                    <span className="text-[var(--color-text-muted)] text-xs shrink-0">
                                      –
                                    </span>

                                    <div className="relative flex-1">
                                      <input
                                        type="text"
                                        value={rangeState.to}
                                        onFocus={() =>
                                          setOpenSuggestionMenu({
                                            variantId: v.id,
                                            field: "rangeTo",
                                          })
                                        }
                                        onBlur={() =>
                                          setTimeout(
                                            () => setOpenSuggestionMenu(null),
                                            140
                                          )
                                        }
                                        onChange={(e) =>
                                          updateRange(v, "to", e.target.value)
                                        }
                                        placeholder={tr(
                                          "To (e.g. xl)",
                                          "إلى (مثال: xl)"
                                        )}
                                        className={inputClsR(
                                          false,
                                          "!py-1.5 !text-xs w-full !px-2"
                                        )}
                                      />
                                      {openSuggestionMenu?.variantId === v.id &&
                                        openSuggestionMenu?.field ===
                                        "rangeTo" && (
                                          <div className="absolute top-full inset-x-0 mt-1 z-30 rounded-[10px] bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] shadow-lg p-1 max-h-36 overflow-y-auto scroll-smooth space-y-0.5 transition-all duration-200 ease-out">
                                            {attributeValueSuggestions.map(
                                              (s) => (
                                                <button
                                                  key={s}
                                                  type="button"
                                                  onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    updateRange(v, "to", s);
                                                    setOpenSuggestionMenu(null);
                                                  }}
                                                  className="w-full text-start px-2 py-1 rounded-[6px] text-[11px] font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-primary-light)]/15 hover:text-[var(--color-primary-light)] transition-colors duration-150 ease-out"
                                                >
                                                  {s}
                                                </button>
                                              )
                                            )}
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                  {v.attribute && (
                                    <p className="text-[10px] font-mono text-[var(--color-primary-light)]">
                                      {v.attribute}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={v.attribute}
                                    onFocus={() =>
                                      setOpenSuggestionMenu({
                                        variantId: v.id,
                                        field: "attrValue",
                                      })
                                    }
                                    onBlur={() =>
                                      setTimeout(
                                        () => setOpenSuggestionMenu(null),
                                        140
                                      )
                                    }
                                    onChange={(e) =>
                                      handleUpdateVariant(
                                        v.id,
                                        "attribute",
                                        e.target.value
                                      )
                                    }
                                    placeholder={tr("e.g. M", "مثال: M")}
                                    className={inputClsR(
                                      false,
                                      "!py-1.5 !text-xs w-full"
                                    )}
                                  />
                                  {openSuggestionMenu?.variantId === v.id &&
                                    openSuggestionMenu?.field === "attrValue" &&
                                    attributeValueSuggestions.length > 0 && (
                                      <div className="absolute top-full inset-x-0 mt-1 z-30 rounded-[10px] bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] shadow-lg p-1.5 max-h-44 overflow-y-auto scroll-smooth space-y-0.5 transition-all duration-200 ease-out">
                                        {attributeValueSuggestions.map((s) => (
                                          <button
                                            key={s}
                                            type="button"
                                            onMouseDown={(e) => {
                                              e.preventDefault();
                                              handleUpdateVariant(
                                                v.id,
                                                "attribute",
                                                s
                                              );
                                              setOpenSuggestionMenu(null);
                                            }}
                                            className="w-full text-start px-2.5 py-1.5 rounded-[7px] text-xs font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-primary-light)]/15 hover:text-[var(--color-primary-light)] transition-colors duration-150 ease-out"
                                          >
                                            {s}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                </div>
                              )}
                            </div>

                            {/* Color & Image Color Reference Matching Dark Swatch UI */}
                            <div className="flex flex-col gap-2.5 sm:col-span-2 p-3.5 rounded-[14px] bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] transition-all duration-200 ease-out">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-text-muted)]">
                                  {tr(
                                    "Color & Image Color Reference",
                                    "اللون ومرجع اللون من الصورة"
                                  )}
                                </span>
                                {v.colorRefImage ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateVariant(
                                        v.id,
                                        "colorRefImage",
                                        ""
                                      )
                                    }
                                    className="text-[11px] font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors duration-200 ease-out"
                                  >
                                    {tr(
                                      "Use solid color picker instead",
                                      "اختيار لون صلب بدلاً من الصورة"
                                    )}
                                  </button>
                                ) : (
                                  <span className="text-[11px] font-semibold text-[var(--color-text-muted)]">
                                    {tr("Solid color picker", "منتقي لون صلب")}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3">
                                {v.colorRefImage ? (
                                  <img
                                    src={v.colorRefImage}
                                    alt="Color reference"
                                    className="w-10 h-10 rounded-full object-cover border border-[var(--color-border-subtle)] shrink-0 transition-transform duration-200 ease-out"
                                  />
                                ) : (
                                  <input
                                    type="color"
                                    value={v.colorHex || "#0F172A"}
                                    onChange={(e) => {
                                      const hex = e.target.value.toUpperCase();
                                      setVariants((prev) =>
                                        prev.map((item) =>
                                          item.id === v.id
                                            ? {
                                              ...item,
                                              colorHex: hex,
                                              colorRefImage: "",
                                              color:
                                                !item.color ||
                                                  item.color.startsWith("#") ||
                                                  item.color.includes("(#")
                                                  ? hex
                                                  : item.color,
                                            }
                                            : item
                                        )
                                      );
                                    }}
                                    aria-label="Pick solid variant color"
                                    className="matager-swatch-circle w-10 h-10 rounded-full cursor-pointer border border-[var(--color-border-subtle)] bg-transparent p-0 overflow-hidden shrink-0 transition-transform duration-200 ease-out hover:scale-105"
                                  />
                                )}

                                <input
                                  type="text"
                                  value={v.color}
                                  onChange={(e) =>
                                    handleUpdateVariant(
                                      v.id,
                                      "color",
                                      e.target.value
                                    )
                                  }
                                  placeholder={tr(
                                    "Color label or hex",
                                    "اسم اللون أو الكود"
                                  )}
                                  className={`${inputCls} !rounded-[12px] !py-2 !px-3.5 !text-xs font-semibold flex-1 min-w-[120px] transition-all duration-200 ease-out`}
                                />
                              </div>

                              {images.length > 0 && (
                                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                  <span className="text-[9px] text-[var(--color-text-muted)]">
                                    {tr(
                                      "Use image as reference:",
                                      "استخدام صورة كمرجع:"
                                    )}
                                  </span>
                                  {images.map((img, iIdx) => (
                                    <button
                                      key={`${v.id}_cref_${iIdx}`}
                                      type="button"
                                      onClick={() =>
                                        handleUseImageAsColorReference(
                                          v.id,
                                          img
                                        )
                                      }
                                      className={`px-2 py-1 rounded-[8px] text-[10px] font-bold border flex items-center gap-1.5 transition-all duration-200 ease-out ${v.colorRefImage === img
                                        ? "border-[var(--color-primary-light)] bg-[var(--color-primary-light)]/15 text-[var(--color-primary-light)]"
                                        : "border-[var(--color-border-subtle)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]"
                                        }`}
                                    >
                                      <img
                                        src={img}
                                        alt={`Ref ${iIdx + 1}`}
                                        className="w-4 h-4 rounded-full object-cover shrink-0"
                                      />
                                      <span>#{iIdx + 1}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Custom Variant Price Toggle Button */}
                            <div className="flex flex-col gap-1.5">
                              <span className="block text-[9px] uppercase font-bold text-[var(--color-text-muted)] h-4 truncate">
                                {tr("Variant Price", "سعر المتغير")}
                              </span>
                              <button
                                type="button"
                                disabled={hidePrice || askForPrice}
                                onClick={() =>
                                  handleUpdateVariant(
                                    v.id,
                                    "useCustomPrice",
                                    !v.useCustomPrice
                                  )
                                }
                                className={`w-full py-1.5 px-3 rounded-[10px] border text-xs font-bold flex items-center justify-between gap-2 transition-all duration-200 ease-out ${hidePrice || askForPrice
                                  ? "opacity-45 cursor-not-allowed border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]"
                                  : v.useCustomPrice
                                    ? "border-[var(--color-primary-light)] bg-[var(--color-primary-light)]/12 text-[var(--color-primary-light)]"
                                    : "border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] hover:border-[var(--color-border)]"
                                  }`}
                              >
                                <span className="truncate">
                                  {hidePrice || askForPrice
                                    ? tr("Ask for Price", "اطلب السعر")
                                    : v.useCustomPrice
                                      ? tr(
                                        "Custom Price Enabled",
                                        "سعر مخصص مفعل"
                                      )
                                      : tr(
                                        "Add custom price for this variant",
                                        "إضافة سعر مخصص لهذا المتغير"
                                      )}
                                </span>
                                <i
                                  className={`bi ${v.useCustomPrice
                                    ? "bi-check-circle-fill"
                                    : "bi-plus-circle"
                                    } text-xs shrink-0`}
                                />
                              </button>

                              {!hidePrice && !askForPrice && v.useCustomPrice && (
                                <input
                                  type="number"
                                  min="0"
                                  value={v.price ?? ""}
                                  onChange={(e) =>
                                    handleUpdateVariant(
                                      v.id,
                                      "price",
                                      e.target.value
                                    )
                                  }
                                  placeholder={String(price || "450")}
                                  className={inputClsR(
                                    false,
                                    "!py-1.5 !text-xs w-full mt-1"
                                  )}
                                />
                              )}
                            </div>

                            {/* Stock Qty (Placed BEFORE Link Images) */}
                            <div className="flex flex-col gap-1.5">
                              <span className="block text-[9px] uppercase font-bold text-[var(--color-text-muted)] h-4 truncate">
                                {tr("Stock Quantity", "كمية المخزون")}{" "}
                                <span className="text-[var(--color-status-red)]">
                                  *
                                </span>
                              </span>
                              <input
                                type="number"
                                min="0"
                                value={v.stockQty ?? ""}
                                onChange={(e) =>
                                  handleUpdateVariant(
                                    v.id,
                                    "stockQty",
                                    e.target.value === ""
                                      ? ""
                                      : Number(e.target.value)
                                  )
                                }
                                placeholder="0"
                                className={inputClsR(
                                  false,
                                  "!py-1.5 !text-xs w-full"
                                )}
                              />
                            </div>
                          </div>

                          {/* Combined Multi-Image Linking & Main Image Selection */}
                          <div className="pt-2 border-t border-[var(--color-border-subtle)] space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[9px] uppercase font-bold text-[var(--color-text-muted)]">
                                {tr(
                                  "Link Images (Multiple Allowed · Click Selected Again for Main)",
                                  "ربط الصور (عدة صور · اضغط مجدداً على المحددة لتعيينها كرئيسية)"
                                )}
                              </span>
                              <span className="text-[10px] font-mono text-[var(--color-primary-light)] shrink-0">
                                {linkedImgs.length} {tr("selected", "محددة")}
                              </span>
                            </div>

                            {images.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {images.map((img, imgIdx) => {
                                  const isLinked = linkedImgs.includes(img);
                                  const isMain = isLinked && activeMainImg === img;
                                  return (
                                    <button
                                      key={`${v.id}_img_${imgIdx}`}
                                      type="button"
                                      onClick={() =>
                                        handleClickVariantImageChip(v.id, img)
                                      }
                                      title={
                                        isMain
                                          ? tr(
                                            "Main image for this variant",
                                            "الصورة الرئيسية للمتغير"
                                          )
                                          : isLinked
                                            ? tr(
                                              "Click again to make this the Main image",
                                              "اضغط مجدداً لتعيينها كصورة رئيسية"
                                            )
                                            : tr(
                                              "Click to link this image",
                                              "اضغط لربط هذه الصورة"
                                            )
                                      }
                                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] border text-[11px] font-bold transition-all duration-200 ease-out ${isMain
                                        ? "bg-[var(--color-primary-light)]/15 border-2 border-blue-500 text-[var(--color-primary-light)]"
                                        : isLinked
                                          ? "bg-[var(--color-primary-light)]/12 border-[var(--color-primary-light)] text-[var(--color-primary-light)]"
                                          : "bg-[var(--color-surface-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:border-[var(--color-border)]"
                                        }`}
                                    >
                                      <img
                                        src={img}
                                        alt={`Thumb ${imgIdx + 1}`}
                                        className="w-5 h-5 rounded object-cover shrink-0"
                                      />
                                      <span>
                                        {tr(
                                          `Image #${imgIdx + 1}`,
                                          `صورة #${imgIdx + 1}`
                                        )}
                                      </span>
                                      {isMain && (
                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-500 text-white">
                                          {tr("Main", "رئيسية")}
                                        </span>
                                      )}
                                      {isLinked && !isMain && (
                                        <i className="bi bi-check-circle-fill text-xs" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-[11px] text-[var(--color-text-muted)]">
                                {tr(
                                  "No images added in Step 2 yet.",
                                  "لم تتم إضافة صور في الخطوة ٢ بعد."
                                )}
                              </p>
                            )}

                            {linkedImgs.length > 0 && (
                              <div className="p-2.5 rounded-[8px] bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] space-y-1.5 transition-all duration-300 ease-out">
                                <div className="flex items-center justify-between">
                                  <span className="block text-[9px] uppercase font-bold text-[var(--color-text-muted)]">
                                    {tr(
                                      "Linked Variant Images",
                                      "الصور المرتبطة بهذا المتغير"
                                    )}
                                  </span>
                                  <span className="text-[9px] text-[var(--color-text-muted)]">
                                    {tr(
                                      "Click thumbnail to set Main",
                                      "اضغط على الصورة لتعيينها كرئيسية"
                                    )}
                                  </span>
                                </div>
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                  {linkedImgs.map((linkedUrl, lIdx) => {
                                    const isMain = activeMainImg === linkedUrl;
                                    return (
                                      <div
                                        key={`${v.id}_linked_${lIdx}`}
                                        onClick={() =>
                                          handleClickVariantImageChip(
                                            v.id,
                                            linkedUrl
                                          )
                                        }
                                        className={`relative aspect-square rounded-[8px] overflow-hidden cursor-pointer bg-[var(--color-surface)] transition-all duration-200 ease-out ${isMain
                                          ? "border-2 border-blue-500"
                                          : "border border-[var(--color-border-subtle)]"
                                          }`}
                                      >
                                        <img
                                          src={linkedUrl}
                                          alt={`Linked ${lIdx + 1}`}
                                          className="w-full h-full object-cover"
                                        />
                                        {isMain && (
                                          <span className="absolute bottom-0 inset-x-0 bg-blue-500/90 text-white text-[8px] text-center font-bold py-0.5">
                                            {tr("Main", "رئيسية")}
                                          </span>
                                        )}
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleUnlinkVariantImage(
                                              v.id,
                                              linkedUrl
                                            );
                                          }}
                                          className="absolute top-0.5 end-0.5 w-4 h-4 rounded-full bg-black/75 text-white flex items-center justify-center transition-opacity duration-200 ease-out"
                                          aria-label="Unlink image"
                                        >
                                          <i className="bi bi-x text-[10px]" />
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 4 ─── */}
        {step === 4 && (
          <div className="space-y-4 transition-all duration-300 ease-out">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-primary)] font-subtitle mb-1">
                {tr(
                  "Notes / Special Instructions (Auto '-' per line)",
                  "ملاحظات أو تعليمات خاصة (إضافة '-' تلقائياً لكل سطر)"
                )}
              </label>
              <textarea
                ref={notesTextareaRef}
                rows={4}
                value={notes}
                onChange={handleNotesChange}
                onKeyDown={handleNotesKeyDown}
                placeholder={tr(
                  "- Wash at 30°C\n- Made from 100% Egyptian cotton",
                  "- يُغسل على درجة حرارة 30\n- مصنوع من قطن مصري 100%"
                )}
                className={inputClsR(false, "resize-none")}
              />
            </div>

            <div className="p-3.5 rounded-[10px] bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] flex items-center justify-between gap-3 transition-colors duration-200 ease-out">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-[10px] flex items-center justify-center bg-[var(--color-status-green-bg)] text-[var(--color-status-green)] border border-[var(--color-status-green-border)] shrink-0">
                  <i className="bi bi-truck text-sm" />
                </span>
                <div>
                  <p className="text-xs font-bold text-[var(--color-text-primary)]">
                    {tr(
                      "Offer Free Delivery on this item",
                      "توفير شحن وتوصيل مجاني لهذا المنتج"
                    )}
                  </p>
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    {tr(
                      "Item will show a Free Delivery badge on the storefront.",
                      "سيظهر وسام التوصيل المجاني على صفحة المتجر."
                    )}
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={freeDelivery}
                onChange={(e) => setFreeDelivery(e.target.checked)}
                className="w-5 h-5 rounded accent-[var(--color-primary-light)] cursor-pointer"
              />
            </div>

            {/* ── BUNDLE PACKAGES ── */}
            <div className="p-3.5 rounded-[10px] bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] space-y-3 transition-all duration-300 ease-out">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-[10px] flex items-center justify-center bg-[var(--color-primary-light)]/10 text-[var(--color-primary-light)] border border-[var(--color-primary-light)]/30 shrink-0">
                    <i className="bi bi-box-seam text-sm" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-[var(--color-text-primary)]">
                      {tr("Bundle Packages (Max 3)", "حزم البيع (بحد أقصى ٣)")}
                    </p>
                    <p className="text-[11px] text-[var(--color-text-muted)]">
                      {tr(
                        "Apply to a specific variant or all variants, compare against Qty × Price, and set total pay amount.",
                        "اختر متغيراً محدداً أو جميع المتغيرات، وقارن مع (الكمية × السعر) وحدد إجمالي الدفع."
                      )}
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={bundlesEnabled}
                  onChange={(e) => setBundlesEnabled(e.target.checked)}
                  className="w-5 h-5 rounded accent-[var(--color-primary-light)] cursor-pointer"
                />
              </div>

              {bundlesEnabled && (
                <div className="space-y-2 transition-all duration-300 ease-out">
                  {bundles.map((tier, idx) => {
                    const calc = calcBundlePreview(
                      tier.targetVariantId,
                      tier.qty,
                      tier.payAmount
                    );
                    const isPositive = calc && calc.hasPay && calc.pct > 0;
                    const isZero = calc && calc.hasPay && calc.pct === 0;

                    return (
                      <div
                        key={tier.id}
                        className="p-3 rounded-[10px] bg-[var(--color-surface)] border border-[var(--color-border-subtle)] space-y-3 transition-all duration-200 ease-out"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-text-muted)] flex items-center gap-1.5">
                            {tr(`Tier ${idx + 1}`, `المستوى ${idx + 1}`)}
                            {tier.freeShipping && (
                              <span className="px-1.5 py-0.5 rounded-full bg-[var(--color-status-green-bg)] text-[var(--color-status-green)] border border-[var(--color-status-green-border)] text-[9px] font-bold flex items-center gap-1">
                                <i className="bi bi-truck text-[9px]" />
                                {tr("Free Shipping", "شحن مجاني")}
                              </span>
                            )}
                          </span>
                          {bundles.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeBundleTier(tier.id)}
                              className="w-6 h-6 rounded-[10px] flex items-center justify-center text-[var(--color-status-red)] hover:bg-[var(--color-status-red-bg)] transition-colors duration-200 ease-out"
                              aria-label="Remove tier"
                            >
                              <i className="bi bi-trash3 text-xs" />
                            </button>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <span className="block text-[10px] font-bold text-[var(--color-text-primary)]">
                            {tr(
                              "Apply Bundle To (Variant or All)",
                              "تطبيق الحزمة على (متغير أو الكل)"
                            )}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                updateBundleTier(
                                  tier.id,
                                  "targetVariantId",
                                  "all"
                                )
                              }
                              className={`px-3 py-1.5 rounded-[8px] text-[11px] font-bold border transition-all duration-200 ease-out ${(tier.targetVariantId || "all") === "all"
                                ? "bg-[var(--color-primary-light)] text-white border-[var(--color-primary-light)] shadow-xs"
                                : "bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border)]"
                                }`}
                            >
                              {tr("All Variants", "جميع المتغيرات")}
                            </button>
                            {variants.map((vr, vPos) => {
                              const selected = tier.targetVariantId === vr.id;
                              return (
                                <button
                                  key={vr.id}
                                  type="button"
                                  onClick={() =>
                                    updateBundleTier(
                                      tier.id,
                                      "targetVariantId",
                                      vr.id
                                    )
                                  }
                                  className={`px-3 py-1.5 rounded-[8px] text-[11px] font-bold border transition-all duration-200 ease-out ${selected
                                    ? "bg-[var(--color-primary-light)] text-white border-[var(--color-primary-light)] shadow-xs"
                                    : "bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border)]"
                                    }`}
                                >
                                  {tr(
                                    `#${vPos + 1} ${vr.attribute || vr.color || ""}`.trim(),
                                    `#${vPos + 1} ${vr.attribute || vr.color || ""}`.trim()
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-[var(--color-text-primary)] mb-0.5">
                              {tr("Quantity (Buy X)", "الكمية (اشترِ)")}
                            </label>
                            <input
                              type="number"
                              min="2"
                              value={tier.qty}
                              onChange={(e) =>
                                updateBundleTier(
                                  tier.id,
                                  "qty",
                                  e.target.value === ""
                                    ? ""
                                    : Number(e.target.value)
                                )
                              }
                              placeholder="2"
                              className={inputClsR(false)}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-[var(--color-text-primary)] mb-0.5">
                              {tr(
                                "Total Amount to Pay (EGP)",
                                "المبلغ الإجمالي للدفع (ج.م)"
                              )}
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={tier.payAmount}
                              onChange={(e) =>
                                updateBundleTier(
                                  tier.id,
                                  "payAmount",
                                  e.target.value === ""
                                    ? ""
                                    : Number(e.target.value)
                                )
                              }
                              placeholder={calc ? String(calc.original) : "1080"}
                              className={inputClsR(false)}
                            />
                          </div>
                        </div>

                        {calc && (
                          <div className="p-2 rounded-[10px] bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] text-[11px] flex items-center justify-between gap-2 transition-all duration-200 ease-out">
                            <span className="font-mono text-[var(--color-text-secondary)]">
                              {tr(
                                `Bundle Price (${calc.q} × ${calc.unit}):`,
                                `سعر الحزمة (${calc.q} × ${calc.unit}):`
                              )}
                            </span>
                            <span className="font-bold text-[var(--color-text-primary)]">
                              {calc.original} EGP
                            </span>
                          </div>
                        )}

                        {calc && calc.hasPay && (
                          <div
                            className={`p-2 rounded-[10px] text-[11px] flex items-center justify-between gap-2 transition-all duration-200 ease-out ${isPositive
                              ? "bg-[var(--color-status-green-bg)] border border-[var(--color-status-green-border)] text-[var(--color-status-green)]"
                              : isZero
                                ? "bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]"
                                : "bg-[var(--color-status-red-bg)] border border-[var(--color-status-red-border)] text-[var(--color-status-red)]"
                              }`}
                          >
                            <span className="font-bold">
                              {isPositive
                                ? tr(
                                  `Buy ${tier.qty} → Pay ${tier.payAmount} EGP (was ${calc.original})`,
                                  `اشترِ ${tier.qty} → ادفع ${tier.payAmount} ج.م (بدلاً من ${calc.original})`
                                )
                                : isZero
                                  ? tr(
                                    "No discount on this tier.",
                                    "لا يوجد خصم في هذا المستوى."
                                  )
                                  : tr(
                                    `Amount exceeds original (${calc.original} EGP).`,
                                    `المبلغ أكبر من الأصلي (${calc.original} ج.م).`
                                  )}
                            </span>
                            {isPositive && (
                              <span className="px-2 py-0.5 rounded-full bg-[var(--color-status-green)] text-white font-bold text-[10px] whitespace-nowrap">
                                −{Math.round(calc.pct)}%
                              </span>
                            )}
                          </div>
                        )}

                        <label
                          className={`flex items-center justify-between gap-2 p-2 rounded-[10px] border cursor-pointer transition-all duration-200 ease-out ${tier.freeShipping
                            ? "bg-[var(--color-status-green-bg)] border-[var(--color-status-green-border)]"
                            : "bg-[var(--color-surface-elevated)] border-[var(--color-border-subtle)] hover:border-[var(--color-border)]"
                            }`}
                        >
                          <span className="text-[11px] font-bold text-[var(--color-text-secondary)]">
                            {tr(
                              "Free shipping with this bundle",
                              "شحن مجاني مع هذه الحزمة"
                            )}
                          </span>
                          <input
                            type="checkbox"
                            checked={tier.freeShipping}
                            onChange={(e) =>
                              updateBundleTier(
                                tier.id,
                                "freeShipping",
                                e.target.checked
                              )
                            }
                            className="w-4 h-4 rounded accent-[var(--color-status-green)] cursor-pointer"
                          />
                        </label>
                      </div>
                    );
                  })}

                  {bundles.length < MAX_BUNDLES && (
                    <button
                      type="button"
                      onClick={addBundleTier}
                      className={`${btnGhost} !rounded-[10px] w-full !py-2 text-xs`}
                    >
                      <span>
                        {tr(
                          `+ Add Bundle Tier (${bundles.length}/${MAX_BUNDLES})`,
                          `+ إضافة مستوى (${bundles.length}/${MAX_BUNDLES})`
                        )}
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── PROMO CODE ── */}
            <div className="p-3.5 rounded-[10px] bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-primary)] font-subtitle mb-1">
                    {tr("Promo Code", "كود الخصم")}
                  </label>
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="SUMMER40"
                    className={inputClsR(false, "font-mono tracking-wider")}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-primary)] font-subtitle mb-1">
                    {tr("Discount % (Optional)", "نسبة الخصم % (اختياري)")}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={promoDiscountPercent}
                    onChange={(e) =>
                      setPromoDiscountPercent(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    placeholder="15"
                    className={inputClsR(false)}
                  />
                </div>
              </div>
            </div>

            {/* ── ATTACH MANUAL ── */}
            <div className="p-3.5 rounded-[10px] bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--color-text-primary)]">
                  {tr(
                    "Attach Size Chart / Manual",
                    "إرفاق دليل المقاسات أو الكتالوج"
                  )}
                </span>
                {attachedManual ? (
                  <span className="text-xs font-mono text-[var(--color-status-green)] truncate max-w-[140px]">
                    {attachedManual}
                  </span>
                ) : null}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={attachedManual}
                  onChange={(e) => setAttachedManual(e.target.value)}
                  placeholder={tr(
                    "e.g. Size-Chart-2026.pdf",
                    "مثال: دليل-المقاسات-2026.pdf"
                  )}
                  className={inputClsR(false)}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!attachedManual)
                      setAttachedManual("Size-Chart-Standard.pdf");
                  }}
                  className={`${btnGhost} !rounded-[10px] shrink-0`}
                >
                  <i className="bi bi-paperclip" />
                  <span className="hidden sm:inline">
                    {tr("Attach", "إرفاق")}
                  </span>
                </button>
              </div>
            </div>

            {/* ── SUMMARY ── */}
            <div className="p-3 rounded-[10px] bg-[var(--color-surface)] border border-[var(--color-border-subtle)] text-xs space-y-1">
              <div className="flex justify-between gap-2">
                <span className="text-[var(--color-text-muted)]">
                  {tr("Target Path:", "مسار الحفظ:")}
                </span>
                <span className="font-mono text-[10px] text-[var(--color-text-primary)] truncate">
                  stores/{effectiveOwnerUid}/products
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[var(--color-text-muted)]">
                  {tr("Price Mode:", "وضع السعر:")}
                </span>
                <span className="font-bold text-[var(--color-text-primary)]">
                  {hidePrice || askForPrice
                    ? tr("Ask for Price", "اطلب السعر")
                    : `${Number(price) || 0} EGP`}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[var(--color-text-muted)]">
                  {tr("Classification:", "التصنيف:")}
                </span>
                <span className="font-bold text-[var(--color-text-primary)] truncate">
                  {baseCategory} &gt; {subCategory}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[var(--color-text-muted)]">
                  {tr("Total Stock:", "إجمالي المخزون:")}
                </span>
                <span className="font-bold text-[var(--color-text-primary)]">
                  {totalStockQty}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[var(--color-text-muted)]">
                  {tr("Variants:", "المتغيرات:")}
                </span>
                <span className="font-bold text-[var(--color-text-primary)]">
                  {variants.length} {tr("rows", "خيارات")}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[var(--color-text-muted)]">
                  {tr("Bundle Free Shipping:", "شحن مجاني للحزم:")}
                </span>
                <span className="font-bold text-[var(--color-text-primary)]">
                  {bundlesEnabled && freeShippingTierCount > 0
                    ? `${freeShippingTierCount} ${tr("tier(s)", "مستويات")}`
                    : tr("None", "بدون")}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── FOOTER ─── */}
      <div className="px-4 sm:px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-[var(--color-border-subtle)] bg-[var(--color-surface)] flex flex-wrap items-center justify-between gap-2 shrink-0 sticky bottom-0 z-10">
        <div className="flex items-center gap-2">
          {step === 1 ? (
            <button
              type="button"
              onClick={handleCloseWizard}
              className={`${btnGhost} !rounded-[10px]`}
            >
              {tr("Cancel", "إلغاء")}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4)}
              disabled={isSubmitting || isSavingDraft}
              className={`${btnGhost} !rounded-[10px]`}
            >
              <i
                className={`bi ${isRtl ? "bi-arrow-right" : "bi-arrow-left"}`}
              />
              <span>{tr("Back", "الرجوع")}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSavingDraft || isSubmitting}
            className={`${btnGhost} !rounded-[10px] border border-[var(--color-border-subtle)]`}
          >
            {isSavingDraft ? (
              <>
                <i className="bi bi-arrow-repeat animate-spin" />
                <span>{tr("Drafting...", "حفظ المسودة...")}</span>
              </>
            ) : (
              <>
                <i className="bi bi-file-earmark-check" />
                <span>{tr("Save Draft", "حفظ كمسودة")}</span>
              </>
            )}
          </button>
        </div>

        {step < 4 ? (
          <button
            type="button"
            onClick={handleNextStep}
            disabled={isCurrentStepNextDisabled}
            className={`${btnPrimary} !rounded-[10px] disabled:opacity-45 disabled:cursor-not-allowed transition-all duration-200 ease-out`}
          >
            <span>{nextStepLabel}</span>
            <i
              className={`bi ${isRtl ? "bi-arrow-left" : "bi-arrow-right"}`}
            />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinalSubmit}
            disabled={isSubmitting || isSavingDraft}
            className={`${btnPrimary} !rounded-[10px] transition-all duration-200 ease-out`}
          >
            {isSubmitting ? (
              <>
                <i className="bi bi-arrow-repeat animate-spin" />
                <span>{tr("Publishing...", "جاري النشر...")}</span>
              </>
            ) : (
              <>
                <i className="bi bi-check2-circle" />
                <span>{tr("Publish Product", "حفظ ونشر المنتج")}</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};