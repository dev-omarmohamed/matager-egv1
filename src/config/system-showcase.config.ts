/**
 * System Showcase Gallery Configuration
 *
 * Configures the 2 opposite horizontal infinite scrolling tracks of images:
 * - Row 1: Core System Screens (Storefront, Dashboard, POS, Inventory, Wholesaler Portal, Ledger)
 * - Row 2: Modals, Drawers & Select Controls (Auth Modal, Wholesale Inquiry, Calculator, POS Dialogs, etc.)
 *
 * To activate a screenshot, place the image in `/public/showcase/{id}.webp` and set its `src` string here.
 * When `src` is null, an elegant, dual-theme hardware wireframe slot is displayed.
 */

export interface ShowcaseSlot {
  id: string;
  titleEn: string;
  titleAr: string;
  categoryEn: string;
  categoryAr: string;
  tag: string;
  src: string | null;
  aspectRatio: string;
}

export const SHOWCASE_ROW_1_SCREENS: ShowcaseSlot[] = [
  {
    id: "screen_storefront",
    titleEn: "Consumer Omnichannel Storefront",
    titleAr: "واجهة متجر العملاء الموحدة",
    categoryEn: "Storefront View",
    categoryAr: "واجهة المتجر",
    tag: "STOREFRONT",
    src: null,
    aspectRatio: "16 / 10",
  },
  {
    id: "screen_dashboard",
    titleEn: "Store Owner Command Dashboard",
    titleAr: "لوحة تحكم وقيادة التاجر",
    categoryEn: "Telemetry & Operations",
    categoryAr: "إدارة العمليات",
    tag: "DASHBOARD",
    src: null,
    aspectRatio: "16 / 10",
  },
  {
    id: "screen_pos",
    titleEn: "POS Cashier Terminal & Barcode Scanner",
    titleAr: "نظام كاشير نقاط البيع ومسح الباركود",
    categoryEn: "Countertop Hardware",
    categoryAr: "شاشة الكاشير",
    tag: "POS_TERMINAL",
    src: null,
    aspectRatio: "16 / 10",
  },
  {
    id: "screen_inventory",
    titleEn: "Live Multi-Branch Inventory Matrix",
    titleAr: "مصفوفة تتبع المخزون اللحظية متعددة الفروع",
    categoryEn: "Inventory Logistics",
    categoryAr: "إدارة المخزون",
    tag: "INVENTORY",
    src: null,
    aspectRatio: "16 / 10",
  },
  {
    id: "screen_wholesaler",
    titleEn: "B2B Wholesaler Supply & Catalog Hub",
    titleAr: "شبكة وكتالوج توريد الجملة والمصانع",
    categoryEn: "B2B Wholesale",
    categoryAr: "شبكة الجملة",
    tag: "WHOLESALE",
    src: null,
    aspectRatio: "16 / 10",
  },
  {
    id: "screen_ledger",
    titleEn: "Financial Ledger & Multi-Rail Settlements",
    titleAr: "دفتر القيود المالية والتسويات اللحظية",
    categoryEn: "Financial Engine",
    categoryAr: "الدفتر المالي",
    tag: "FINANCIAL",
    src: null,
    aspectRatio: "16 / 10",
  },
];

export const SHOWCASE_ROW_2_MODALS: ShowcaseSlot[] = [
  {
    id: "modal_auth",
    titleEn: "Unified Identity & Role Portal",
    titleAr: "بوابة تسجيل الدخول والمصادقة الموحدة",
    categoryEn: "Access Modal",
    categoryAr: "نافذة الدخول",
    tag: "AUTH_MODAL",
    src: null,
    aspectRatio: "16 / 10",
  },
  {
    id: "modal_wholesale_inquiry",
    titleEn: "Wholesale Trade Inquiry & Rate Limiting",
    titleAr: "نافذة طلب توريد تجارة الجملة والمصانع",
    categoryEn: "B2B Inquiry Modal",
    categoryAr: "طلب توريد",
    tag: "INQUIRY_MODAL",
    src: null,
    aspectRatio: "16 / 10",
  },
  {
    id: "modal_plan_calculator",
    titleEn: "5-Stop Interactive Volume Calculator",
    titleAr: "حاسبة الباقات التفاعلية المتدرجة",
    categoryEn: "Pricing Configurator",
    categoryAr: "حاسبة الأسعار",
    tag: "CALCULATOR",
    src: null,
    aspectRatio: "16 / 10",
  },
  {
    id: "modal_pos_payment",
    titleEn: "POS Quick-Cash & Mada Split Payment",
    titleAr: "نافذة الدفع السريع والتقسيم في الكاشير",
    categoryEn: "Cashier Payment Modal",
    categoryAr: "نافذة الدفع",
    tag: "PAYMENT_MODAL",
    src: null,
    aspectRatio: "16 / 10",
  },
  {
    id: "modal_download_app",
    titleEn: "Cross-Platform QR Code & App Download",
    titleAr: "نافذة رمز الاستجابة السريعة وتحميل التطبيق",
    categoryEn: "Download Dialog",
    categoryAr: "تحميل التطبيق",
    tag: "APP_DOWNLOAD",
    src: null,
    aspectRatio: "16 / 10",
  },
  {
    id: "modal_product_variants",
    titleEn: "SKU Variant Matrix & Attribute Select",
    titleAr: "محدد الخيارات والخصائص المتعددة للمنتج",
    categoryEn: "Select Controls",
    categoryAr: "خيارات المنتج",
    tag: "VARIANT_SELECT",
    src: null,
    aspectRatio: "16 / 10",
  },
];

