"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/i18n";
import { X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface WholesaleContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement>;
  mode?: "wholesaler" | "storeowners";
}

export const WholesaleContactModal: React.FC<WholesaleContactModalProps> = ({
  isOpen,
  onClose,
  triggerRef,
  mode = "wholesaler",
}) => {
  const { locale, dir } = useLanguage();
  const isAr = locale === "ar";
  const isStoreOwner = mode === "storeowners";

  const modalRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [storeName, setStoreName] = useState("");
  const [expectedProducts, setExpectedProducts] = useState("1000+");
  const [honeypot, setHoneypot] = useState("");

  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Focus trap and ESC key listener
  useEffect(() => {
    if (!isOpen) {
      setName("");
      setPhone("");
      setStoreName("");
      setExpectedProducts("1000+");
      setNameError("");
      setPhoneError("");
      setSubmitError("");
      setIsSuccess(false);
      return;
    }

    const timer = setTimeout(() => {
      nameInputRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])'
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
    document.body.style.overflow = "hidden";

    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      if (triggerRef?.current) {
        triggerRef.current.focus();
      }
    };
  }, [isOpen, onClose, triggerRef]);

  const validate = () => {
    let valid = true;

    // Validate Name
    if (!name.trim() || name.trim().length < 2 || name.trim().length > 80) {
      setNameError(
        isAr
          ? "يرجى كتابة الاسم بالكامل (بين 2 و 80 حرفاً)."
          : "Full name is required (between 2 and 80 characters)."
      );
      valid = false;
    } else {
      setNameError("");
    }

    // Validate Phone
    const cleanPhone = phone.replace(/[\s\-()]/g, "");
    const egyptianRegex = /^((\+20|0020)|0)?1[0125]\d{8}$/;
    const intlRegex = /^\+?[1-9]\d{7,14}$/;

    if (!cleanPhone || (!egyptianRegex.test(cleanPhone) && !intlRegex.test(cleanPhone))) {
      setPhoneError(
        isAr
          ? "يرجى كتابة رقم هاتف صالح (مثال: 01012345678 أو مع كود الدولة)."
          : "Please enter a valid phone number (e.g. 01012345678 or with country code)."
      );
      valid = false;
    } else {
      setPhoneError("");
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const endpoint = isStoreOwner
        ? "/api/storeowner-requests"
        : process.env.NEXT_PUBLIC_WHOLESALE_REQUEST_ENDPOINT || "/api/wholesale-requests";

      const payload = isStoreOwner
        ? {
            name: name.trim(),
            storeName: storeName.trim(),
            phone: phone.trim(),
            expectedProducts,
            locale,
            source: "pricing_enterprise_request",
            honeypot,
          }
        : {
            name: name.trim(),
            phone: phone.trim(),
            locale,
            source: "landing",
            honeypot,
          };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // Fallback: direct REST POST to Firebase RTDB
        const rtdbUrl = isStoreOwner
          ? "https://matager-egv01-default-rtdb.europe-west1.firebasedatabase.app/requests/storeowners.json"
          : "https://matager-egv01-default-rtdb.europe-west1.firebasedatabase.app/requests/wholesaler.json";

        await fetch(rtdbUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            createdAt: new Date().toISOString(),
            status: "pending",
          }),
        }).catch(() => null);
      }

      setIsSuccess(true);
    } catch {
      // Direct REST POST fallback on fetch failure
      try {
        const rtdbUrl = isStoreOwner
          ? "https://matager-egv01-default-rtdb.europe-west1.firebasedatabase.app/requests/storeowners.json"
          : "https://matager-egv01-default-rtdb.europe-west1.firebasedatabase.app/requests/wholesaler.json";

        await fetch(rtdbUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            storeName: storeName.trim(),
            phone: phone.trim(),
            expectedProducts,
            locale,
            source: isStoreOwner ? "pricing_enterprise_request" : "landing",
            createdAt: new Date().toISOString(),
            status: "pending",
          }),
        });
        setIsSuccess(true);
      } catch {
        setSubmitError(
          isAr
            ? "تعذر إرسال الطلب حالياً، يرجى المحاولة مرة أخرى."
            : "Failed to submit inquiry. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="wholesale-contact-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        dir={dir}
        className="relative w-full max-w-[480px] rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6 sm:p-8 shadow-2xl transition-all"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label={isAr ? "إغلاق" : "Close"}
          className="absolute top-5 end-5 p-2 rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/[0.06] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          /* Success Confirmation View */
          <div className="py-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-heading font-semibold text-[var(--color-text-primary)]">
                {isStoreOwner
                  ? isAr
                    ? "تم استلام طلبك بنجاح"
                    : "Enterprise Request Received"
                  : isAr
                  ? "شكراً لتواصلك معنا"
                  : "Thank you for reaching out"}
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] max-w-sm mx-auto leading-relaxed">
                {isStoreOwner
                  ? isAr
                    ? "تم استلام تفاصيل متجرك بنجاح، وسيتواصل معك مهندس الحسابات لتجهيز الباقة المخصصة لأكثر من 550 منتج."
                    : "We have received your enterprise request. An account engineer will contact you shortly to configure your high-volume setup."
                  : isAr
                  ? "تم استلام بياناتك بنجاح، وسيتواصل معك أحد مسؤولي شبكة التوريد لتنسيق ربط منتجاتك مع شبكة المتاجر."
                  : "We have received your wholesale details. Our supplier partnerships team will contact you shortly to coordinate integration."}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-sm font-medium hover:bg-white/[0.08] transition-colors"
            >
              {isAr ? "إغلاق" : "Close"}
            </button>
          </div>
        ) : (
          /* Contact Form View */
          <>
            <div className="text-start space-y-2 mb-6">
              <h2
                id="wholesale-contact-title"
                className="text-2xl font-heading font-semibold text-[var(--color-text-primary)]"
              >
                {isStoreOwner
                  ? isAr
                    ? "طلب باقة كبرى (أكثر من 550 منتج)"
                    : "Enterprise Request (550+ Products)"
                  : isAr
                  ? "تواصل مع شبكة موردي الجملة"
                  : "Contact Wholesale Partnerships"}
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {isStoreOwner
                  ? isAr
                    ? "للمتاجر ذات الكتالوجات الضخمة والفروع المتعددة، أدخل بياناتك وسيتواصل معك مهندس حلول مخصص."
                    : "For catalogs with more than 550 products, submit your details to configure dedicated enterprise capacity."
                  : isAr
                  ? "سجّل بياناتك لربط مصنعك أو مستودعك مباشرة مع مئات تجار التجزئة المعتمدين."
                  : "Submit your contact info to supply certified retail merchants directly across the network."}
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Bot Honeypot */}
              <input
                type="text"
                name="company_fax"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="sr-only"
                aria-hidden="true"
              />

              {/* Full Name Field */}
              <div className="space-y-1.5 text-start">
                <label
                  htmlFor="ws-name"
                  className="block text-xs font-medium text-[var(--color-text-secondary)]"
                >
                  {isAr ? "الاسم بالكامل *" : "Full Name *"}
                </label>
                <input
                  ref={nameInputRef}
                  id="ws-name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError("");
                  }}
                  placeholder={isAr ? "مثال: محمود الشريف" : "e.g. Mahmoud El-Sherif"}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors ${
                    nameError ? "border-red-500" : "border-[var(--color-border)]"
                  }`}
                />
                {nameError && (
                  <p className="text-xs text-red-400 flex items-center gap-1 pt-0.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{nameError}</span>
                  </p>
                )}
              </div>

              {/* Store Name Field (For Store Owners) */}
              {isStoreOwner && (
                <div className="space-y-1.5 text-start">
                  <label
                    htmlFor="ws-store-name"
                    className="block text-xs font-medium text-[var(--color-text-secondary)]"
                  >
                    {isAr ? "اسم المتجر أو الشركة" : "Store or Company Name"}
                  </label>
                  <input
                    id="ws-store-name"
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder={isAr ? "مثال: متجر الأناقة" : "e.g. Apex Luxury"}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
                  />
                </div>
              )}

              {/* Phone Number Field */}
              <div className="space-y-1.5 text-start">
                <label
                  htmlFor="ws-phone"
                  className="block text-xs font-medium text-[var(--color-text-secondary)]"
                >
                  {isAr ? "رقم الهاتف / الواتساب *" : "Phone / WhatsApp *"}
                </label>
                <input
                  id="ws-phone"
                  type="tel"
                  inputMode="tel"
                  required
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (phoneError) setPhoneError("");
                  }}
                  placeholder={isAr ? "01XXXXXXXXX" : "+20 100 123 4567"}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors ${
                    phoneError ? "border-red-500" : "border-[var(--color-border)]"
                  }`}
                />
                {phoneError && (
                  <p className="text-xs text-red-400 flex items-center gap-1 pt-0.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{phoneError}</span>
                  </p>
                )}
              </div>

              {/* Expected Products Field (For Store Owners) */}
              {isStoreOwner && (
                <div className="space-y-1.5 text-start">
                  <label
                    htmlFor="ws-products-count"
                    className="block text-xs font-medium text-[var(--color-text-secondary)]"
                  >
                    {isAr ? "العدد التقريبي للمنتجات" : "Expected Catalog Volume"}
                  </label>
                  <select
                    id="ws-products-count"
                    value={expectedProducts}
                    onChange={(e) => setExpectedProducts(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors cursor-pointer"
                  >
                    <option value="550 - 1,000 products">{isAr ? "550 - 1,000 منتج" : "550 - 1,000 products"}</option>
                    <option value="1,000 - 3,000 products">{isAr ? "1,000 - 3,000 منتج" : "1,000 - 3,000 products"}</option>
                    <option value="3,000 - 10,000 products">{isAr ? "3,000 - 10,000 منتج" : "3,000 - 10,000 products"}</option>
                    <option value="10,000+ enterprise products">{isAr ? "أكثر من 10,000 منتج (مؤسسي)" : "10,000+ enterprise products"}</option>
                  </select>
                </div>
              )}

              {/* Submit Error */}
              {submitError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                  {submitError}
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-full bg-[#0479E8] hover:bg-[#0083FE] text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isAr ? "جاري الإرسال..." : "Submitting..."}</span>
                    </>
                  ) : (
                    <span>{isAr ? "إرسال طلب التواصل" : "Submit Request"}</span>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

