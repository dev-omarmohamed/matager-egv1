"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { MatagerLogo } from "@/components/brand/MatagerLogo";
import { useTheme } from "@/theme/useTheme";
import { APP_ROUTES, buildStorefrontUrl, buildCashierUrl } from "@/config/routes";
import { getStoreProfile } from "@/lib/store-registry";
import { useStoreOwnerData } from "@/lib/useStoreOwnerData";
import { useDash } from "@/lib/useDash";
import { Collapse } from "./ui/Collapse";
import { focusRing } from "./ui/styles";

interface TopNavProps {
  onSearchChange?: (term: string) => void;
  searchValue?: string;
}

type Popover = "quick" | "profile" | null;

/** Close a popover on outside press or Escape. */
function useDismiss(active: boolean, onClose: () => void, ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!active) return;
    const down = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", down);
    document.addEventListener("touchstart", down, { passive: true });
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", down);
      document.removeEventListener("touchstart", down);
      document.removeEventListener("keydown", key);
    };
  }, [active, onClose, ref]);
}

const popClass = (open: boolean, origin: string) =>
  `absolute z-50 ${origin} bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-xl shadow-xl overflow-hidden transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none ${
    open ? "opacity-100 translate-y-0 scale-100 visible" : "opacity-0 -translate-y-2 scale-95 invisible pointer-events-none"
  }`;

const iconBtn = `w-9 h-9 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 text-xs bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] active:scale-95 transition-transform ${focusRing}`;

export const TopNav: React.FC<TopNavProps> = ({ onSearchChange, searchValue = "" }) => {
  const { locale, toggleLocale, t, tr } = useDash();
  const { theme, toggleTheme } = useTheme();
  const searchParams = useSearchParams();
  const { orders, products, storeConfig } = useStoreOwnerData();

  const [popover, setPopover] = useState<Popover>(null);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [focused, setFocused] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const storeId = searchParams.get("storeId") || searchParams.get("store") || (typeof window !== "undefined" ? localStorage.getItem("matager_current_store_id") : null) || "peacock_store";
  const store = useMemo(() => getStoreProfile(storeId), [storeId]);
  const ownerDisplayName = storeConfig?.store_name && storeConfig.store_name !== "My Store" ? storeConfig.store_name : (storeId.includes("A3ireYsqqIMJ5ORmeRxuWeg1EqM2") ? "Merchant Owner" : store.ownerName);
  const storeSubtitle = storeId.includes("A3ireYsqqIMJ5ORmeRxuWeg1EqM2") || storeId.startsWith("store_")
    ? `Store: ${storeId.replace("store_", "")}`
    : store.name;
  const initials = ownerDisplayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "MO";

  /* Real results from the merchant's own data (was hard-coded mock data). */
  const results = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    if (!q) return [];
    const o = orders
      .filter((x) => x.id.toLowerCase().includes(q) || x.customer.toLowerCase().includes(q))
      .slice(0, 3)
      .map((x) => ({ key: `o-${x.id}`, type: tr("Order", "طلب"), title: x.id, sub: x.customer, icon: "bi-bag-check", tab: "orders" }));
    const p = products
      .filter((x) => x.name.toLowerCase().includes(q) || x.sku.toLowerCase().includes(q))
      .slice(0, 3)
      .map((x) => ({ key: `p-${x.id}`, type: tr("Product", "منتج"), title: x.name, sub: x.sku, icon: "bi-box-seam", tab: "catalog" }));
    return [...o, ...p].slice(0, 5);
  }, [searchValue, orders, products, tr]);

  const quickLinks = [
    { label: tr("Orders", "الطلبات"), icon: "bi-bag-check", href: "#orders", tone: "text-[var(--color-status-blue)] bg-[var(--color-status-blue-bg)]" },
    { label: tr("Catalog", "الكتالوج"), icon: "bi-box-seam", href: "#catalog", tone: "text-[var(--color-status-purple)] bg-[var(--color-status-purple-bg)]" },
    { label: tr("Customers", "العملاء"), icon: "bi-people", href: "#customers", tone: "text-[var(--color-status-green)] bg-[var(--color-status-green-bg)]" },
    { label: tr("Finance", "المالية"), icon: "bi-bar-chart", href: "#finance", tone: "text-[var(--color-status-amber)] bg-[var(--color-status-amber-bg)]" },
    { label: tr("Cashier", "الكاشير"), icon: "bi-pc-display", href: buildCashierUrl(store.id), tone: "text-[var(--color-primary-light)] bg-[var(--color-primary-light)]/10", external: true },
    { label: tr("Store", "المتجر"), icon: "bi-gear", href: "#store", tone: "text-[var(--color-text-secondary)] bg-[var(--color-surface-elevated)]" },
  ];

  const closePop = useCallback(() => setPopover(null), []);
  const closeSearch = useCallback(() => setFocused(false), []);
  useDismiss(popover === "quick", closePop, quickRef);
  useDismiss(popover === "profile", closePop, profileRef);
  useDismiss(focused, closeSearch, searchRef);

  /* "/" focuses search */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(tag)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const goTo = (tab: string) => {
    window.location.hash = tab;
    setFocused(false);
    setMobileSearch(false);
  };

  const dropdown = (
    <div role="listbox" className={`${popClass(focused && !!searchValue.trim(), "top-full start-0 mt-2 w-full origin-top")}`}>
      {results.length > 0 ? (
        <ul className="py-1">
          {results.map((r) => (
            <li key={r.key}>
              <button
                type="button"
                onClick={() => goTo(r.tab)}
                className="w-full text-start px-4 py-2.5 flex items-center gap-3 active:bg-[var(--color-surface-elevated)]"
              >
                <span className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]">
                  <i className={`bi ${r.icon} text-xs`} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold text-[var(--color-text-primary)] truncate">{r.title}</span>
                  <span className="block text-[10px] text-[var(--color-text-muted)] truncate">{r.type} · {r.sub}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-4 py-5 text-center text-xs text-[var(--color-text-muted)]">
          {tr(`No results for "${searchValue}"`, `لا نتائج لـ "${searchValue}"`)}
        </p>
      )}
    </div>
  );

  const searchField = (ref: React.RefObject<HTMLDivElement>, withShortcut: boolean, autoFocus = false) => (
    <div ref={ref} className="relative">
      <div className="flex items-center w-full rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] focus-within:border-[var(--color-primary-light)] focus-within:ring-1 focus-within:ring-[var(--color-primary-light)]/40 transition-[border-color,box-shadow] shadow-sm">
        <i className="bi bi-search text-xs text-[var(--color-text-muted)] ms-3.5 shrink-0" aria-hidden="true" />
        <input
          ref={withShortcut ? inputRef : undefined}
          autoFocus={autoFocus}
          type="text"
          inputMode="search"
          value={searchValue}
          onChange={(e) => {
            onSearchChange?.(e.target.value);
            setFocused(true);
          }}
          onFocus={() => {
            setFocused(true);
            setPopover(null);
          }}
          placeholder={t.nav.searchPlaceholder}
          aria-label={t.nav.searchPlaceholder}
          className="w-full bg-transparent border-none py-2.5 md:py-2 px-2.5 text-[16px] md:text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none"
        />
        {searchValue ? (
          <button
            type="button"
            onClick={() => onSearchChange?.("")}
            aria-label={tr("Clear", "مسح")}
            className="me-2 w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[var(--color-text-muted)]"
          >
            <i className="bi bi-x-lg text-[10px]" aria-hidden="true" />
          </button>
        ) : (
          withShortcut && (
            <kbd className="me-3 hidden lg:inline-block text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-surface)] border border-[var(--color-border-subtle)] text-[var(--color-text-muted)]">
              /
            </kbd>
          )
        )}
      </div>
      {dropdown}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--color-canvas)]/90 border-b border-[var(--color-border-subtle)]">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand */}
        <a href={APP_ROUTES.dashboard} className={`flex items-center shrink-0 rounded-lg ${focusRing}`} aria-label="Matager Home">
          <MatagerLogo size="sm" showWordmark={true} />
        </a>

        {/* Desktop search */}
        <div className="flex-1 max-w-lg hidden md:block">{searchField(searchRef, true)}</div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button type="button" className={`${iconBtn} md:hidden`} onClick={() => setMobileSearch((v) => !v)} aria-label={tr("Search", "بحث")} aria-expanded={mobileSearch}>
            <i className={`bi ${mobileSearch ? "bi-x-lg" : "bi-search"}`} aria-hidden="true" />
          </button>

          {/* Quick navigation */}
          <div className="relative" ref={quickRef}>
            <button
              type="button"
              onClick={() => setPopover((p) => (p === "quick" ? null : "quick"))}
              aria-expanded={popover === "quick"}
              aria-label={tr("Quick navigation", "تنقل سريع")}
              className={iconBtn}
            >
              <i className="bi bi-grid" aria-hidden="true" />
            </button>
            <div className={`${popClass(popover === "quick", "top-full end-0 mt-2 w-64 origin-top-right")} p-2`}>
              <div className="grid grid-cols-3 gap-1.5">
                {quickLinks.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    target={l.external ? "_blank" : undefined}
                    rel={l.external ? "noreferrer" : undefined}
                    onClick={closePop}
                    className="flex flex-col items-center gap-1 py-2.5 rounded-lg active:bg-[var(--color-surface-elevated)]"
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center ${l.tone}`}>
                      <i className={`bi ${l.icon} text-xs`} aria-hidden="true" />
                    </span>
                    <span className="text-[10px] font-bold text-[var(--color-text-primary)] font-ui">{l.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Language */}
          <button
            type="button"
            onClick={toggleLocale}
            aria-label={t.nav.switchLang}
            className={`${iconBtn} sm:!w-auto sm:px-2.5 sm:gap-1.5 font-bold font-ui`}
          >
            <i className="bi bi-translate text-[var(--color-primary-light)]" aria-hidden="true" />
            <span className="hidden sm:inline text-[11px]">{t.nav.switchLang}</span>
          </button>

          {/* Theme */}
          <button type="button" onClick={toggleTheme} aria-label={t.nav.switchTheme} className={iconBtn}>
            <i className={`bi ${theme === "dark" ? "bi-sun text-[var(--color-status-amber)]" : "bi-moon-stars text-[var(--color-primary-light)]"}`} aria-hidden="true" />
          </button>

          {/* Open storefront */}
          <a
            href={buildStorefrontUrl(store.id)}
            target="_blank"
            rel="noreferrer"
            aria-label={t.nav.openStorefront}
            className={`h-9 sm:h-8 px-3 rounded-full flex items-center gap-1.5 text-xs font-bold font-ui text-white bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] shadow-sm active:scale-[0.97] transition-transform ${focusRing}`}
          >
            <i className="bi bi-arrow-up-right-square" aria-hidden="true" />
            <span className="hidden lg:inline">{t.nav.openStorefront}</span>
          </a>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setPopover((p) => (p === "profile" ? null : "profile"))}
              aria-expanded={popover === "profile"}
              aria-label={tr("Account menu", "قائمة الحساب")}
              className={`flex items-center gap-2 rounded-full ${focusRing}`}
            >
              <span className="relative">
                <span className="w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white bg-gradient-to-tr from-[var(--color-primary-dark)] to-[var(--color-primary-light)] shadow-sm">
                  {initials}
                </span>
                <span className="absolute -bottom-0.5 -end-0.5 w-2.5 h-2.5 rounded-full bg-[var(--color-status-green)] border-2 border-[var(--color-canvas)]" />
              </span>
              <span className="hidden xl:flex flex-col leading-none text-start">
                <span className="text-xs font-bold font-ui text-[var(--color-text-primary)]">{ownerDisplayName}</span>
                <span className="text-[10px] font-subtitle text-[var(--color-text-muted)] mt-0.5 truncate max-w-[150px]">{storeSubtitle}</span>
              </span>
              <i className={`hidden sm:block bi bi-chevron-down text-[10px] text-[var(--color-text-muted)] transition-transform duration-200 ${popover === "profile" ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>

            <div className={`${popClass(popover === "profile", "top-full end-0 mt-2 w-52 origin-top-right")} py-1`}>
              <a href="#store" onClick={closePop} className="w-full text-start px-4 py-2.5 text-xs font-medium text-[var(--color-text-secondary)] flex items-center gap-2 active:bg-[var(--color-surface-elevated)]">
                <i className="bi bi-person-gear text-sm text-[var(--color-primary-light)]" aria-hidden="true" />
                {tr("Edit Profile", "تعديل الملف الشخصي")}
              </a>
              <a href="#store" onClick={closePop} className="w-full text-start px-4 py-2.5 text-xs font-medium text-[var(--color-text-secondary)] flex items-center gap-2 active:bg-[var(--color-surface-elevated)]">
                <i className="bi bi-shop text-sm text-[var(--color-primary-light)]" aria-hidden="true" />
                {tr("Store Settings", "إعدادات المتجر")}
              </a>
              <div className="h-px bg-[var(--color-border-subtle)] my-1" />
              <button type="button" onClick={closePop} className="w-full text-start px-4 py-2.5 text-xs font-bold text-[var(--color-status-red)] flex items-center gap-2 active:bg-[var(--color-status-red-bg)]">
                <i className="bi bi-trash3 text-sm" aria-hidden="true" />
                {tr("Delete Store", "حذف المتجر")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile search row */}
      <Collapse open={mobileSearch} className="md:hidden">
        <div className="px-3 pb-3">{mobileSearch && searchField(mobileSearchRef, false, true)}</div>
      </Collapse>
    </header>
  );
};
