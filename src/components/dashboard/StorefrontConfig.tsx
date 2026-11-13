"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Store,
  Layers,
  Sparkles,
  ExternalLink,
  Laptop,
  CheckCircle2,
  RefreshCw,
  ShoppingBag,
  Globe,
  Truck,
  Palette,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useDashboardLanguage } from "@/lib/i18n";
import { APP_ROUTES } from "@/config/routes";

export const StorefrontConfig: React.FC = () => {
  const { t, locale } = useDashboardLanguage();
  const isAr = locale === "ar";

  const [activeTab, setActiveTab] = useState<"storefront" | "posSync" | "themes" | "logistics">("storefront");
  const [storeMode, setStoreMode] = useState<"fastCart" | "gallery">("fastCart");
  const [universalCartEnabled, setUniversalCartEnabled] = useState(true);
  const [posSyncEnabled, setPosSyncEnabled] = useState(true);
  const [primaryPosNode, setPrimaryPosNode] = useState("TERM-01");
  const [autoReserveStock, setAutoReserveStock] = useState(true);
  const [domainInput, setDomainInput] = useState("peacock.matager.com");

  // Carrier toggles
  const [bostaConnected, setBostaConnected] = useState(true);
  const [dhlConnected, setDhlConnected] = useState(false);
  const [aramexConnected, setAramexConnected] = useState(true);

  return (
    <div className="glass-panel rounded-[20px] bg-[var(--color-glass-card-bg)] border border-[var(--color-glass-card-border)] shadow-[var(--shadow-glass-card)] overflow-hidden transition-all duration-200 hover:-translate-y-[1px]">
      <input
        type="checkbox"
        id="toggle-storefront"
        className="peer/store hidden"
        aria-hidden="true"
        defaultChecked
      />

      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-[var(--color-border-subtle)] flex flex-wrap justify-between items-center gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1">
              <Store className="w-3 h-3" /> Storefront Engine
            </span>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {isAr ? "متزامن مع نقاط البيع" : "POS Cashier Node Synced"}
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-bold font-heading text-[var(--color-text-primary)]">
            {isAr ? "إدارة متجر المالك والسلة السريعة ونقاط البيع" : "Storefront FastCart & 3D Gallery Architecture"}
          </h3>
          <p className="text-[11px] font-subtitle text-[var(--color-text-muted)] mt-0.5">
            {isAr
              ? "تحكم في طريقة عرض السلة السريعة والمعرض ثلاثي الأبعاد والمزامنة الحية مع شاشات الكاشير."
              : "Manage owner storefront presentation modes, multi-store universal dock, and live sync with in-store POS cashier nodes."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={APP_ROUTES.storefront}
            target="_blank"
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0479E8] to-[#0083FE] hover:brightness-110 active:scale-95 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/20"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{isAr ? "معاينة المتجر المباشر" : "Launch Storefront"}</span>
          </Link>

          <label
            htmlFor="toggle-storefront"
            className="text-[11px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1.5 transition-colors group cursor-pointer select-none peer-checked/store:[&_.store-chevron]:rotate-180"
          >
            <span className="tracking-wide">{t.storefrontConfig.showDetails}</span>
            <i className="bi bi-chevron-down transition-transform duration-300 group-hover:text-[var(--color-text-primary)] store-chevron text-[10px]" />
          </label>
        </div>
      </div>

      {/* Collapsible Content */}
      <div className="max-h-0 overflow-hidden transition-all duration-500 ease-in-out peer-checked/store:max-h-[850px] bg-white/[0.01]">
        {/* Navigation Tabs */}
        <div className="px-5 pt-3 border-b border-[var(--color-border-subtle)] flex gap-4 text-xs overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("storefront")}
            className={`font-bold pb-2 transition-all flex items-center gap-1.5 ${
              activeTab === "storefront"
                ? "text-[var(--color-primary-light)] border-b-2 border-[var(--color-primary-light)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isAr ? "طريقة العرض والسلة" : "FastCart & Gallery"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("posSync")}
            className={`font-bold pb-2 transition-all flex items-center gap-1.5 ${
              activeTab === "posSync"
                ? "text-[var(--color-primary-light)] border-b-2 border-[var(--color-primary-light)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>{isAr ? "مزامنة نقاط البيع POS" : "POS Cashier Node Sync"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("themes")}
            className={`font-bold pb-2 transition-all flex items-center gap-1.5 ${
              activeTab === "themes"
                ? "text-[var(--color-primary-light)] border-b-2 border-[var(--color-primary-light)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>{isAr ? "الثيمات والمظهر" : "Themes & Branding"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("logistics")}
            className={`font-bold pb-2 transition-all flex items-center gap-1.5 ${
              activeTab === "logistics"
                ? "text-[var(--color-primary-light)] border-b-2 border-[var(--color-primary-light)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>{isAr ? "شركات الشحن والتوصيل" : "Logistics & Fleet"}</span>
          </button>
        </div>

        <div className="p-5 text-xs">
          {/* TAB 1: STOREFRONT & FASTCART */}
          {activeTab === "storefront" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Presentation Mode & Multi-Store Cart */}
              <div className="space-y-4 md:border-r rtl:md:border-r-0 rtl:md:border-l border-[var(--color-border-subtle)] md:pr-6 rtl:md:pr-0 rtl:md:pl-6">
                <div>
                  <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-subtitle mb-2">
                    {isAr ? "الوضع الافتراضي لواجهة المتجر" : "Default Storefront Presentation Mode"}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => setStoreMode("fastCart")}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        storeMode === "fastCart"
                          ? "bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/10 text-white"
                          : "bg-white/[0.02] border-white/10 text-[var(--color-text-secondary)] hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <ShoppingBag className="w-4 h-4 text-blue-400" />
                        {storeMode === "fastCart" && (
                          <span className="w-2 h-2 rounded-full bg-blue-400" />
                        )}
                      </div>
                      <p className="font-bold text-xs">FastCart Direct Mode</p>
                      <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                        Immediate catalog grid with high-speed add & 1-click checkout dock.
                      </p>
                    </div>

                    <div
                      onClick={() => setStoreMode("gallery")}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        storeMode === "gallery"
                          ? "bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/10 text-white"
                          : "bg-white/[0.02] border-white/10 text-[var(--color-text-secondary)] hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <Layers className="w-4 h-4 text-purple-400" />
                        {storeMode === "gallery" && (
                          <span className="w-2 h-2 rounded-full bg-purple-400" />
                        )}
                      </div>
                      <p className="font-bold text-xs">3D Bento Gallery Mode</p>
                      <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                        Immersive parallax magazine bento with zero-gravity depth-of-field.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Multi-Store Universal Cart Integration */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[var(--color-text-primary)]">
                        {isAr ? "شبكة السلة الموحدة لجميع المتاجر" : "Universal Multi-Store Cart Network"}
                      </p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">
                        Allows customers to add items from your store and check out alongside other stores in one zero-gravity floating dock.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={universalCartEnabled}
                        onChange={() => setUniversalCartEnabled(!universalCartEnabled)}
                      />
                      <div className="w-8 h-4 bg-white/10 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] rtl:after:left-auto rtl:after:right-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[var(--color-status-green)]" />
                    </label>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-white/50 pt-2 border-t border-white/5">
                    <span>SDK Script: <code>/matager-service.js</code></span>
                    <span className="text-emerald-400 font-bold">Injected & Active</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Custom Domain & Quick Links */}
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-subtitle mb-1.5">
                    {t.storefrontConfig.customDomainTitle}
                  </p>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-[var(--input-bg-gradient)] border border-[var(--input-border-color)] rounded-lg px-3 py-1.5 flex items-center gap-2">
                      <Globe className="text-[var(--color-primary-light)] w-3.5 h-3.5" />
                      <input
                        type="text"
                        value={domainInput}
                        onChange={(e) => setDomainInput(e.target.value)}
                        placeholder="yourstore.matager.com"
                        className="bg-transparent border-none text-xs outline-none w-full text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
                      />
                    </div>
                    <button
                      type="button"
                      className="px-3.5 py-1.5 bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] text-white rounded-lg text-[10px] font-bold transition-all shadow-sm"
                    >
                      {t.storefrontConfig.connectBtn}
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                  <p className="text-[10px] uppercase font-bold text-white/50 tracking-wider">
                    {isAr ? "روابط المتجر للمعاينة والنشر" : "Live Storefront Endpoints"}
                  </p>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-blue-400 font-bold">/storefront?storeId={domainInput.split('.')[0] || 'peacock_store'}</span>
                      <Link
                        href={`${APP_ROUTES.storefront}?storeId=${domainInput.split('.')[0] || 'peacock_store'}`}
                        target="_blank"
                        className="text-[10px] font-bold text-white/90 hover:text-white px-2 py-1 rounded bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 flex items-center gap-1 transition-all"
                      >
                        <span>Open Storefront</span>
                        <ExternalLink className="w-3 h-3 text-blue-400" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: POS CASHIER NODE SYNC */}
          {activeTab === "posSync" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                    <div>
                      <p className="font-bold text-white">
                        {isAr ? "مزامنة الطلبات والمخزون مع نقاط البيع" : "Real-Time POS Cashier Terminal Sync"}
                      </p>
                      <p className="text-[10px] text-white/50">
                        Orders placed via online FastCart automatically update inventory and alert in-store cashier registers.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={posSyncEnabled}
                        onChange={() => setPosSyncEnabled(!posSyncEnabled)}
                      />
                      <div className="w-8 h-4 bg-white/10 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] rtl:after:left-auto rtl:after:right-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[var(--color-status-green)]" />
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                    <div>
                      <p className="font-bold text-white">
                        {isAr ? "حجز المخزون الفوري عند الإضافة للسلة" : "Auto-Reserve Stock on FastCart Add"}
                      </p>
                      <p className="text-[10px] text-white/50">
                        Temporarily locks in-store quantity to prevent physical cashier overselling.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={autoReserveStock}
                        onChange={() => setAutoReserveStock(!autoReserveStock)}
                      />
                      <div className="w-8 h-4 bg-white/10 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] rtl:after:left-auto rtl:after:right-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[var(--color-status-green)]" />
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-white/50 uppercase tracking-wider block mb-1">
                      {isAr ? "نقطة البيع الرئيسية لتلقي الطلبات" : "Primary Fulfillment POS Terminal Node"}
                    </label>
                    <select
                      value={primaryPosNode}
                      onChange={(e) => setPrimaryPosNode(e.target.value)}
                      className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="TERM-01">TERM-01 · Cairo Heliopolis Flagship (Mohamed Ahmed)</option>
                      <option value="TERM-02">TERM-02 · New Cairo 5th Settlement (Sarah Youssef)</option>
                      <option value="TERM-03">TERM-03 · Alexandria Depot (Kareem Mansour)</option>
                    </select>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>POS Nodes Live Sync: Connected</span>
                      </span>
                      <span className="text-[10px]">14ms latency</span>
                    </div>
                    <p className="text-[10px] text-emerald-400/80">
                      Channel: <code>matager_pos_sync</code> · 3 active cashier nodes listening.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: THEMES & BRANDING */}
          {activeTab === "themes" && (
            <div className="space-y-4">
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-subtitle">
                {t.storefrontConfig.selectedLayout}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="aspect-video rounded-xl border-2 border-blue-500 bg-neutral-900 p-3 flex flex-col justify-end relative cursor-pointer shadow-lg shadow-blue-500/10">
                  <span className="text-xs font-bold text-white">Midnight Zero-Gravity</span>
                  <span className="text-[10px] text-white/50">Frosted obsidian glass with blue neon accents</span>
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-blue-600 text-white rounded text-[8px] font-black uppercase">
                    Active
                  </span>
                </div>

                <div className="aspect-video rounded-xl border border-white/10 bg-slate-900 p-3 flex flex-col justify-end relative cursor-pointer hover:border-white/30 transition-colors">
                  <span className="text-xs font-bold text-white">Crystal Light</span>
                  <span className="text-[10px] text-white/50">Clean frosted light glass with high contrast</span>
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-white/10 text-white rounded text-[8px] font-black uppercase">
                    Free
                  </span>
                </div>

                <div className="aspect-video rounded-xl border border-white/10 bg-neutral-900 p-3 flex flex-col justify-end relative cursor-pointer hover:border-purple-500/40 transition-colors">
                  <span className="text-xs font-bold text-white">Boutique Luxury</span>
                  <span className="text-[10px] text-white/50">Gold leaf serif typography with luxury velvet blur</span>
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded text-[8px] font-black uppercase">
                    Pro
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LOGISTICS & CARRIERS */}
          {activeTab === "logistics" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-subtitle">
                  {t.storefrontConfig.carrierTitle}
                </p>
                <div className="space-y-2">
                  {/* Bosta */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center text-[9px]">
                        BS
                      </div>
                      <div>
                        <p className="text-white font-bold">{t.storefrontConfig.bostaTitle}</p>
                        <p className="text-[10px] text-white/50">{t.storefrontConfig.bostaMeta}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={bostaConnected}
                        onChange={() => setBostaConnected(!bostaConnected)}
                      />
                      <div className="w-8 h-4 bg-white/10 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] rtl:after:left-auto rtl:after:right-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[var(--color-status-green)]" />
                    </label>
                  </div>

                  {/* Aramex */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 font-bold flex items-center justify-center text-[9px]">
                        AR
                      </div>
                      <div>
                        <p className="text-white font-bold">{t.storefrontConfig.aramexTitle}</p>
                        <p className="text-[10px] text-white/50">{t.storefrontConfig.aramexMeta}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={aramexConnected}
                        onChange={() => setAramexConnected(!aramexConnected)}
                      />
                      <div className="w-8 h-4 bg-white/10 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] rtl:after:left-auto rtl:after:right-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[var(--color-status-green)]" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Fleet Pricing */}
              <div className="space-y-3">
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-subtitle">
                  {t.storefrontConfig.fleetTitle}
                </p>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/70">{t.storefrontConfig.cairoGiza}</span>
                    <span className="font-bold text-blue-400">{t.storefrontConfig.cairoPrice}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-2 border-t border-white/5">
                    <span className="text-white/70">{t.storefrontConfig.matrouh}</span>
                    <span className="font-bold text-blue-400">{t.storefrontConfig.matrouhPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
