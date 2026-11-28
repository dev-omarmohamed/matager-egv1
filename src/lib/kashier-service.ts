/**
 * Kashier Payment Sessions & Firebase RTDB Subscription Tracking Service
 *
 * Provides utilities for:
 * - Creating server-side Kashier payment sessions (/v3/payment/sessions)
 * - Persisting subscription records in Firebase RTDB:
 *     subscriptions/{storeId}
 *     subscriptions_by_order/{orderId}
 *     payments/{orderId}
 * - Activating subscriptions upon Kashier payment callback
 */

import { rtdb, auth } from "@/lib/firebase";
import { getDatabase, ref, set, update, get } from "firebase/database";

export type SubscriptionStatus =
  | "pending_payment"
  | "active"
  | "canceled"
  | "expired"
  | "failed";

export type PricingMode = "catalog" | "pos_only";
export type BillingCycle = "monthly" | "yearly";

export interface SubscriptionRecord {
  storeId: string;
  ownerId: string;
  orderId: string;
  storeName: string;
  legalName: string;
  category: string;
  ownerEmail: string;
  ownerPhone: string;
  pricingMode: PricingMode;
  billingCycle: BillingCycle;
  planId: string;
  selectedPlan: string;
  expectedVolume: string;
  posCount: number;
  amount: number;
  currency: string;
  provider: "kashier";
  status: SubscriptionStatus;
  sessionId: string;
  sessionUrl: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  transactionId?: string;
  metadata?: Record<string, any>;
}

export interface PaymentRecord {
  orderId: string;
  storeId: string;
  ownerId: string;
  amount: number;
  currency: string;
  provider: "kashier";
  status: "pending" | "completed" | "failed" | "canceled";
  sessionId: string;
  sessionUrl: string;
  customerEmail: string;
  customerPhone: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  transactionId?: string;
  callbackParams?: Record<string, any>;
}

export interface CreateKashierSessionInput {
  amount: number | string;
  currency?: string;
  orderId: string;
  storeId: string;
  customerEmail?: string;
  customerPhone?: string;
  locale?: "ar" | "en" | string;
  merchantRedirect?: string;
  metaData?: Record<string, any>;
}

export interface CreateKashierSessionOutput {
  sessionUrl: string;
  sessionId: string;
  orderId: string;
  raw?: any;
}

/**
 * Returns a live Firebase Realtime Database instance.
 */
export function getRtdbInstance() {
  if (rtdb) return rtdb;
  try {
    return getDatabase(auth?.app);
  } catch {
    return rtdb;
  }
}

/**
 * Formats a numeric amount to standard Kashier 2-decimal string format (e.g. 450 -> "450.00").
 */
export function formatKashierAmount(rawAmount: number | string): string {
  const num = typeof rawAmount === "number" ? rawAmount : parseFloat(String(rawAmount).replace(/[^0-9.]/g, ""));
  if (isNaN(num) || num <= 0) {
    throw new Error(`Invalid positive amount for Kashier payment session: ${rawAmount}`);
  }
  return num.toFixed(2);
}

/**
 * Persists pending subscription & payment records across RTDB paths:
 * - subscriptions/{storeId}
 * - subscriptions_by_order/{orderId}
 * - payments/{orderId}
 */
export async function savePendingSubscriptionAndPayment(
  data: Omit<SubscriptionRecord, "status" | "createdAt" | "updatedAt"> & {
    status?: SubscriptionStatus;
  }
): Promise<{ subRecord: SubscriptionRecord; paymentRecord: PaymentRecord }> {
  const db = getRtdbInstance();
  const now = new Date().toISOString();

  const subRecord: SubscriptionRecord = {
    ...data,
    status: data.status || "pending_payment",
    createdAt: now,
    updatedAt: now,
  };

  const paymentRecord: PaymentRecord = {
    orderId: data.orderId,
    storeId: data.storeId,
    ownerId: data.ownerId,
    amount: data.amount,
    currency: data.currency || "EGP",
    provider: "kashier",
    status: "pending",
    sessionId: data.sessionId,
    sessionUrl: data.sessionUrl,
    customerEmail: data.ownerEmail,
    customerPhone: data.ownerPhone,
    createdAt: now,
    updatedAt: now,
  };

  if (db) {
    try {
      await Promise.allSettled([
        set(ref(db, `subscriptions/${data.storeId}`), subRecord),
        set(ref(db, `subscriptions_by_order/${data.orderId}`), subRecord),
        set(ref(db, `payments/${data.orderId}`), paymentRecord),
      ]);
    } catch (err) {
      console.warn("RTDB write warning for pending subscription:", err);
    }
  }

  return { subRecord, paymentRecord };
}

/**
 * Marks subscription and payment records as active/completed in RTDB upon successful checkout.
 */
export async function activateSubscription(
  storeId: string,
  orderId: string,
  paymentDetails: {
    transactionId?: string;
    callbackParams?: Record<string, any>;
    paidAt?: string;
  } = {}
): Promise<{ success: boolean; activatedAt: string }> {
  const db = getRtdbInstance();
  const now = paymentDetails.paidAt || new Date().toISOString();

  const subUpdates: Partial<SubscriptionRecord> = {
    status: "active",
    paidAt: now,
    updatedAt: now,
    transactionId: paymentDetails.transactionId || "",
  };

  const paymentUpdates: Partial<PaymentRecord> = {
    status: "completed",
    paidAt: now,
    updatedAt: now,
    transactionId: paymentDetails.transactionId || "",
    callbackParams: paymentDetails.callbackParams || {},
  };

  if (db) {
    const promises: Promise<any>[] = [];
    if (storeId) {
      promises.push(update(ref(db, `subscriptions/${storeId}`), subUpdates));
    }
    if (orderId) {
      promises.push(update(ref(db, `subscriptions_by_order/${orderId}`), subUpdates));
      promises.push(update(ref(db, `payments/${orderId}`), paymentUpdates));
    }
    await Promise.allSettled(promises);
  }

  return { success: true, activatedAt: now };
}

/**
 * Fetches subscription details for a specific store.
 */
export async function getSubscriptionByStore(storeId: string): Promise<SubscriptionRecord | null> {
  const db = getRtdbInstance();
  if (!db || !storeId) return null;
  try {
    const snap = await get(ref(db, `subscriptions/${storeId}`));
    if (snap.exists()) {
      return snap.val() as SubscriptionRecord;
    }
  } catch (err) {
    console.warn("Error fetching subscription for store:", err);
  }
  return null;
}
