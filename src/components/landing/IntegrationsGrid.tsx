"use client";

import React from "react";
import { useLanguage } from "@/i18n";
import { ArrowUpRight } from "lucide-react";
import { Marquee } from "@/components/ui/Marquee";

export const IntegrationsGrid: React.FC = () => {
  const { t, dir } = useLanguage();

  // Row 1: Payment rails & fintech gateways (moves Left)
  const row1Brands = [
    { name: "Stripe", color: "var(--color-status-purple)", category: "Payments", tag: "PAY" },
    { name: "Visa", color: "var(--color-status-blue)", category: "Cards", tag: "VISA" },
    { name: "Mastercard", color: "var(--color-status-red)", category: "Cards", tag: "MC" },
    { name: "Apple Pay", color: "var(--color-text-muted)", category: "Mobile Pay", tag: "APPLE" },
    { name: "PayPal", color: "var(--color-status-blue)", category: "Wallets", tag: "PP" },
    { name: "Mada", color: "var(--color-status-green)", category: "Saudi Rail", tag: "MADA" },
    { name: "Tabby", color: "#29e88b", textColor: "#000000", category: "BNPL", tag: "TABBY" },
    { name: "Tamara", color: "#f75f3b", category: "BNPL", tag: "TAMARA" },
  ];

  // Row 2: Logistics carriers, ERP & accounting (moves Right)
  const row2Brands = [
    { name: "DHL Express", color: "var(--color-status-amber)", textColor: "var(--color-status-red)", category: "Global Freight", tag: "DHL" },
    { name: "FedEx", color: "var(--color-status-purple)", category: "Express Logistics", tag: "FEDEX" },
    { name: "Aramex", color: "var(--color-status-red)", category: "Regional Courier", tag: "ARAMEX" },
    { name: "Bosta", color: "#e11900", category: "Last-Mile Delivery", tag: "BOSTA" },
    { name: "Shopify Sync", color: "var(--color-status-green)", category: "E-Commerce", tag: "SHOP" },
    { name: "SAP ERP", color: "var(--color-status-blue)", category: "Enterprise ERP", tag: "SAP" },
    { name: "QuickBooks", color: "var(--color-status-green)", category: "Accounting", tag: "QB" },
    { name: "Odoo ERP", color: "#714B67", category: "Operations", tag: "ODOO" },
  ];

  return (
    <section id="integrations" dir={dir} className="w-full py-20 sm:py-28 relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-[760px] mx-auto mb-14 sm:mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[var(--color-text-primary)] mb-4 leading-[1.15]">
            {t.integrations.heading}
          </h2>

          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed max-w-[640px] mx-auto">
            {t.integrations.subhead}
          </p>
        </div>
      </div>

      {/* ─── 2 OPPOSITE HORIZONTAL MARQUEE LINES ─── */}
      <div className="space-y-4 mb-12">
        {/* Row 1: Left */}
        <Marquee
          speed={28}
          direction="left"
          gap={16}
          pauseOnHover={true}
          ariaLabel="Financial and payment rail integrations"
        >
          {row1Brands.map((b, idx) => (
            <div
              key={idx}
              dir={dir}
              className="w-[165px] sm:w-[185px] shrink-0 h-24 rounded-[12px] bg-[var(--color-surface)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-hover)] p-3 flex flex-col items-center justify-center gap-1.5 transition-all duration-200 group shadow-sm"
            >
              <div
                className="w-9 h-9 rounded-[8px] flex items-center justify-center text-[11px] font-bold shadow-sm transition-transform duration-200 group-hover:scale-105"
                style={{
                  backgroundColor: b.color,
                  color: b.textColor || "var(--color-ghost-white)",
                }}
              >
                {b.tag}
              </div>

              <div className="text-[13px] font-medium text-[var(--color-text-primary)] truncate max-w-full">
                {b.name}
              </div>

              <div className="text-[10px] text-[var(--color-text-muted)] truncate max-w-full">
                {b.category}
              </div>
            </div>
          ))}
        </Marquee>

        {/* Row 2: Right (Opposite Direction) */}
        <Marquee
          speed={28}
          direction="right"
          gap={16}
          pauseOnHover={true}
          ariaLabel="Logistics and enterprise ERP connectors"
        >
          {row2Brands.map((b, idx) => (
            <div
              key={idx}
              dir={dir}
              className="w-[165px] sm:w-[185px] shrink-0 h-24 rounded-[12px] bg-[var(--color-surface)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-hover)] p-3 flex flex-col items-center justify-center gap-1.5 transition-all duration-200 group shadow-sm"
            >
              <div
                className="w-9 h-9 rounded-[8px] flex items-center justify-center text-[11px] font-bold shadow-sm transition-transform duration-200 group-hover:scale-105"
                style={{
                  backgroundColor: b.color,
                  color: b.textColor || "var(--color-ghost-white)",
                }}
              >
                {b.tag}
              </div>

              <div className="text-[13px] font-medium text-[var(--color-text-primary)] truncate max-w-full">
                {b.name}
              </div>

              <div className="text-[10px] text-[var(--color-text-muted)] truncate max-w-full">
                {b.category}
              </div>
            </div>
          ))}
        </Marquee>
      </div>

      {/* Centered Outlined Action Button */}
      {/* <div className="text-center">
        <button
          type="button"
          className="btn-outline-action inline-flex items-center gap-2"
        >
          <span>{t.integrations.ctaButton}</span>
          <ArrowUpRight className="w-4 h-4 opacity-70 rtl:rotate-180" />
        </button>
      </div> */}
    </section>
  );
};
