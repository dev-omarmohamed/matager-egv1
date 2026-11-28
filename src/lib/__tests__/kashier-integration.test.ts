import { test } from "node:test";
import assert from "node:assert/strict";
import {
  formatKashierAmount,
  savePendingSubscriptionAndPayment,
  activateSubscription,
  SubscriptionRecord,
  PaymentRecord,
} from "../kashier-service";

test("formatKashierAmount - formats numbers and strings to 2 decimal places", () => {
  assert.equal(formatKashierAmount(170), "170.00");
  assert.equal(formatKashierAmount(270.5), "270.50");
  assert.equal(formatKashierAmount("570"), "570.00");
  assert.equal(formatKashierAmount("970.99"), "970.99");
  assert.equal(formatKashierAmount("EGP 1,500.50"), "1500.50");
});

test("formatKashierAmount - throws on zero, negative, or invalid amounts", () => {
  assert.throws(() => formatKashierAmount(0), /Invalid positive amount/);
  assert.throws(() => formatKashierAmount(-50), /Invalid positive amount/);
  assert.throws(() => formatKashierAmount("abc"), /Invalid positive amount/);
  assert.throws(() => formatKashierAmount(""), /Invalid positive amount/);
});

test("savePendingSubscriptionAndPayment - constructs correct records", async () => {
  const input = {
    storeId: "store_test_123",
    ownerId: "owner_test_456",
    orderId: "sub_store_test_123_1700000000",
    storeName: "Test Electronics",
    legalName: "Test Electronics LLC",
    category: "Electronics",
    ownerEmail: "owner@test.com",
    ownerPhone: "+201010000000",
    pricingMode: "catalog" as const,
    billingCycle: "monthly" as const,
    planId: "tier_3",
    selectedPlan: "Growth Store (Tier 3)",
    expectedVolume: "1000+",
    posCount: 1,
    amount: 570,
    currency: "EGP",
    provider: "kashier" as const,
    sessionId: "sess_test_abc",
    sessionUrl: "https://test-checkout.kashier.io/session/sess_test_abc",
  };

  const { subRecord, paymentRecord } = await savePendingSubscriptionAndPayment(input);

  assert.equal(subRecord.storeId, "store_test_123");
  assert.equal(subRecord.status, "pending_payment");
  assert.equal(subRecord.amount, 570);
  assert.equal(subRecord.provider, "kashier");
  assert.ok(subRecord.createdAt);

  assert.equal(paymentRecord.orderId, "sub_store_test_123_1700000000");
  assert.equal(paymentRecord.status, "pending");
  assert.equal(paymentRecord.amount, 570);
  assert.equal(paymentRecord.customerEmail, "owner@test.com");
  assert.ok(paymentRecord.createdAt);
});

test("activateSubscription - updates state correctly", async () => {
  const result = await activateSubscription("store_test_123", "sub_store_test_123_1700000000", {
    transactionId: "TXN_98765",
    paidAt: "2026-11-28T20:00:00.000Z",
  });

  assert.equal(result.success, true);
  assert.equal(result.activatedAt, "2026-11-28T20:00:00.000Z");
});
