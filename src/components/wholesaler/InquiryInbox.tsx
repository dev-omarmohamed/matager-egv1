"use client";

import React, { useState, useEffect } from "react";
import { useDashboardLanguage } from "@/lib/i18n";
import { StatusPill, PillVariant } from "@/components/ui/StatusPill";
import {
  WholesalerInquiry,
  getWholesalerInquiries,
  updateInquiryStatus,
} from "@/lib/wholesalers";

interface InquiryInboxProps {
  wholesalerId: string;
  onInquiryUpdated?: () => void;
}

export const InquiryInbox: React.FC<InquiryInboxProps> = ({
  wholesalerId,
  onInquiryUpdated,
}) => {
  const { t } = useDashboardLanguage();
  const [inquiries, setInquiries] = useState<WholesalerInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchInquiries = async () => {
    try {
      const list = await getWholesalerInquiries(wholesalerId);
      setInquiries(list);
    } catch (err) {
      console.warn("Failed to fetch inquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [wholesalerId]);

  const handleAccept = async (inquiryId: string) => {
    setProcessingId(inquiryId);
    try {
      await updateInquiryStatus(inquiryId, "accepted");
      await fetchInquiries();
      onInquiryUpdated?.();
    } catch (err) {
      console.warn("Failed to accept inquiry:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleWhatsApp = (inquiry: WholesalerInquiry) => {
    const text = `Hello from Matager Wholesaler Portal regarding your trade quote for SKU ${inquiry.sku} (Quantity: ${inquiry.qty} units). We are ready to process your order!`;
    const phone = "201012345678"; // Default merchant contact or customer phone
    const cleanPhone = phone.replace(/\D/g, "");
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const getStatusVariant = (status: WholesalerInquiry["status"]): PillVariant => {
    switch (status) {
      case "accepted":
        return "success";
      case "new":
        return "pending";
      case "quoted":
        return "purple";
      case "declined":
        return "danger";
      default:
        return "neutral";
    }
  };

  return (
    <div className="glass-panel rounded-[20px] bg-[var(--color-glass-card-bg)] border border-[var(--color-glass-card-border)] shadow-[var(--shadow-glass-card)] overflow-hidden transition-all duration-200">
      {/* Pure-CSS Checkbox Toggle */}
      <input
        type="checkbox"
        id="toggle-inquiries-inbox"
        defaultChecked={true}
        className="peer/inbox hidden"
        aria-hidden="true"
      />

      {/* Header bar */}
      <div className="p-4 sm:p-5 border-b border-[var(--color-border-subtle)] flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center font-bold text-sm">
            <i className="bi bi-inbox" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold font-heading text-[var(--color-text-primary)]">
                {t.wholesaler.inquiryInbox}
              </h3>
              <StatusPill variant="neutral">{inquiries.length} Requests</StatusPill>
            </div>
            <p className="text-[11px] font-subtitle text-[var(--color-text-muted)] mt-0.5">
              Direct volume quote inquiries submitted by verified retail merchants.
            </p>
          </div>
        </div>

        <label
          htmlFor="toggle-inquiries-inbox"
          className="cursor-pointer select-none px-3 py-1.5 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-glass-card-bg)] text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-1.5 transition-all peer-checked/inbox:[&_.inbox-chevron]:rotate-180"
        >
          <span>Toggle Inbox</span>
          <i className="bi bi-chevron-down text-[10px] transition-transform duration-300 inbox-chevron" />
        </label>
      </div>

      {/* Collapsible Content */}
      <div className="max-h-0 peer-checked/inbox:max-h-[2000px] transition-all duration-500 ease-in-out overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3 animate-pulse">
            <div className="h-14 bg-white/10 rounded-xl" />
            <div className="h-14 bg-white/10 rounded-xl" />
          </div>
        ) : inquiries.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--color-text-muted)]">
            No inquiries received yet. Matching stores will send quote requests from their dashboard.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">Date & Store</th>
                  <th className="py-3 px-4">Product SKU</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Unit Price</th>
                  <th className="py-3 px-4">Total Value</th>
                  <th className="py-3 px-4">Merchant Note</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {inquiries.map((inq) => {
                  const dateStr = new Date(inq.createdAt).toLocaleDateString();
                  const total = inq.qty * inq.offeredPrice;

                  return (
                    <tr
                      key={inq.id}
                      className="hover:bg-[var(--color-surface-hover)]/30 transition-colors"
                    >
                      {/* Date & Store */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[var(--color-text-primary)]">
                          {inq.storeId}
                        </div>
                        <div className="text-[10px] text-[var(--color-text-muted)]">
                          {dateStr}
                        </div>
                      </td>

                      {/* Product SKU */}
                      <td className="py-3.5 px-4 font-ui font-medium text-[var(--color-text-primary)]">
                        {inq.sku}
                      </td>

                      {/* Quantity */}
                      <td className="py-3.5 px-4 font-bold text-[var(--color-text-primary)]">
                        {inq.qty} units
                      </td>

                      {/* Unit Price */}
                      <td className="py-3.5 px-4 text-[var(--color-text-secondary)]">
                        {inq.offeredPrice} EGP
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 font-black bg-[var(--gradient-primary)] bg-clip-text text-transparent">
                        {total.toLocaleString()} EGP
                      </td>

                      {/* Note */}
                      <td className="py-3.5 px-4 text-[var(--color-text-muted)] max-w-xs truncate">
                        {inq.note || "—"}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <StatusPill variant={getStatusVariant(inq.status)}>
                          {inq.status}
                        </StatusPill>
                      </td>

                      {/* Actions: WhatsApp + Mark Accepted */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleWhatsApp(inq)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold flex items-center gap-1 transition-all"
                            title={t.wholesaler.replyWhatsApp}
                          >
                            <i className="bi bi-whatsapp text-xs" />
                            <span>WhatsApp</span>
                          </button>

                          {inq.status !== "accepted" && (
                            <button
                              type="button"
                              onClick={() => handleAccept(inq.id)}
                              disabled={processingId === inq.id}
                              className="px-2.5 py-1 rounded-lg bg-[var(--gradient-primary)] text-white text-[11px] font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm disabled:opacity-50"
                            >
                              {processingId === inq.id ? "..." : t.wholesaler.markAccepted}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

