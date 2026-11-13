"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDashboardLanguage } from "@/lib/i18n";
import { StatusPill } from "@/components/ui/StatusPill";
import { STORE_CATEGORIES, StoreCategory, CATEGORY_LABELS } from "@/lib/categories";
import { saveWholesaler, Wholesaler } from "@/lib/wholesalers";
import { MapPin, ExternalLink } from "lucide-react";
import {
  ARAB_COUNTRIES,
  getCitiesForCountry,
  getCityCoordinates,
  generateGoogleMapsUrl,
} from "@/lib/arab-countries";

interface WholesalerSignupWizardProps {
  onClose?: () => void;
  onSuccess?: (wholesalerId: string) => void;
}

export const WholesalerSignupWizard: React.FC<WholesalerSignupWizardProps> = ({
  onClose,
  onSuccess,
}) => {
  const router = useRouter();
  const { t, locale, dir } = useDashboardLanguage();
  const isAr = locale === "ar";

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);

  // Step 1: Business Identity
  const [businessName, setBusinessName] = useState("");
  const [businessNameAr, setBusinessNameAr] = useState("");
  const [crNumber, setCrNumber] = useState("");

  // Step 2: Supply Categories
  const [selectedCategories, setSelectedCategories] = useState<StoreCategory[]>(["clothing"]);

  // Step 3: Location & Contact
  const [country, setCountry] = useState("Egypt");
  const [city, setCity] = useState("Cairo");
  const [address, setAddress] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [locationUrl, setLocationUrl] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const availableCities = useMemo(() => getCitiesForCountry(country), [country]);

  const handleCountryChange = (cName: string) => {
    setCountry(cName);
    const newCities = getCitiesForCountry(cName);
    setCity(newCities.length > 0 ? newCities[0].name_en : "");
    setLocationUrl(null);
    setLocationStatus(null);
  };

  const handleLocateOnMap = () => {
    setIsLocating(true);
    setLocationStatus(null);

    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(6));
          const lng = Number(pos.coords.longitude.toFixed(6));
          const gMapUrl = generateGoogleMapsUrl(lat, lng);
          setLocationUrl(gMapUrl);
          setIsLocating(false);
          setLocationStatus(
            isAr
              ? `تم تحديد موقعك بدقة على الخريطة (${lat}, ${lng})`
              : `Location coordinates detected (${lat}, ${lng})`
          );

          setAddress((prev) => {
            const clean = prev.trim();
            if (!clean) {
              return `${city || country} - ${gMapUrl}`;
            }
            if (clean.includes("google.com/maps")) return clean;
            return `${clean} - ${gMapUrl}`;
          });
        },
        (err) => {
          const cityCoords = getCityCoordinates(country, city);
          if (cityCoords) {
            const gMapUrl = generateGoogleMapsUrl(cityCoords.lat, cityCoords.lng);
            setLocationUrl(gMapUrl);
            setLocationStatus(
              isAr
                ? `تم اعتماد إحداثيات مركز ${city || country} على خرائط جوجل`
                : `Using coordinates for ${city || country}`
            );
            setAddress((prev) => {
              const clean = prev.trim();
              if (!clean) {
                return `${city || country} - ${gMapUrl}`;
              }
              if (clean.includes("google.com/maps")) return clean;
              return `${clean} - ${gMapUrl}`;
            });
          } else {
            setLocationStatus(
              isAr
                ? "تعذر تحديد الإحداثيات آلياً. يرجى إدخال العنوان يدوياً."
                : "Unable to detect GPS. Please enter your address."
            );
          }
          setIsLocating(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 60000,
        }
      );
    } else {
      const cityCoords = getCityCoordinates(country, city);
      if (cityCoords) {
        const gMapUrl = generateGoogleMapsUrl(cityCoords.lat, cityCoords.lng);
        setLocationUrl(gMapUrl);
        setLocationStatus(
          isAr
            ? `تم اعتماد إحداثيات مركز ${city || country} على خرائط جوجل`
            : `Using coordinates for ${city || country}`
        );
      }
      setIsLocating(false);
    }
  };

  // Step 4: Trade Terms
  const [minOrderValue, setMinOrderValue] = useState<number>(3000);
  const [paymentTerms, setPaymentTerms] = useState<string>("Net-30");

  // Step 5: Security & Verification
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Step 6: Plan Selection
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "pro" | "enterprise">("pro");

  // State
  const [error, setError] = useState<string | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);

  const toggleCategory = (cat: StoreCategory) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter((c) => c !== cat));
      }
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!businessName.trim()) {
        setError(isAr ? "يرجى إدخال اسم المنشأة" : "Please enter your business trade name");
        return;
      }
    } else if (step === 2) {
      if (selectedCategories.length === 0) {
        setError(isAr ? "يرجى اختيار تصنيف واحد على الأقل" : "Please select at least one category");
        return;
      }
    } else if (step === 3) {
      if (!email.trim() || !phone.trim()) {
        setError(isAr ? "يرجى إدخال البريد الإلكتروني ورقم الهاتف" : "Please enter email and phone number");
        return;
      }
    } else if (step === 5) {
      if (password.length < 6) {
        setError(isAr ? "كلمة المرور يجب أن لا تقل عن 6 أحرف" : "Password must be at least 6 characters");
        return;
      }
      if (password !== confirmPassword) {
        setError(isAr ? "كلمتا المرور غير متطابقتين" : "Passwords do not match");
        return;
      }
      if (!agreeTerms) {
        setError(isAr ? "يجب الموافقة على شروط التوريد" : "You must agree to wholesale supply terms");
        return;
      }
    }
    setStep((prev) => (prev < 7 ? ((prev + 1) as any) : prev));
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => (prev > 1 ? ((prev - 1) as any) : prev));
  };

  const handleLaunch = async () => {
    setIsLaunching(true);
    setError(null);
    try {
      const wholesalerId = `wholesaler_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newWholesaler: Wholesaler = {
        id: wholesalerId,
        profile: {
          name: businessName.trim(),
          nameAr: businessNameAr.trim() || businessName.trim(),
          description: `Direct wholesaler for ${selectedCategories.join(", ")}`,
          descriptionAr: `مورد جملة معتمد لتصنيفات ${selectedCategories.join("، ")}`,
          categories: selectedCategories,
          country,
          city,
          contact: {
            email: email.trim(),
            phone: phone.trim(),
            whatsapp: whatsapp.trim() || phone.trim(),
          },
          minOrderValue,
          currency: "EGP",
          status: "active",
          createdAt: new Date().toISOString(),
        },
        products: {},
      };

      await saveWholesaler(newWholesaler);

      if (typeof window !== "undefined") {
        localStorage.setItem("matager_user_role", "wholesaler");
        localStorage.setItem("matager_wholesaler_id", wholesalerId);
      }

      onSuccess?.(wholesalerId);
      onClose?.();
      router.push(`/wholesaler?wholesalerId=${wholesalerId}`);
    } catch (err: any) {
      setError(err?.message || "Failed to initialize wholesaler profile");
      setIsLaunching(false);
    }
  };

  const stepsMeta = [
    { num: 1, title: t.auth.wholesalerSignup.step1Title },
    { num: 2, title: t.auth.wholesalerSignup.step2Title },
    { num: 3, title: t.auth.wholesalerSignup.step3Title },
    { num: 4, title: t.auth.wholesalerSignup.step4Title },
    { num: 5, title: t.auth.wholesalerSignup.step5Title },
    { num: 6, title: t.auth.wholesalerSignup.step6Title },
    { num: 7, title: t.auth.wholesalerSignup.step7Title },
  ];

  return (
    <div className="space-y-5">
      {/* Step Indicators */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)] block">
            Step {step} of 7
          </span>
          <h3 className="text-sm font-bold font-heading text-[var(--color-text-primary)]">
            {stepsMeta[step - 1].title}
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          {stepsMeta.map((s) => (
            <span
              key={s.num}
              className={`w-2 h-2 rounded-full transition-all ${
                s.num === step
                  ? "w-5 bg-[var(--color-primary)]"
                  : s.num < step
                  ? "bg-[var(--color-primary-light)]"
                  : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-[var(--color-status-red-bg)] border border-[var(--color-status-red-border)] text-xs text-[var(--color-status-red)] flex items-center gap-2">
          <i className="bi bi-exclamation-triangle" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Business Identity */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
              Wholesaler / Company Trade Name (EN) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Nile Garments & Textiles Ltd."
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--input-border-color)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
              اسم المنشأة أو الشركة (بالعربية)
            </label>
            <input
              type="text"
              placeholder="شركة النيل للأقمشة والملابس الجاهزة"
              value={businessNameAr}
              onChange={(e) => setBusinessNameAr(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--input-border-color)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
              Commercial Registration (CR) / Tax Number
            </label>
            <input
              type="text"
              placeholder="CR-1049281 / 482-910"
              value={crNumber}
              onChange={(e) => setCrNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--input-border-color)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        </div>
      )}

      {/* Step 2: Supply Categories */}
      {step === 2 && (
        <div className="space-y-3">
          <p className="text-xs text-[var(--color-text-muted)]">
            Select the categories your manufacturing or distribution hub supplies. Only retailers matching these categories will view your catalog.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {STORE_CATEGORIES.map((cat) => {
              const isSelected = selectedCategories.includes(cat);
              const label = CATEGORY_LABELS[cat][isAr ? "ar" : "en"];

              return (
                <div
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-center justify-between ${
                    isSelected
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 shadow-sm"
                      : "border-[var(--color-border-subtle)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]"
                  }`}
                >
                  <span className="text-xs font-bold text-[var(--color-text-primary)]">
                    {label}
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? "border-transparent bg-[var(--color-primary)] text-white"
                        : "border-[var(--color-border-subtle)]"
                    }`}
                  >
                    {isSelected && <i className="bi bi-check text-[10px]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Location & Contact */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
                {isAr ? "الدولة (22 دولة عربية) *" : "Country (22 Arab Countries) *"}
              </label>
              <div className="relative">
                <select
                  value={country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--input-border-color)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] appearance-none cursor-pointer pr-10 rtl:pr-3.5 rtl:pl-10"
                >
                  {ARAB_COUNTRIES.map((c) => (
                    <option
                      key={c.id}
                      value={c.name}
                      className="bg-[var(--color-surface)] text-[var(--color-text-primary)]"
                    >
                      {isAr ? `${c.nameAr} (${c.currencyAr})` : `${c.name} (${c.currency})`}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center px-3 text-[var(--color-text-muted)]">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
                {isAr ? "المدينة (اختيار إلزامي من المدن المعتمدة) *" : "City (Strict Selection) *"}
              </label>
              <div className="relative">
                <select
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--input-border-color)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] appearance-none cursor-pointer pr-10 rtl:pr-3.5 rtl:pl-10"
                >
                  <option value="" disabled className="text-[var(--color-text-muted)]">
                    {isAr ? "── اختر المدينة من القائمة ──" : "── Select city from list ──"}
                  </option>
                  {availableCities.map((c) => {
                    const displayName = isAr
                      ? c.name_ar && c.name_ar !== c.name_en
                        ? `${c.name_ar} (${c.name_en})`
                        : c.name_ar || c.name_en
                      : c.name_en;
                    return (
                      <option
                        key={c.id}
                        value={c.name_en}
                        className="bg-[var(--color-surface)] text-[var(--color-text-primary)]"
                      >
                        {displayName}
                      </option>
                    );
                  })}
                </select>
                <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center px-3 text-[var(--color-text-muted)]">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[var(--color-text-secondary)]">
                {isAr ? "عنوان المصنع / المستودع وتحديد الخريطة" : "Warehouse / Factory Address & Map"}
              </label>
              <button
                type="button"
                onClick={handleLocateOnMap}
                disabled={isLocating}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[11px] font-medium bg-[var(--color-primary-light)]/10 text-[var(--color-primary-light)] hover:bg-[var(--color-primary-light)]/20 border border-[var(--color-primary-light)]/30 transition-colors disabled:opacity-50"
                title={isAr ? "تحديد الموقع عبر خرائط جوجل" : "Locate using Google Maps"}
              >
                {isLocating ? (
                  <>
                    <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>{isAr ? "جاري التحديد..." : "Locating..."}</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-3 h-3" />
                    <span>{isAr ? "تحديد عبر خرائط جوجل" : "Locate on Google Maps"}</span>
                  </>
                )}
              </button>
            </div>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={
                isAr
                  ? "المنطقة الصناعية، العاشر من رمضان أو رابط الخريطة"
                  : "Industrial Zone, Area B4, or Google Maps URL"
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--input-border-color)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
            {(locationUrl || locationStatus) && (
              <div className="mt-2 p-2.5 rounded-[8px] bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[11px] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="text-[var(--color-text-secondary)] truncate">
                    {locationStatus || (isAr ? "تم إرفاق إحداثيات خرائط جوجل" : "Google Maps attached")}
                  </span>
                </div>
                {locationUrl && (
                  <a
                    href={locationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-[var(--color-primary-light)] hover:underline shrink-0"
                  >
                    <span>{isAr ? "عرض على الخريطة" : "View Map"}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
                Wholesale Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="wholesale@company.eg"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--input-border-color)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+20 10 1234 5678"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--input-border-color)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
                WhatsApp Trade Line
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+20 10 1234 5678"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--input-border-color)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Trade Terms */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
                Default Minimum Order Value (EGP) *
              </label>
              <input
                type="number"
                min={500}
                required
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--input-border-color)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
                Settlement & Payment Terms *
              </label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--input-border-color)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              >
                <option value="Net-30">Net-30 Trade Credit (آجل 30 يوم)</option>
                <option value="Cash on Delivery">Cash on Delivery (دفع عند الاستلام)</option>
                <option value="Pre-paid">Advance Wire / Pre-paid (دفع مسبق بالتحويل)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Security & Verification */}
      {step === 5 && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
              Create Admin Password *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--input-border-color)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
              Confirm Password *
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--input-border-color)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[var(--color-text-secondary)] pt-2">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 rounded border-[var(--input-border-color)] text-[var(--color-primary)] focus:ring-0"
            />
            <span>
              I agree to the Matager B2B Trade Agreement, genuine inventory declaration, and manufacturer fulfillment obligations.
            </span>
          </label>
        </div>
      )}

      {/* Step 6: Plan Selection */}
      {step === 6 && (
        <div className="space-y-3">
          <p className="text-xs text-[var(--color-text-muted)]">
            Select a distribution plan for your wholesale portal.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: "starter" as const,
                title: "Starter",
                price: "Free",
                skus: "Up to 50 SKUs",
                badge: "Pilot",
              },
              {
                id: "pro" as const,
                title: "Pro Wholesaler",
                price: "1,499 EGP/mo",
                skus: "Unlimited SKUs",
                badge: "Popular",
              },
              {
                id: "enterprise" as const,
                title: "Enterprise Hub",
                price: "3,499 EGP/mo",
                skus: "Priority Dispatch",
                badge: "High Volume",
              },
            ].map((p) => {
              const isSelected = selectedPlan === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlan(p.id)}
                  className={`p-4 rounded-xl border cursor-pointer select-none transition-all ${
                    isSelected
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 shadow-sm"
                      : "border-[var(--color-border-subtle)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[var(--color-text-primary)]">
                      {p.title}
                    </span>
                    <StatusPill variant={isSelected ? "success" : "neutral"}>
                      {p.badge}
                    </StatusPill>
                  </div>
                  <div className="text-base font-black text-[var(--color-text-primary)] mb-1">
                    {p.price}
                  </div>
                  <div className="text-[11px] text-[var(--color-text-muted)]">
                    {p.skus}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 7: Review & Launch */}
      {step === 7 && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-subtle)] space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-2.5">
              <span className="text-xs text-[var(--color-text-muted)]">Business Entity</span>
              <span className="text-xs font-bold text-[var(--color-text-primary)]">
                {businessName}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-2.5">
              <span className="text-xs text-[var(--color-text-muted)]">Territory & City</span>
              <span className="text-xs font-bold text-[var(--color-text-primary)]">
                {city}, {country}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-2.5">
              <span className="text-xs text-[var(--color-text-muted)]">Categories</span>
              <div className="flex flex-wrap gap-1">
                {selectedCategories.map((c) => (
                  <StatusPill key={c} variant="info">
                    {CATEGORY_LABELS[c][isAr ? "ar" : "en"]}
                  </StatusPill>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--color-text-muted)]">Min. Order Value</span>
              <span className="text-xs font-bold text-[var(--color-text-primary)]">
                {minOrderValue.toLocaleString()} EGP
              </span>
            </div>
          </div>

          <p className="text-[11px] text-[var(--color-text-muted)] text-center">
            Clicking below initializes your Wholesaler Console and links your verified catalog to category-matching retail merchants.
          </p>
        </div>
      )}

      {/* Wizard Footer Controls */}
      <div className="pt-3 flex items-center justify-between border-t border-[var(--color-border-subtle)]">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] text-xs font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all"
          >
            {t.auth.roleChooser.back}
          </button>
        ) : (
          <div />
        )}

        {step < 7 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-5 py-2 rounded-xl bg-[var(--gradient-primary)] text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            {t.auth.roleChooser.continue}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleLaunch}
            disabled={isLaunching}
            className="px-6 py-2.5 rounded-xl bg-[var(--gradient-primary)] text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-md disabled:opacity-50"
          >
            {isLaunching ? "Launching..." : t.auth.wholesalerSignup.launchConsole}
          </button>
        )}
      </div>
    </div>
  );
};

