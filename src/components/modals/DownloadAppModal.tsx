"use client";

import React, { useEffect, useRef } from "react";
import { useLanguage } from "@/i18n";
import { APP_LINKS } from "@/config/app-links.config";
import { X, QrCode, ArrowUpRight } from "lucide-react";

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({ isOpen, onClose }) => {
  const { locale, dir } = useLanguage();
  const isAr = locale === "ar";
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap and ESC key listener
  useEffect(() => {
    if (!isOpen) return;

    // Focus close button initially
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    // Prevent background scrolling while modal is open
    document.body.style.overflow = "hidden";

    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="download-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        dir={dir}
        className="relative w-full max-w-[500px] rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6 sm:p-8 shadow-2xl transition-all"
      >
        {/* Close Button */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label={isAr ? "إغلاق" : "Close"}
          className="absolute top-5 end-5 p-2 rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/[0.06] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-start space-y-2 mb-6">
          <h2
            id="download-modal-title"
            className="text-2xl sm:text-3xl font-heading font-semibold text-[var(--color-text-primary)]"
          >
            {isAr ? "تحميل تطبيق متاجر" : "Download Matager"}
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            {isAr
              ? "منظومة التجارة المتكاملة لنقاط البيع وإدارة المتاجر على أجهزة iOS وأندرويد."
              : "Unified commerce infrastructure for POS registers and merchant ops on iOS and Android."}
          </p>
        </div>

        {/* App Store / Google Play Buttons */}
        <div className="space-y-3 mb-6">
          {/* iOS App Store */}
          {APP_LINKS.ios ? (
            <a
              href={APP_LINKS.ios}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] hover:border-blue-500/50 hover:bg-white/[0.04] transition-all text-[var(--color-text-primary)]"
            >
              <div className="flex items-center gap-3">
                <i className="bi bi-apple text-2xl text-[var(--color-text-primary)]" />
                <div className="text-start">
                  <div className="text-[11px] text-[var(--color-text-muted)] leading-tight">
                    {isAr ? "متوفر على" : "Download on the"}
                  </div>
                  <div className="text-sm font-semibold">App Store</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[var(--color-text-muted)] rtl:rotate-180" />
            </a>
          ) : (
            <div
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] opacity-60 cursor-not-allowed select-none"
              aria-disabled="true"
            >
              <div className="flex items-center gap-3">
                <i className="bi bi-apple text-2xl text-[var(--color-text-muted)]" />
                <div className="text-start">
                  <div className="text-[11px] text-[var(--color-text-muted)] leading-tight">Apple iOS</div>
                  <div className="text-sm font-semibold text-[var(--color-text-secondary)]">App Store</div>
                </div>
              </div>
              <span className="text-[11px] font-medium text-[var(--color-text-muted)] px-2 py-0.5 rounded bg-white/[0.05]">
                {isAr ? "قريباً" : "Coming soon"}
              </span>
            </div>
          )}

          {/* Android Google Play */}
          {APP_LINKS.android ? (
            <a
              href={APP_LINKS.android}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] hover:border-blue-500/50 hover:bg-white/[0.04] transition-all text-[var(--color-text-primary)]"
            >
              <div className="flex items-center gap-3">
                <i className="bi bi-google-play text-2xl text-[var(--color-accent-blue)]" />
                <div className="text-start">
                  <div className="text-[11px] text-[var(--color-text-muted)] leading-tight">
                    {isAr ? "متوفر على" : "Get it on"}
                  </div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[var(--color-text-muted)] rtl:rotate-180" />
            </a>
          ) : (
            <div
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] opacity-60 cursor-not-allowed select-none"
              aria-disabled="true"
            >
              <div className="flex items-center gap-3">
                <i className="bi bi-google-play text-2xl text-[var(--color-text-muted)]" />
                <div className="text-start">
                  <div className="text-[11px] text-[var(--color-text-muted)] leading-tight">Android</div>
                  <div className="text-sm font-semibold text-[var(--color-text-secondary)]">Google Play</div>
                </div>
              </div>
              <span className="text-[11px] font-medium text-[var(--color-text-muted)] px-2 py-0.5 rounded bg-white/[0.05]">
                {isAr ? "قريباً" : "Coming soon"}
              </span>
            </div>
          )}
        </div>

        {/* Empty QR Code Slot (Reserved for future QR image, zero CLS) */}
        <div className="p-4 rounded-xl border border-dashed border-[var(--color-border)] bg-black/40 flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
            <QrCode className="w-8 h-8 text-[var(--color-accent-blue)] opacity-60" />
          </div>
          <div className="text-start text-xs text-[var(--color-text-muted)] leading-relaxed">
            <div className="font-semibold text-[var(--color-text-primary)] mb-0.5">
              {isAr ? "امسح الرمز لتحميل التطبيق" : "Scan to download"}
            </div>
            <div>
              {isAr
                ? "سيتم تفعيل الرمز المباشر مع إطلاق النسخة الرسمية على المتاجر."
                : "Direct QR linking will be active upon public store release."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

