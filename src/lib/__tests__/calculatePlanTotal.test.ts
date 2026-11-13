import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calculatePlanTotal,
  PRICING_PLANS,
  YEARLY_DISCOUNT,
  POS_TERMINAL_PRICE,
} from "../pricing-calculator";

test("calculatePlanTotal - each plan monthly base pricing", () => {
  const expectedPrices: Record<string, number> = {
    tier_1: 170,
    tier_2: 270,
    tier_3: 570,
    tier_4: 970,
    tier_5: 1500,
  };

  for (const plan of PRICING_PLANS) {
    const res = calculatePlanTotal({
      planId: plan.id,
      billing: "monthly",
      posCount: 0,
    });
    assert.equal(res.netMonthlyTotal, expectedPrices[plan.id]);
    assert.equal(res.monthlyDiscount, 0);
    assert.equal(res.billablePosCount, 0);
  }
});

test("calculatePlanTotal - yearly billing 10% discount across plans", () => {
  const resTier1 = calculatePlanTotal({
    planId: "tier_1",
    billing: "yearly",
    posCount: 0,
  });
  // 170 monthly * 12 = 2040 yearly gross
  // 10% savings = 204
  // Net = 1836 yearly, 153 monthly
  assert.equal(resTier1.yearlyGrossTotal, 2040);
  assert.equal(resTier1.yearlySavings, 204);
  assert.equal(resTier1.yearlyNetTotal, 1836);
  assert.equal(resTier1.netMonthlyTotal, 153);
});

test("calculatePlanTotal - top plan (tier_5) with 0, 2, and 3 POS terminals", () => {
  // 0 POS terminals on tier_5 (includes 2 free, so billable = 0)
  const res0 = calculatePlanTotal({
    planId: "tier_5",
    billing: "monthly",
    posCount: 0,
  });
  assert.equal(res0.billablePosCount, 0);
  assert.equal(res0.posMonthlyTotal, 0);
  assert.equal(res0.netMonthlyTotal, 1500);

  // 2 POS terminals on tier_5 (still fully covered by 2 free terminals)
  const res2 = calculatePlanTotal({
    planId: "tier_5",
    billing: "monthly",
    posCount: 2,
  });
  assert.equal(res2.billablePosCount, 0);
  assert.equal(res2.posMonthlyTotal, 0);
  assert.equal(res2.netMonthlyTotal, 1500);

  // 3 POS terminals on tier_5 (1 billable terminal @ 150 EGP)
  const res3 = calculatePlanTotal({
    planId: "tier_5",
    billing: "monthly",
    posCount: 3,
  });
  assert.equal(res3.billablePosCount, 1);
  assert.equal(res3.posMonthlyTotal, 150);
  assert.equal(res3.netMonthlyTotal, 1650);
});

test("calculatePlanTotal - plans 1-4 with POS terminals", () => {
  // Plan 2 with 2 POS terminals: base 270 + 2 * 150 = 570 monthly
  const resTier2 = calculatePlanTotal({
    planId: "tier_2",
    billing: "monthly",
    posCount: 2,
  });
  assert.equal(resTier2.billablePosCount, 2);
  assert.equal(resTier2.posMonthlyTotal, 300);
  assert.equal(resTier2.netMonthlyTotal, 570);

  // Plan 3 with 1 POS terminal and yearly discount
  // Gross = 570 + 150 = 720 / mo
  // 10% discount = 72 / mo
  // Net monthly = 648 / mo, Yearly net = 7776
  const resTier3Yearly = calculatePlanTotal({
    planId: "tier_3",
    billing: "yearly",
    posCount: 1,
  });
  assert.equal(resTier3Yearly.grossMonthlyTotal, 720);
  assert.equal(resTier3Yearly.monthlyDiscount, 72);
  assert.equal(resTier3Yearly.netMonthlyTotal, 648);
  assert.equal(resTier3Yearly.yearlyNetTotal, 7776);
});

test("calculatePlanTotal - POS only mode: 200 EGP per month per terminal and 10% off yearly", () => {
  // 1 POS terminal monthly = 200 EGP
  const res1 = calculatePlanTotal({
    mode: "pos_only",
    billing: "monthly",
    posCount: 1,
  });
  assert.equal(res1.netMonthlyTotal, 200);
  assert.equal(res1.billablePosCount, 1);
  assert.equal(res1.monthlyDiscount, 0);

  // 3 POS terminals monthly = 600 EGP
  const res3 = calculatePlanTotal({
    mode: "pos_only",
    billing: "monthly",
    posCount: 3,
  });
  assert.equal(res3.netMonthlyTotal, 600);
  assert.equal(res3.billablePosCount, 3);

  // 1 POS terminal yearly = 200 * 0.9 = 180 EGP/mo (2160 EGP/yr, 240 EGP savings)
  const res1Yearly = calculatePlanTotal({
    mode: "pos_only",
    billing: "yearly",
    posCount: 1,
  });
  assert.equal(res1Yearly.netMonthlyTotal, 180);
  assert.equal(res1Yearly.yearlyGrossTotal, 2400);
  assert.equal(res1Yearly.yearlySavings, 240);
  assert.equal(res1Yearly.yearlyNetTotal, 2160);

  // 2 POS terminals yearly = 400 * 0.9 = 360 EGP/mo (4320 EGP/yr, 480 EGP savings)
  const res2Yearly = calculatePlanTotal({
    mode: "pos_only",
    billing: "yearly",
    posCount: 2,
  });
  assert.equal(res2Yearly.netMonthlyTotal, 360);
  assert.equal(res2Yearly.yearlyNetTotal, 4320);
  assert.equal(res2Yearly.yearlySavings, 480);
});

