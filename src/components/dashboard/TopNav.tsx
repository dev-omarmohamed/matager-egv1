"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MatagerLogo } from "@/components/brand/MatagerLogo";
import { useDashboardLanguage } from "@/lib/i18n";
import { useTheme } from "@/theme/useTheme";
import { APP_ROUTES, buildStorefrontUrl, buildCashierUrl } from "@/config/routes";
import { getStoreProfile, getAllRegisteredStores } from "@/lib/store-registry";

interface TopNavProps {
  onSearchChange?: (term: string) => void;
  searchValue?: string;
}

// Mock data for the dynamic search
const MOCK_SEARCH_DATA = [
  { id: 1, type: "Order", title: "Order #1042", subtitle: "Mohamed Ali", icon: "bi-bag-check" },
  { id: 2, type: "Product", title: "Premium T-Shirt", subtitle: "SKU-001", icon: "bi-box-seam" },
  { id: 3, type: "Customer", title: "Sarah Ahmed", subtitle: "sarah@example.com", icon: "bi-person" },
  { id: 4, type: "Order", title: "Order #1043", subtitle: "John Doe", icon: "bi-bag-check" },
  { id: 5, type: "Product", title: "Wireless Headphones", subtitle: "SKU-002", icon: "bi-box-seam" },
];

// Quick navigation links
const QUICK_LINKS = [
  { label: "Orders", icon: "bi-bag-check", href: APP_ROUTES || "/dashboard/orders", color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Products", icon: "bi-box-seam", href: APP_ROUTES || "/dashboard/products", color: "text-purple-500", bg: "bg-purple-500/10" },
  { label: "Customers", icon: "bi-people", href: APP_ROUTES || "/dashboard/customers", color: "text-green-500", bg: "bg-green-500/10" },
  { label: "Analytics", icon: "bi-bar-chart", href: APP_ROUTES || "/dashboard/analytics", color: "text-orange-500", bg: "bg-orange-500/10" },
  { label: "Cashier", icon: "bi-cash-register", href: buildCashierUrl("peacock_store"), color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { label: "Settings", icon: "bi-gear", href: APP_ROUTES || "/dashboard/settings", color: "text-gray-500", bg: "bg-gray-500/10" },
];

export const TopNav: React.FC<TopNavProps> = ({ onSearchChange, searchValue = "" }) => {
  const { locale, dir, toggleLocale, t } = useDashboardLanguage();
  const { theme, toggleTheme } = useTheme();
  const searchParams = useSearchParams();
  const router = useRouter();

  // States for dropdowns
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isQuickNavOpen, setIsQuickNavOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Refs for click outside
  const searchRef = useRef<HTMLDivElement>(null);
  const quickNavRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const storeIdParam = searchParams.get("storeId") || searchParams.get("store") || "peacock_store";
  const activeStore = useMemo(() => getStoreProfile(storeIdParam), [storeIdParam]);
  const allStores = useMemo(() => getAllRegisteredStores(), []);

  // Filter search results
  const filteredResults = useMemo(() => {
    if (!searchValue.trim()) return [];
    const lowerSearch = searchValue.toLowerCase();
    return MOCK_SEARCH_DATA.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerSearch) ||
        item.subtitle.toLowerCase().includes(lowerSearch) ||
        item.type.toLowerCase().includes(lowerSearch)
    ).slice(0, 5);
  }, [searchValue]);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !isSearchFocused) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchFocused]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (quickNavRef.current && !quickNavRef.current.contains(event.target as Node)) {
        setIsQuickNavOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--color-canvas)]/90 border-b border-[var(--color-border-subtle)] transition-colors duration-200">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Left: Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={APP_ROUTES.dashboard}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
            aria-label="Matager Home"
          >
            <MatagerLogo size="sm" showWordmark={true} />
          </a>
        </div>

        {/* Center: Global Search Bar with Integrated Grid Toggle */}
        <div className="flex-1 max-w-lg mx-2 hidden md:block" ref={searchRef}>
          <div className="relative">
            {/* Search Input Wrapper */}
            <div className="relative flex items-center w-full bg-gray-100 dark:bg-[var(--input-bg-gradient)] border border-[var(--color-border-subtle)] rounded-full focus-within:border-[var(--color-primary-light)] focus-within:ring-1 focus-within:ring-[var(--color-primary-light)]/40 transition-all font-ui shadow-sm">

              {/* Integrated Grid Toggle Button (Logical Margins for RTL) */}
              <button
                type="button"
                onClick={() => {
                  setIsQuickNavOpen(!isQuickNavOpen);
                  setIsSearchFocused(false); // Close search if grid is opened
                }}
                className={`flex items-center justify-center w-8 h-8 ms-1 rounded-full transition-colors ${isQuickNavOpen
                  ? "bg-[var(--color-primary-light)]/20 text-[var(--color-primary-light)]"
                  : "text-[var(--color-text-muted)] hover:bg-black/5 dark:hover:bg-white/10 hover:text-[var(--color-text-primary)]"
                  }`}
                aria-label="Toggle Quick Navigation"
              >
                <i className="bi bi-grid text-[13px]" />
              </button>

              <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1 shrink-0" />

              {/* Search Icon */}
              <i className="bi bi-search text-xs text-[var(--color-text-muted)] ms-1 shrink-0" />

              {/* Input */}
              <input
                ref={searchInputRef}
                type="text"
                value={searchValue}
                onChange={(e) => {
                  onSearchChange?.(e.target.value);
                  setIsSearchFocused(true);
                }}
                onFocus={() => {
                  setIsSearchFocused(true);
                  setIsQuickNavOpen(false); // Close quick nav if search is focused
                  setIsProfileOpen(false);
                }}
                placeholder={t.nav.searchPlaceholder}
                className="w-full bg-transparent border-none py-2 px-2 text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-0"
              />

              {/* Shortcut Hint */}
              <kbd className="absolute end-3 top-1/2 -translate-y-1/2 text-[9px] px-1.5 py-0.5 rounded bg-white dark:bg-white/10 border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] pointer-events-none hidden lg:inline-block">
                /
              </kbd>
            </div>

            {/* Search Results Dropdown (Smooth Animation) */}
            <div
              className={`absolute top-full left-0 mt-2 w-full bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-xl shadow-xl overflow-hidden z-50 origin-top transition-all duration-200 ease-out ${isSearchFocused && searchValue.trim()
                ? "opacity-100 translate-y-0 scale-y-100 visible"
                : "opacity-0 -translate-y-2 scale-y-95 invisible pointer-events-none"
                }`}
            >
              {filteredResults.length > 0 ? (
                <ul className="py-1">
                  {filteredResults.map((result) => (
                    <li key={result.id}>
                      <button
                        onClick={() => {
                          setIsSearchFocused(false);
                          console.log("Navigate to", result);
                        }}
                        className="w-full text-start px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-3 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center text-[var(--color-text-secondary)] shrink-0">
                          <i className={`bi ${result.icon} text-xs`} />
                        </div>
                        <div className="flex flex-col text-start">
                          <span className="text-xs font-bold text-[var(--color-text-primary)]">{result.title}</span>
                          <span className="text-[10px] text-[var(--color-text-muted)]">{result.type} • {result.subtitle}</span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-6 text-center text-xs text-[var(--color-text-muted)]">
                  No results found for "{searchValue}"
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Cluster: Controls & Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Language Toggle */}
          <button
            type="button"
            onClick={toggleLocale}
            className="px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-[var(--color-border-subtle)] text-xs font-bold font-ui text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all flex items-center gap-1.5"
            aria-label={t.nav.switchLang}
          >
            <i className="bi bi-translate text-xs text-[var(--color-primary-light)]" />
            <span className="text-[11px]">{t.nav.switchLang}</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all flex items-center justify-center text-xs"
            aria-label={t.nav.switchTheme}
          >
            {theme === "dark" ? (
              <i className="bi bi-sun text-xs text-[var(--color-status-amber)]" />
            ) : (
              <i className="bi bi-moon-stars text-xs text-[var(--color-primary-light)]" />
            )}
          </button>

          {/* Open Storefront Primary Gradient Button */}
          <a
            href={buildStorefrontUrl(activeStore.id)}
            target="_blank"
            className="px-3.5 py-2 rounded-full bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] text-white text-xs font-bold font-ui shadow-sm hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
          >
            <i className="bi bi-arrow-up-right-square text-xs" />
            <span className="hidden sm:inline-block">{t.nav.openStorefront}</span>
          </a>

          {/* Merchant Avatar Chip & Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 ps-1 group focus:outline-none"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--color-primary-dark)] to-[var(--color-primary-light)] flex items-center justify-center text-[11px] font-bold text-white shadow-sm font-ui">
                  {activeStore.ownerName.split(" ").map((n) => n[0]).join("").slice(0, 2) || "MA"}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 rtl:-right-auto rtl:-left-0.5 w-2.5 h-2.5 rounded-full bg-[var(--color-status-green)] border-2 border-[var(--color-canvas)]" />
              </div>

              <div className="hidden xl:flex flex-col leading-none text-start">
                <span className="text-xs font-bold font-ui text-[var(--color-text-primary)] group-hover:text-[var(--color-primary-light)] transition-colors">
                  {activeStore.ownerName}
                </span>
                <span className="text-[10px] font-subtitle text-[var(--color-text-muted)] mt-0.5">
                  {activeStore.name} Owner
                </span>
              </div>

              {/* Small Chevron Indicator */}
              <i className={`bi bi-chevron-down text-[10px] text-[var(--color-text-muted)] transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Profile Dropdown Menu */}
            <div
              className={`absolute top-full end-0 mt-3 w-48 bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-xl shadow-xl overflow-hidden z-50 origin-top-right transition-all duration-200 ease-out ${isProfileOpen
                ? "opacity-100 translate-y-0 scale-100 visible"
                : "opacity-0 -translate-y-2 scale-95 invisible pointer-events-none"
                }`}
            >
              <div className="py-1">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    // router.push(APP_ROUTES.profile);
                  }}
                  className="w-full text-start px-4 py-2.5 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-gray-100 dark:hover:bg-white/5 hover:text-[var(--color-text-primary)] flex items-center gap-2 transition-colors"
                >
                  <i className="bi bi-person-gear text-sm text-[var(--color-primary-light)]" />
                  Edit Profile
                </button>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    // router.push(APP_ROUTES.storeSettings);
                  }}
                  className="w-full text-start px-4 py-2.5 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-gray-100 dark:hover:bg-white/5 hover:text-[var(--color-text-primary)] flex items-center gap-2 transition-colors"
                >
                  <i className="bi bi-shop text-sm text-[var(--color-primary-light)]" />
                  Store Settings
                </button>

                <div className="h-px w-full bg-[var(--color-border-subtle)] my-1" />

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    // Add delete store logic here
                  }}
                  className="w-full text-start px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                >
                  <i className="bi bi-trash3 text-sm" />
                  Delete Store
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Panel (Smooth Animated Dropdown) */}
      <div
        ref={quickNavRef}
        className={`absolute top-full left-0 w-full bg-[var(--color-canvas)] border-b border-[var(--color-border-subtle)] shadow-xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] origin-top overflow-hidden z-40 ${isQuickNavOpen
          ? "opacity-100 translate-y-0 visible"
          : "opacity-0 -translate-y-4 invisible pointer-events-none"
          }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Badge-style Quick Links */}
          <div className="flex flex-wrap gap-2.5">
            {QUICK_LINKS.map((link, idx) => (
              <a
                key={idx}

                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-border-subtle)] bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all shadow-sm hover:shadow group"
              >
                <div className={`w-5 h-5 rounded-full ${link.bg} ${link.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  <i className={`bi ${link.icon} text-[10px]`} />
                </div>
                <span className="text-[11px] font-bold text-[var(--color-text-primary)] font-ui whitespace-nowrap">
                  {link.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};