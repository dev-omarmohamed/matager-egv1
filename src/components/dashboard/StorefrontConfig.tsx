"use client";

import React, { useState } from "react";
import Link from "next/link";
import { APP_ROUTES } from "@/config/routes";
import { useDash } from "@/lib/useDash";
import { Panel, PanelTabs, TabPane } from "./ui/Panel";
import { SettingRow, Switch } from "./ui/Switch";
import { TONES } from "./ui/tones";
import { btnPrimary, btnGhost, divider, eyebrow, inputCls, focusRing } from "./ui/styles";

type Tab = "storefront" | "posSync" | "themes" | "logistics";
type Mode = "fastCart" | "gallery";

export const StorefrontConfig: React.FC = () => {
  const { t, tr } = useDash();

  const [tab, setTab] = useState<Tab>("storefront");
  const [mode, setMode] = useState<Mode>("fastCart");
  const [universalCart, setUniversalCart] = useState(true);
  const [posSync, setPosSync] = useState(true);
  const [autoReserve, setAutoReserve] = useState(true);
  const [primaryNode, setPrimaryNode] = useState("TERM-01");
  const [domain, setDomain] = useState("peacock.matager.com");
  const [theme, setTheme] = useState("midnight");
  const [carriers, setCarriers] = useState({ bosta: true, aramex: true });

  const slug = domain.split(".")[0] || "peacock_store";

  const modes: { id: Mode; icon: string; tone: "blue" | "purple"; title: string; desc: string }[] = [
    {
      id: "fastCart",
      icon: "bi-bag",
      tone: "blue",
      title: tr("FastCart Direct Mode", "وضع السلة السريعة"),
      desc: tr("Immediate catalog grid with high-speed add & 1-click checkout dock.", "شبكة منتجات فورية مع إضافة سريعة ودفع بنقرة واحدة."),
    },
    {
      id: "gallery",
      icon: "bi-layers",
      tone: "purple",
      title: tr("3D Bento Gallery Mode", "وضع المعرض ثلاثي الأبعاد"),
      desc: tr("Immersive parallax magazine bento with depth-of-field.", "معرض غامر بتأثير العمق والحركة."),
    },
  ];

  const themes = [
    { id: "midnight", name: "Midnight Zero-Gravity", desc: tr("Frosted obsidian glass with blue neon accents", "زجاج داكن مع لمسات نيون زرقاء"), badge: tr("Active", "مفعّل"), bg: "bg-neutral-900" },
    { id: "crystal", name: "Crystal Light", desc: tr("Clean frosted light glass with high contrast", "زجاج فاتح نظيف بتباين عالٍ"), badge: tr("Free", "مجاني"), bg: "bg-slate-800" },
    { id: "boutique", name: "Boutique Luxury", desc: tr("Gold leaf serif typography with velvet blur", "خطوط سيريف ذهبية مع تمويه مخملي"), badge: "Pro", bg: "bg-neutral-950" },
  ];

  const carrierRows = [
    { id: "bosta" as const, code: "BS", tone: "bg-orange-500/20 text-orange-500", title: t.storefrontConfig.bostaTitle, meta: t.storefrontConfig.bostaMeta },
    { id: "aramex" as const, code: "AR", tone: "bg-red-500/20 text-red-500", title: t.storefrontConfig.aramexTitle, meta: t.storefrontConfig.aramexMeta },
  ];

  return (
    <Panel
      title={tr("Storefront & Fulfilment", "المتجر والتوصيل")}
      subtitle={tr("Presentation mode, POS sync, themes and carriers", "طريقة العرض ومزامنة الكاشير والثيمات وشركات الشحن")}
      icon="bi-shop"
      toggleLabel={t.storefrontConfig.showDetails}
      meta={
        <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] font-bold text-[var(--color-status-green)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-status-green)] animate-pulse" />
          {tr("POS synced", "متزامن مع الكاشير")}
        </span>
      }
      actions={
        <Link href={APP_ROUTES.storefront} target="_blank" className={btnPrimary} aria-label={tr("Launch Storefront", "معاينة المتجر")}>
          <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
          <span className="hidden sm:inline">{tr("Launch Storefront", "معاينة المتجر")}</span>
        </Link>
      }
    >
      <PanelTabs<Tab>
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "storefront", label: tr("Cart & Gallery", "العرض والسلة"), icon: "bi-bag" },
          { id: "posSync", label: tr("POS Sync", "مزامنة POS"), icon: "bi-pc-display" },
          { id: "themes", label: tr("Themes", "الثيمات"), icon: "bi-palette" },
          { id: "logistics", label: tr("Logistics", "الشحن"), icon: "bi-truck" },
        ]}
      />

      <TabPane id={tab} className="p-3 sm:p-4">
        {/* ───── Cart & gallery ───── */}
        {tab === "storefront" && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <p className={eyebrow}>{tr("Default presentation mode", "الوضع الافتراضي لواجهة المتجر")}</p>
              <div role="radiogroup" className="grid grid-cols-2 gap-2">
                {modes.map((m) => {
                  const on = mode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setMode(m.id)}
                      className={`text-start p-3 rounded-xl border transition-colors duration-200 ${focusRing} ${
                        on ? `${TONES[m.tone].box} border-[var(--color-primary-light)]` : "bg-[var(--color-surface-elevated)] border-[var(--color-border-subtle)]"
                      }`}
                    >
                      <span className="flex items-center justify-between mb-1.5">
                        <i className={`bi ${m.icon} ${TONES[m.tone].text}`} aria-hidden="true" />
                        <span className={`w-2 h-2 rounded-full transition-opacity ${TONES[m.tone].bg} ${on ? "opacity-100" : "opacity-0"}`} />
                      </span>
                      <span className="block text-xs font-bold text-[var(--color-text-primary)]">{m.title}</span>
                      <span className="block text-[10px] text-[var(--color-text-muted)] mt-1 leading-snug">{m.desc}</span>
                    </button>
                  );
                })}
              </div>

              <SettingRow
                title={tr("Universal multi-store cart", "شبكة السلة الموحدة لجميع المتاجر")}
                desc={tr("Let customers check out items from your store alongside other stores in one floating dock.", "اسمح للعملاء بإتمام الشراء من متجرك مع متاجر أخرى في سلة واحدة.")}
                checked={universalCart}
                onChange={setUniversalCart}
              >
                <p className={`mt-2 pt-2 border-t ${divider} flex justify-between text-[10px] text-[var(--color-text-muted)]`}>
                  <span dir="ltr">SDK: <code>/matager-service.js</code></span>
                  <b className="text-[var(--color-status-green)]">{tr("Injected & Active", "مفعّل")}</b>
                </p>
              </SettingRow>
            </div>

            <div className="space-y-3">
              <div>
                <p className={`${eyebrow} mb-1.5`}>{t.storefrontConfig.customDomainTitle}</p>
                <div className="flex gap-2">
                  <label className={`flex-1 min-w-0 flex items-center gap-2 px-3 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] focus-within:border-[var(--color-primary-light)] transition-colors`}>
                    <i className="bi bi-globe2 text-xs text-[var(--color-primary-light)]" aria-hidden="true" />
                    <input
                      dir="ltr"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder="yourstore.matager.com"
                      className="w-full py-2 bg-transparent outline-none text-[16px] sm:text-xs text-start text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
                    />
                  </label>
                  <button type="button" className={btnPrimary}>{t.storefrontConfig.connectBtn}</button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] space-y-2">
                <p className={eyebrow}>{tr("Live storefront endpoint", "رابط المتجر المباشر")}</p>
                <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border-subtle)]">
                  <span dir="ltr" className="text-[11px] font-bold text-[var(--color-primary-light)] truncate">/storefront?storeId={slug}</span>
                  <Link href={`${APP_ROUTES.storefront}?storeId=${slug}`} target="_blank" className={`${btnGhost} shrink-0`}>
                    {tr("Open", "فتح")}
                    <i className="bi bi-box-arrow-up-right text-[10px]" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ───── POS sync ───── */}
        {tab === "posSync" && (
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2.5">
              <SettingRow
                title={tr("Real-time POS terminal sync", "مزامنة الطلبات والمخزون مع نقاط البيع")}
                desc={tr("Online orders update inventory and alert in-store registers automatically.", "الطلبات الإلكترونية تحدّث المخزون وتنبّه أجهزة الكاشير تلقائياً.")}
                checked={posSync}
                onChange={setPosSync}
              />
              <SettingRow
                title={tr("Auto-reserve stock on cart add", "حجز المخزون عند الإضافة للسلة")}
                desc={tr("Temporarily locks quantity to prevent overselling at the register.", "يحجز الكمية مؤقتاً لمنع البيع الزائد في الكاشير.")}
                checked={autoReserve}
                onChange={setAutoReserve}
              />
            </div>
            <div className="space-y-2.5">
              <label className="block">
                <span className={`${eyebrow} block mb-1`}>{tr("Primary fulfilment terminal", "نقطة البيع الرئيسية لتلقي الطلبات")}</span>
                <select value={primaryNode} onChange={(e) => setPrimaryNode(e.target.value)} className={inputCls}>
                  <option value="TERM-01">TERM-01 · Cairo Heliopolis Flagship</option>
                  <option value="TERM-02">TERM-02 · New Cairo 5th Settlement</option>
                  <option value="TERM-03">TERM-03 · Alexandria Depot</option>
                </select>
              </label>
              <div className={`p-3 rounded-xl border ${TONES.green.box}`}>
                <p className={`flex items-center justify-between text-xs font-bold ${TONES.green.text}`}>
                  <span><i className="bi bi-check-circle me-1.5" aria-hidden="true" />{tr("POS nodes live sync: connected", "المزامنة مع نقاط البيع: متصلة")}</span>
                  <span className="text-[10px]">14ms</span>
                </p>
                <p dir="ltr" className="mt-1 text-[10px] text-[var(--color-text-secondary)] text-start">
                  Channel: <code>matager_pos_sync</code> · 3 nodes listening
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ───── Themes ───── */}
        {tab === "themes" && (
          <div className="space-y-2.5">
            <p className={eyebrow}>{t.storefrontConfig.selectedLayout}</p>
            <div role="radiogroup" className="grid gap-2.5 sm:grid-cols-3">
              {themes.map((th) => {
                const on = theme === th.id;
                return (
                  <button
                    key={th.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setTheme(th.id)}
                    className={`relative text-start aspect-[16/7] sm:aspect-video p-3 rounded-xl border-2 flex flex-col justify-end transition-colors duration-200 ${th.bg} ${focusRing} ${
                      on ? "border-[var(--color-primary-light)]" : "border-transparent"
                    }`}
                  >
                    <span className="text-xs font-bold text-white">{th.name}</span>
                    <span className="text-[10px] text-white/60">{th.desc}</span>
                    <span className="absolute top-2 end-2 px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-white/15 text-white">
                      {on ? tr("Active", "مفعّل") : th.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ───── Logistics ───── */}
        {tab === "logistics" && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className={eyebrow}>{t.storefrontConfig.carrierTitle}</p>
              {carrierRows.map((c) => (
                <div key={c.id} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)]">
                  <span className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-bold ${c.tone}`}>{c.code}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[var(--color-text-primary)] truncate">{c.title}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)] truncate">{c.meta}</p>
                  </div>
                  <Switch checked={carriers[c.id]} onChange={(v) => setCarriers((s) => ({ ...s, [c.id]: v }))} label={c.title} />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <p className={eyebrow}>{t.storefrontConfig.fleetTitle}</p>
              <div className="p-3 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] text-xs">
                <p className="flex justify-between"><span className="text-[var(--color-text-secondary)]">{t.storefrontConfig.cairoGiza}</span><b className="text-[var(--color-status-blue)]">{t.storefrontConfig.cairoPrice}</b></p>
                <p className={`mt-2 pt-2 border-t ${divider} flex justify-between`}><span className="text-[var(--color-text-secondary)]">{t.storefrontConfig.matrouh}</span><b className="text-[var(--color-status-blue)]">{t.storefrontConfig.matrouhPrice}</b></p>
              </div>
            </div>
          </div>
        )}
      </TabPane>
    </Panel>
  );
};
