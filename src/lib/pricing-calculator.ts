/**
 * Pure Pricing Calculation Engine for Matager Subscription Plans
 */

export const YEARLY_DISCOUNT = 0.10; // 10% annual discount
export const POS_TERMINAL_PRICE = 150; // 150 EGP per month per terminal for catalog add-on
export const POS_ONLY_TERMINAL_PRICE = 200; // 200 EGP per month per terminal in POS-only mode

export type PlanId = "tier_1" | "tier_2" | "tier_3" | "tier_4" | "tier_5" | "pos_only";
export type BillingCycle = "monthly" | "yearly";
export type PricingMode = "catalog" | "pos_only";

export interface PlanDefinition {
  id: PlanId;
  name: string;
  nameAr: string;
  range: string;
  rangeAr: string;
  monthlyBasePrice: number;
  freePosCount: number;
  capabilities: string[];
  capabilitiesAr: string[];
}

export const PRICING_PLANS: PlanDefinition[] = [
  {
    id: "tier_1",
    name: "Starter Micro",
    nameAr: "البداية المصغرة",
    range: "5-20",
    rangeAr: "5-20",
    monthlyBasePrice: 170,
    freePosCount: 0,
    capabilities: [
      "Up to 20 active catalog products",
      "Customer web storefront",
      "Real-time cloud database sync",
      "Standard payment gateway integration",
    ],
    capabilitiesAr: [
      "سعة حتى 20 منتج نشط",
      "متجر إلكتروني فوري للعملاء",
      "مزامنة سحابية حية للبيانات",
      "ربط مع بوابات الدفع الإلكتروني",
    ],
  },
  {
    id: "tier_2",
    name: "Starter Plus",
    nameAr: "البداية بلس",
    range: "20-50",
    rangeAr: "20-50",
    monthlyBasePrice: 270,
    freePosCount: 0,
    capabilities: [
      "Up to 50 active catalog products",
      "Automated stock-out alerts",
      "Standard sales performance telemetry",
      "Integrated shipping courier dispatch",
    ],
    capabilitiesAr: [
      "سعة حتى 50 منتج نشط",
      "تنبيهات فورية لنواقص المخزون",
      "تقارير قياسية للأداء والعمليات",
      "ربط مباشر مع شركات الشحن",
    ],
  },
  {
    id: "tier_3",
    name: "Commerce Pro",
    nameAr: "التجاري المتقدم",
    range: "50-100",
    rangeAr: "50-100",
    monthlyBasePrice: 570,
    freePosCount: 0,
    capabilities: [
      "Up to 100 active catalog products",
      "Category-gated Wholesaler pricing",
      "Advanced sales telemetry & analytics",
      "Priority cloud processing queue",
      "Automated tax and invoicing engine",
    ],
    capabilitiesAr: [
      "سعة حتى 100 منتج نشط",
      "وصول حصري لأسعار موردي الجملة",
      "تحليلات ومؤشرات أداء متقدمة",
      "أولوية المعالجة السحابية الفورية",
      "فواتير وضريبة إلكترونية مؤتمتة",
    ],
  },
  {
    id: "tier_4",
    name: "Scale Growth",
    nameAr: "نمو التوسع",
    range: "100-300",
    rangeAr: "100-300",
    monthlyBasePrice: 970,
    freePosCount: 0,
    capabilities: [
      "Up to 300 active catalog products",
      "Full B2B Wholesaler Catalog access",
      "Multi-branch routing engine ready",
      "Automated electronic tax authority filing",
      "Staff permissions and audit logs",
    ],
    capabilitiesAr: [
      "سعة حتى 300 منتج نشط",
      "كتالوج الموردين B2B بالكامل",
      "جاهز لإدارة الفروع المتعددة والتوجيه",
      "فواتير معتمدة وضريبة مبيعات مؤتمتة",
      "صلاحيات وسجلات رقابة للموظفين",
    ],
  },
  {
    id: "tier_5",
    name: "Enterprise Flagship",
    nameAr: "المؤسسي الرائد",
    range: "300-550",
    rangeAr: "300-550",
    monthlyBasePrice: 1500,
    freePosCount: 2, // 2 Free POS included
    capabilities: [
      "300 to 550 catalog products (maximum)",
      "2 Free POS cashier registers included",
      "Unlimited staff seats & manager logins",
      "VIP B2B wholesale supply priority",
      "Dedicated account engineer & SLA support",
    ],
    capabilitiesAr: [
      "سعة 300 حتى 550 منتج (الحد الأقصى)",
      "نقطتا بيع POS كاشير مجاناً بالكامل",
      "عدد غير محدود من الموظفين والفروع",
      "أولوية توريد B2B استثنائية",
      "مهندس دعم فني مخصص مع اتفاقية SLA",
    ],
  },
];

export interface PosOnlyPlanDefinition {
  id: "pos_only";
  name: string;
  nameAr: string;
  pricePerTerminal: number;
  capabilities: string[];
  capabilitiesAr: string[];
}

export const POS_ONLY_PLAN: PosOnlyPlanDefinition = {
  id: "pos_only",
  name: "POS & Admin Only",
  nameAr: "نقاط البيع ولوحة الإدارة فقط",
  pricePerTerminal: POS_ONLY_TERMINAL_PRICE,
  capabilities: [
    "Dedicated POS Cashier Terminal software",
    "Full Store Admin Command Center",
    "Offline-ready barcode scanning & receipt printing",
    "Shift reports, cash drawers & staff permissions",
    "Automated e-invoices and tax compliance",
    "Real-time cloud database synchronization",
  ],
  capabilitiesAr: [
    "برنامج كاشير نقاط بيع POS فائق السرعة",
    "لوحة تحكم إدارية متكاملة للمخزن والمبيعات",
    "عمل كامل أوفلاين مع طباعة الباركود والإيصالات",
    "تقارير الورديات، خزينة الكاشير وصلاحيات الموظفين",
    "فواتير إلكترونية وضريبة معتمدة تلقائياً",
    "مزامنة سحابية حية وآمنة لكافة الأجهزة",
  ],
};

export interface PlanTotalInput {
  planId?: PlanId;
  billing: BillingCycle;
  posCount: number;
  mode?: PricingMode;
}

export interface PlanTotalOutput {
  planBaseMonthly: number;
  billablePosCount: number;
  posMonthlyTotal: number;
  grossMonthlyTotal: number;
  monthlyDiscount: number;
  netMonthlyTotal: number;
  yearlyGrossTotal: number;
  yearlySavings: number;
  yearlyNetTotal: number;
}

export function calculatePlanTotal(input: PlanTotalInput): PlanTotalOutput {
  // Mode: POS & Admin Dashboard only (200 EGP / per month per POS terminal, 10% off yearly)
  if (input.mode === "pos_only" || input.planId === "pos_only") {
    const termCount = Math.max(1, Math.min(50, input.posCount || 1));
    const grossMonthly = termCount * POS_ONLY_TERMINAL_PRICE;

    if (input.billing === "yearly") {
      const monthlyDiscount = grossMonthly * YEARLY_DISCOUNT;
      const netMonthlyTotal = grossMonthly - monthlyDiscount;
      const yearlyGrossTotal = grossMonthly * 12;
      const yearlySavings = yearlyGrossTotal * YEARLY_DISCOUNT;
      const yearlyNetTotal = yearlyGrossTotal - yearlySavings;

      return {
        planBaseMonthly: 0,
        billablePosCount: termCount,
        posMonthlyTotal: grossMonthly,
        grossMonthlyTotal: grossMonthly,
        monthlyDiscount,
        netMonthlyTotal,
        yearlyGrossTotal,
        yearlySavings,
        yearlyNetTotal,
      };
    }

    return {
      planBaseMonthly: 0,
      billablePosCount: termCount,
      posMonthlyTotal: grossMonthly,
      grossMonthlyTotal: grossMonthly,
      monthlyDiscount: 0,
      netMonthlyTotal: grossMonthly,
      yearlyGrossTotal: grossMonthly * 12,
      yearlySavings: 0,
      yearlyNetTotal: grossMonthly * 12,
    };
  }

  // Standard Catalog Mode (5-20, 20-50, 50-100, 100-300, 300-550)
  const plan = PRICING_PLANS.find((p) => p.id === input.planId) || PRICING_PLANS[0];
  const posCount = Math.max(0, Math.min(20, input.posCount || 0));

  // Determine billable POS count
  const billablePosCount = Math.max(0, posCount - plan.freePosCount);
  const posMonthlyTotal = billablePosCount * POS_TERMINAL_PRICE;

  const grossMonthlyTotal = plan.monthlyBasePrice + posMonthlyTotal;

  if (input.billing === "yearly") {
    const monthlyDiscount = grossMonthlyTotal * YEARLY_DISCOUNT;
    const netMonthlyTotal = grossMonthlyTotal - monthlyDiscount;
    const yearlyGrossTotal = grossMonthlyTotal * 12;
    const yearlySavings = yearlyGrossTotal * YEARLY_DISCOUNT;
    const yearlyNetTotal = yearlyGrossTotal - yearlySavings;

    return {
      planBaseMonthly: plan.monthlyBasePrice,
      billablePosCount,
      posMonthlyTotal,
      grossMonthlyTotal,
      monthlyDiscount,
      netMonthlyTotal,
      yearlyGrossTotal,
      yearlySavings,
      yearlyNetTotal,
    };
  }

  // Monthly billing
  return {
    planBaseMonthly: plan.monthlyBasePrice,
    billablePosCount,
    posMonthlyTotal,
    grossMonthlyTotal,
    monthlyDiscount: 0,
    netMonthlyTotal: grossMonthlyTotal,
    yearlyGrossTotal: grossMonthlyTotal * 12,
    yearlySavings: 0,
    yearlyNetTotal: grossMonthlyTotal * 12,
  };
}

