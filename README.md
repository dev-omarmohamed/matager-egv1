# Matager Merchant Admin Dashboard — Architecture & Design System

A production-grade, bilingual merchant admin dashboard for **Matager — Unified Commerce Operating System**, rebuilt from the ground up using the Matager Canonical Design System.

---

## 1. File Structure

```text
src/
├── app/
│   ├── layout.tsx            # <html lang dir> + theme & font providers + Bootstrap Icons
│   ├── page.tsx              # Merchant Admin Dashboard root (http://localhost:3000/)
│   ├── dashboard/page.tsx    # Direct route alias (/dashboard)
│   └── landing/page.tsx      # Marketing landing page (/landing)
├── components/
│   ├── dashboard/
│   │   ├── TopNav.tsx             # Sticky navbar (Logo, breadcrumb, search, EN/AR, theme, avatar)
│   │   ├── KpiStrip.tsx           # Welcome greeting + 4 KPI cards (with sparklines & shimmer skeletons)
│   │   ├── ActionHub.tsx          # Snap-scroll action cards + Default Domain row
│   │   ├── PlanCard.tsx           # Matager-100 usage bar + Upgrade button
│   │   ├── LiveVisitors.tsx       # Real-time counter + 4 mini-metrics + sources & devices
│   │   ├── TeamRoster.tsx         # 4-member roster with role pills + Add Member button
│   │   ├── RecentOrders.tsx       # 3-drawer stacked collapsibles + sendCartReminder() + orders table
│   │   ├── RevenueLedger.tsx      # Year switcher (2025/2026), monthly breakdown, finalized pills
│   │   ├── PaymentAnalytics.tsx   # 3 stat tiles, transaction history, captured/refunded, pagination
│   │   ├── InventoryPanel.tsx     # 3 sub-tabs: Capacity & Health, Live Products, Stock Settings
│   │   ├── CustomerBase.tsx       # 1,284 total, +12% growth, 142 new joins, 71% goal bar
│   │   ├── Discounts.tsx          # Promo codes, site-wide sales, gift cards, SUMMER25 rows
│   │   ├── FinancialLedger.tsx    # 3-column financial grid: Funds, Pending, Expenses
│   │   ├── AdTracking.tsx         # Pixel health live, Meta, TikTok, GA4 status
│   │   ├── ProductReviews.tsx     # Searchable feedback list, Air Max 270 by Michael R.
│   │   └── StorefrontConfig.tsx   # Custom domain, themes, carrier integration, internal fleet
│   ├── ui/
│   │   ├── Collapsible.tsx        # Pure-CSS peer-checkbox pattern (Zero JS required)
│   │   ├── StatusPill.tsx         # 8px font-black uppercase status indicators
│   │   ├── KpiCard.tsx            # Shimmer loading skeleton + sparkline SVG + delta badge
│   │   └── SectionHeader.tsx      # Reusable section header with badges and action buttons
│   └── brand/
│       └── MatagerLogo.tsx        # Isometric cube logo (/app-icon.png) + bilingual wordmark
├── lib/
│   ├── i18n.ts                    # Complete EN & AR dictionaries, provider, hook
│   └── theme.ts                   # Dark / light theme token switcher & localStorage persistence
└── styles/
    └── tokens.css                 # All CSS variables (colors, fonts, radii, shadows, inputs)
```

---

## 2. Design Tokens & CSS Variable Map

All styles strictly consume design system tokens. **Zero inline hex colors exist outside `tokens.css`.**

| Token Name | Dark Value | Light Value | Purpose |
| :--- | :--- | :--- | :--- |
| `--color-canvas` | `#000000` | `#fcfcfd` | Main page canvas background |
| `--color-surface` | `#050607` | `#ffffff` | Primary card containers |
| `--color-surface-elevated` | `#090a0d` | `#f4f5f7` | Elevated dropdowns & inputs |
| `--color-surface-hover` | `#0f1115` | `#ebedf0` | Row & card hover highlight |
| `--color-text-primary` | `#ffffff` | `#0a0b0d` | High-contrast display & headings |
| `--color-text-secondary` | `#b3b3b3` | `#4b5260` | Secondary copy and subtitles |
| `--color-text-muted` | `#808080` | `#6b7280` | Metadata, timestamps, captions |
| `--color-border-subtle` | `rgba(255,255,255,0.07)` | `rgba(0,0,0,0.08)` | Translucent structural dividers |
| `--color-primary-dark` | `#0479E8` | `#0479E8` | Gradient start stop (Dark Blue) |
| `--color-primary-light` | `#0083FE` | `#0083FE` | Gradient end stop (Lighter Blue) |
| `--gradient-primary` | `linear-gradient(135deg, #0479E8, #0083FE)` | Same | Buttons, active chips, badges |
| `--input-bg-gradient` | `linear-gradient(135deg, #1a1a24, #2a3a50)` | `linear-gradient(135deg, #f0f6ff, #e2eeff)` | Two-color form input gradient |
| `--input-border-color` | `rgba(4, 121, 232, 0.35)` | `rgba(4, 121, 232, 0.25)` | Form input border |
| `--color-status-green` | `#3fcb7f` | `#159c53` | Mint signal / Delivered / Captured |
| `--color-status-amber` | `#f59e0b` | `#d97706` | Pending / Alerts |
| `--color-status-red` | `#ef4444` | `#dc2626` | Depleted / Refunds / Expired |
| `--color-status-blue` | `#0083fe` | `#0479e8` | Shipped / Active / Info |
| `--color-status-purple` | `#a855f7` | `#9333ea` | Manager / Social / Boutique |
| `--color-status-orange` | `#f97316` | `#ea580c` | Stuck Carts / Bosta |
| `--shadow-glass-card` | `0 32px 70px -20px rgba(0,0,0,0.75)` | `0 20px 40px -15px rgba(0,0,0,0.08)` | Glass card elevation |

---

## 3. Strict Typography Rules

* **English Mode (`en`):**
  * Display, Headings & UI: `Josefin Sans` (`--font-josefin`)
  * Subtitles & Badges: `Poiret One` (`--font-poiret`)
* **Arabic Mode (`ar`):**
  * Display & Headings: `El Messiri` (`--font-el-messiri`)
  * Subtitles & Body: `Cairo` (`--font-cairo`)
  * **Zero Letter Spacing Rule:** `letter-spacing: 0 !important` is enforced globally on all Arabic glyphs.

---

## 4. Pure-CSS Collapsible Pattern (No JS Required)

All dashboard panels can expand and collapse without requiring JavaScript using Tailwind's `peer` checkbox selector:

```html
<div class="glass-panel rounded-[20px] bg-[var(--color-glass-card-bg)] border border-[var(--color-glass-card-border)] overflow-hidden">
  <!-- 1. Hidden checkbox input acting as state anchor -->
  <input type="checkbox" id="toggle-my-panel" class="peer/my-panel hidden" />

  <!-- 2. Header with label pointing to the input ID -->
  <div class="p-4 flex justify-between items-center">
    <h3>Panel Title</h3>
    <label for="toggle-my-panel" class="cursor-pointer select-none peer-checked/my-panel:[&_.chevron]:rotate-180">
      <span>Show Details</span>
      <i class="bi bi-chevron-down transition-transform duration-300 chevron"></i>
    </label>
  </div>

  <!-- 3. Drawer container driven purely by CSS max-height transition -->
  <div class="max-h-0 overflow-hidden transition-all duration-500 ease-in-out peer-checked/my-panel:max-h-[600px]">
    <!-- Panel Content -->
  </div>
</div>
```

---

## 5. Micro-Interactions & Actions

* **`sendCartReminder(name, phone, total)`:**
  WhatsApp deep-link generator ported verbatim from the legacy dashboard. Opens a targeted recovery conversation with the customer's cart total and deep link.
* **Global Search on Keyup:**
  Typing in the top search bar (or pressing `/`) filters table rows in real time across order IDs, customer names, SKUs, and statuses.
* **Shimmer Skeletons:**
  KPI cards display an animated 300ms loading skeleton on mount before fading in real telemetry numbers and SVG sparklines.
* **Smooth Bilingual Flip:**
  Clicking the language button flips the `dir` attribute on `<html>` between `ltr` and `rtl`, synchronizes the dictionary, and persists selection to `localStorage`.

---

## 6. How to Extend with New Panels

To add a new collapsible module to the dashboard:

1. **Add strings to `src/lib/i18n.ts`:**
   ```typescript
   // In dashboardTranslations.en and dashboardTranslations.ar:
   myModule: {
     title: "My Module",
     subtitle: "Module description here",
     showDetails: "Show Details",
     // ... custom fields
   }
   ```

2. **Create the component `src/components/dashboard/MyModule.tsx`:**
   ```tsx
   "use client";
   import React from "react";
   import { useDashboardLanguage } from "@/lib/i18n";
   import { Collapsible } from "@/components/ui/Collapsible";

   export const MyModule: React.FC = () => {
     const { t } = useDashboardLanguage();
     return (
       <Collapsible
         id="toggle-my-module"
         peerName="mymodule"
         title={t.myModule.title}
         subtitle={t.myModule.subtitle}
         toggleText={t.myModule.showDetails}
       >
         <div className="p-5">
           {/* Your content styled with var(--color-*) tokens */}
         </div>
       </Collapsible>
     );
   };
   ```

3. **Mount in `src/app/page.tsx`:**
   ```tsx
   import { MyModule } from "@/components/dashboard/MyModule";
   // Insert in <main className="space-y-6"> in your preferred order
   ```

---

## 7. Firebase Cloud Infrastructure & Database Nodes

The platform is configured with Firebase project **`matager-egv01`**:
* **Realtime Database (RTDB):** Live telemetric orders, POS cashier terminals, and real-time ledger sync.
* **Authentication:** Email/Password & Anonymous auth for merchants and guests.
* **Cloud Storage:** Multi-tenant media, store logos, and receipts (`matager-egv01.firebasestorage.app`).
* **Google Analytics:** E-commerce telemetry and visitor funnel metrics (`G-77YTXR85KB`).

> 📖 **Full Database Nodes Guide:** See [`FIREBASE_NODES_SETUP.md`](./FIREBASE_NODES_SETUP.md) for detailed node schemas, security rules, and console instructions.
>
> ⚡ **1-Click Database Import:** Import [`firebase-rtdb-seed.json`](./firebase-rtdb-seed.json) into Firebase Console &rarr; Realtime Database to instantly seed all required nodes.

---

## 8. How to Run

```bash
# Install dependencies
npm install

# Start Next.js development server
npm run dev

# Run TypeScript compilation check
npx tsc --noEmit
```

* **Marketing Landing:** `http://localhost:3000/`
* **Online Storefront:** `http://localhost:3000/storefront?storeId=peacock_store`
* **Merchant Dashboard:** `http://localhost:3000/dashboard?storeId=peacock_store`
* **Cashier POS Terminal:** `http://localhost:3000/cashier?storeId=peacock_store`
* **Platform Super Admin:** `http://localhost:3000/admin`
