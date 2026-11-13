/**
 * Device Showcase Surfaces Configuration
 *
 * Configures the 4 devices shown side-by-side:
 * 1. Mobile Phone
 * 2. Tablet
 * 3. Desktop Monitor
 * 4. POS Terminal
 *
 * All slots initialized to `src: null`. To activate an image, set its `src` string.
 */

export type DeviceKey = "mobile" | "tablet" | "desktop" | "pos";
export type SupportedLang = "en" | "ar";

export interface DeviceVariant {
  src: string | null;
  width: number;
  height: number;
  alt: {
    en: string;
    ar: string;
  };
}

export interface DeviceItemConfig {
  id: DeviceKey;
  aspectRatio: string;
  width: number;
  height: number;
  variants: Record<SupportedLang, { src: string | null; width: number; height: number }>;
  alt: {
    en: string;
    ar: string;
  };
}

export const SHOW_SLOT_LABELS = false;

export const DEVICES_CONFIG: Record<DeviceKey, DeviceItemConfig> = {
  mobile: {
    id: "mobile",
    aspectRatio: "390 / 844",
    width: 390,
    height: 844,
    variants: {
      en: { src: null, width: 390, height: 844 },
      ar: { src: null, width: 390, height: 844 },
    },
    alt: {
      en: "Matager Mobile Consumer Storefront",
      ar: "واجهة متجر متاجر للجوال",
    },
  },
  tablet: {
    id: "tablet",
    aspectRatio: "3 / 4",
    width: 768,
    height: 1024,
    variants: {
      en: { src: null, width: 768, height: 1024 },
      ar: { src: null, width: 768, height: 1024 },
    },
    alt: {
      en: "Matager Warehouse and Floor Tablet",
      ar: "جهاز لوحي لإدارة المخازن والمبيعات",
    },
  },
  desktop: {
    id: "desktop",
    aspectRatio: "16 / 10",
    width: 1600,
    height: 1000,
    variants: {
      en: { src: null, width: 1600, height: 1000 },
      ar: { src: null, width: 1600, height: 1000 },
    },
    alt: {
      en: "Matager HQ Command Center Desktop Monitor",
      ar: "شاشة القيادة الرئيسية لمتجر متاجر",
    },
  },
  pos: {
    id: "pos",
    aspectRatio: "4 / 3",
    width: 1024,
    height: 768,
    variants: {
      en: { src: null, width: 1024, height: 768 },
      ar: { src: null, width: 1024, height: 768 },
    },
    alt: {
      en: "Matager Cashier POS Terminal Register",
      ar: "ماكينة كاشير نقاط البيع POS من متاجر",
    },
  },
};

/**
 * Fallback Chain:
 * 1. Requested lang on device
 * 2. Same device in EN
 * 3. Empty slot (null)
 */
export function getDeviceVariant(deviceId: DeviceKey, lang: SupportedLang) {
  const device = DEVICES_CONFIG[deviceId];
  if (!device) return { src: null, width: 800, height: 600, alt: "" };

  const requested = device.variants[lang];
  if (requested && requested.src) {
    return {
      src: requested.src,
      width: requested.width,
      height: requested.height,
      alt: device.alt[lang] || device.alt.en,
    };
  }

  const enFallback = device.variants.en;
  if (enFallback && enFallback.src) {
    return {
      src: enFallback.src,
      width: enFallback.width,
      height: enFallback.height,
      alt: device.alt.en,
    };
  }

  return {
    src: null,
    width: device.width,
    height: device.height,
    alt: device.alt[lang] || device.alt.en,
  };
}
