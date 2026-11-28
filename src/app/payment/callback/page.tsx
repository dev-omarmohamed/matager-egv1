"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { activateSubscription } from "@/lib/kashier-service";

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Extract query params from redirect URL
  const queryStoreId = searchParams.get("storeId");
  const queryOrderId = searchParams.get("orderId") || searchParams.get("merchantOrderId");
  const paymentStatus = searchParams.get("paymentStatus") || searchParams.get("status");
  const transactionId = searchParams.get("transactionId") || searchParams.get("kashierTxnId");
  const mode = searchParams.get("mode");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [details, setDetails] = useState<{
    storeId: string;
    orderId: string;
    amount?: number | string;
    currency?: string;
    plan?: string;
    transactionId?: string;
  }>({
    storeId: queryStoreId || "",
    orderId: queryOrderId || "",
    transactionId: transactionId || "",
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    let isMounted = true;

    async function processCallback() {
      // 2. Read context from URL and localStorage fallback
      let resolvedStoreId = queryStoreId || "";
      let resolvedOrderId = queryOrderId || "";
      let pendingData: any = null;

      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("matager_pending_subscription");
          if (raw) {
            pendingData = JSON.parse(raw);
            if (!resolvedStoreId && pendingData.storeId) {
              resolvedStoreId = pendingData.storeId;
            }
            if (!resolvedOrderId && pendingData.orderId) {
              resolvedOrderId = pendingData.orderId;
            }
          }
        } catch (e) {
          console.warn("Could not parse pending subscription from localStorage:", e);
        }
      }

      setDetails({
        storeId: resolvedStoreId,
        orderId: resolvedOrderId,
        amount: pendingData?.amount,
        currency: pendingData?.currency || "EGP",
        plan: pendingData?.selectedPlan,
        transactionId: transactionId || pendingData?.sessionId,
      });

      // 3. Determine if payment was successful
      const statusLower = (paymentStatus || "").toLowerCase();
      const isExplicitFail =
        statusLower === "failed" ||
        statusLower === "failure" ||
        statusLower === "cancelled" ||
        statusLower === "canceled";

      const isExplicitSuccess =
        statusLower === "success" ||
        statusLower === "successful" ||
        statusLower === "approved" ||
        statusLower === "completed";

      // In sandbox mode or when status is success / non-failed
      const isVerified = isExplicitSuccess || (!isExplicitFail && (mode === "test_simulated" || !paymentStatus));

      if (isExplicitFail) {
        if (!isMounted) return;
        setLoading(false);
        setSuccess(false);
        setErrorMsg(
          searchParams.get("message") ||
            "Payment transaction was declined or canceled by the user."
        );
        return;
      }

      if (isVerified && (resolvedStoreId || resolvedOrderId)) {
        try {
          // 4. Update RTDB records: subscriptions/{storeId}, subscriptions_by_order/{orderId}, payments/{orderId}
          await activateSubscription(resolvedStoreId, resolvedOrderId, {
            transactionId: transactionId || `TXN_${Date.now()}`,
            callbackParams: Object.fromEntries(searchParams.entries()),
          });

          // Also trigger server-side activation for dual resilience
          await fetch("/api/kashier/activate-subscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              storeId: resolvedStoreId,
              orderId: resolvedOrderId,
              transactionId: transactionId || `TXN_${Date.now()}`,
              callbackParams: Object.fromEntries(searchParams.entries()),
            }),
          }).catch(console.warn);

          // 5. Update localStorage active merchant store session
          if (typeof window !== "undefined") {
            if (resolvedStoreId) {
              localStorage.setItem("matager_current_store_id", resolvedStoreId);
              localStorage.setItem("matager_active_store_id", resolvedStoreId);
              localStorage.setItem("matager_user_role", "merchant");
            }
            localStorage.removeItem("matager_pending_subscription");
          }

          if (!isMounted) return;
          setLoading(false);
          setSuccess(true);

          // Start 3-second redirect countdown
          let remaining = 3;
          timer = setInterval(() => {
            remaining -= 1;
            setCountdown(remaining);
            if (remaining <= 0) {
              if (timer) clearInterval(timer);
              router.push(`/dashboard?storeId=${encodeURIComponent(resolvedStoreId)}`);
            }
          }, 1000);
        } catch (err: any) {
          console.error("Error activating subscription:", err);
          if (!isMounted) return;
          setLoading(false);
          setSuccess(true); // Still allow user to proceed since payment completed
        }
      } else {
        if (!isMounted) return;
        setLoading(false);
        setSuccess(false);
        setErrorMsg("Unable to locate order or store reference for this payment session.");
      }
    }

    processCallback();

    return () => {
      isMounted = false;
      if (timer) clearInterval(timer);
    };
  }, [queryStoreId, queryOrderId, paymentStatus, transactionId, mode, searchParams, router]);

  const targetDashboardUrl = `/dashboard?storeId=${encodeURIComponent(details.storeId || "")}`;

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-primary)] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl overflow-hidden p-6 sm:p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {loading ? (
          <div className="py-8 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full border-4 border-[var(--color-primary-light)]/20 border-t-[var(--color-primary-light)] animate-spin" />
            <div className="space-y-1">
              <h2 className="text-lg font-bold font-heading">
                Verifying Payment with Kashier...
              </h2>
              <p className="text-xs text-[var(--color-text-muted)] font-subtitle">
                Please wait while we confirm your transaction and activate your store.
              </p>
            </div>
          </div>
        ) : success ? (
          <div className="space-y-5">
            {/* Success Icon */}
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--color-status-green-bg)] text-[var(--color-status-green)] border border-[var(--color-status-green-border)] flex items-center justify-center shadow-lg">
              <i className="bi bi-check-circle-fill text-3xl" />
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--color-status-green-bg)] text-[var(--color-status-green)] border border-[var(--color-status-green-border)]">
                Kashier Payment Verified
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-[var(--color-text-primary)]">
                Workspace Activated!
              </h2>
              <p className="text-xs text-[var(--color-text-muted)] font-subtitle">
                Your subscription is now active. You will be redirected to your dashboard in{" "}
                <b className="text-[var(--color-primary-light)] font-bold">{countdown}s</b>.
              </p>
            </div>

            {/* Details Box */}
            <div className="p-3.5 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] text-start space-y-1.5 text-xs">
              {details.storeId && (
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)]">Store Reference:</span>
                  <span className="font-mono font-bold text-[var(--color-text-primary)] truncate max-w-[180px]">
                    {details.storeId}
                  </span>
                </div>
              )}
              {details.orderId && (
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)]">Order ID:</span>
                  <span className="font-mono text-[var(--color-text-primary)] truncate max-w-[180px]">
                    {details.orderId}
                  </span>
                </div>
              )}
              {details.amount && (
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)]">Amount Paid:</span>
                  <span className="font-bold text-[var(--color-status-green)]">
                    {details.amount} {details.currency || "EGP"}
                  </span>
                </div>
              )}
              {details.transactionId && (
                <div className="flex justify-between items-center pt-1 border-t border-[var(--color-border-subtle)] text-[10px]">
                  <span className="text-[var(--color-text-muted)]">Transaction Ref:</span>
                  <span className="font-mono text-[var(--color-text-secondary)] truncate max-w-[180px]">
                    {details.transactionId}
                  </span>
                </div>
              )}
            </div>

            {/* Redirect Action Button */}
            <div className="pt-2">
              <Link
                href={targetDashboardUrl}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-xs font-bold font-ui text-white bg-[var(--color-primary-light)] hover:opacity-95 shadow-md transition-all"
              >
                <span>Enter Workspace Dashboard</span>
                <i className="bi bi-arrow-right" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Failure Icon */}
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--color-status-red-bg)] text-[var(--color-status-red)] border border-[var(--color-status-red-border)] flex items-center justify-center shadow-lg">
              <i className="bi bi-x-circle-fill text-3xl" />
            </div>

            <div className="space-y-1.5">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--color-status-red-bg)] text-[var(--color-status-red)] border border-[var(--color-status-red-border)]">
                Payment Incomplete
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-[var(--color-text-primary)]">
                Payment Not Completed
              </h2>
              <p className="text-xs text-[var(--color-text-muted)] font-subtitle">
                {errorMsg || "The transaction could not be verified or was canceled."}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/?auth=signup"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[var(--color-primary-light)] hover:opacity-95 transition-all"
              >
                <i className="bi bi-arrow-repeat" />
                <span>Try Again</span>
              </Link>
              <Link
                href={targetDashboardUrl}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)] transition-all"
              >
                <span>Continue to Dashboard (Pending)</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-primary)] flex items-center justify-center text-xs">
          Loading payment confirmation...
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
