"use client";

import React from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  Package,
  Layers,
  Zap,
  TrendingUp,
  Shield,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Clock,
  CreditCard,
  Sliders,
  DollarSign,
  Activity,
  Boxes,
  Lock,
} from "lucide-react";

interface ProductTourProps {
  onOpenAuth: (mode?: "signin" | "signup", role?: "owner" | "employee") => void;
}

export const ProductTour: React.FC<ProductTourProps> = ({ onOpenAuth }) => {
  const prefersReducedMotion = useReducedMotion();

  // Animation variants triggered once via viewport
  const fadeInUp = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <div className="w-full text-white relative z-20">
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: WHAT MATAGER IS (LIVE PRODUCT UI ASSEMBLY)
          ───────────────────────────────────────────────────────────── */}
      <section
        id="product-overview"
        aria-labelledby="overview-title"
        className="py-24 sm:py-32 px-4 sm:px-6 max-w-6xl mx-auto border-t border-white/[0.06]"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-white/[0.03] border border-white/10 text-xs text-slate-400 mb-4">
            <Layers className="w-3.5 h-3.5 text-brand-blue" />
            <span>Unified Architecture</span>
          </div>
          <h2
            id="overview-title"
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight"
          >
            One connected engine for physical and online retail.
          </h2>
          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            Ditch the fragmented toolchain. Matager synchronizes your live storefront, in-store POS hardware, stock levels, and staff permissions through one seamless interface.
          </p>
        </motion.div>

        {/* Live-Looking Interactive Mockup UI */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
          className="relative rounded-2xl bg-[var(--color-surface)]/90 border border-white/10 shadow-2xl p-4 sm:p-8 backdrop-blur-xl overflow-hidden"
        >
          {/* Top simulated window bar */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/[0.07] text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              <span className="ml-2 text-slate-400 hidden sm:inline">matager.workspace/core-engine</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Cluster Healthy · 18ms latency
              </span>
            </div>
          </div>

          {/* Interactive 3-Column Hub Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Node 1: Online Storefront */}
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-brand-blue/40 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400">SURFACE 01</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-brand-sky border border-blue-500/20">
                  Storefront
                </span>
              </div>
              <h3 className="text-base font-semibold text-white mb-1">Instant Fast Cart</h3>
              <p className="text-xs text-slate-300 mb-4">
                0.2s product switch, frictionless bento collections, zero cart abandonment friction.
              </p>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/5">
                <span>Active Shoppers</span>
                <span className="text-white font-semibold">1,482 live</span>
              </div>
            </div>

            {/* Node 2: In-Store Registers */}
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-brand-sky/40 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400">SURFACE 02</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  POS Workstation
                </span>
              </div>
              <h3 className="text-base font-semibold text-white mb-1">Cashier Fast Lane</h3>
              <p className="text-xs text-slate-300 mb-4">
                Sub-second barcode scan, split payment tenders, automated receipt and drawer sync.
              </p>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/5">
                <span>Transactions Today</span>
                <span className="text-white font-semibold">648 processed</span>
              </div>
            </div>

            {/* Node 3: Core Operations */}
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-purple-500/40 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400">SURFACE 03</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Platform HQ
                </span>
              </div>
              <h3 className="text-base font-semibold text-white mb-1">Central Warehouse</h3>
              <p className="text-xs text-slate-300 mb-4">
                Real-time ledger, supplier re-orders, role permission boundaries, and audit logs.
              </p>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/5">
                <span>Sync Status</span>
                <span className="text-emerald-400 font-semibold">100% In-Sync</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: INVENTORY INTELLIGENCE (AUTONOMOUS STOCK)
          ───────────────────────────────────────────────────────────── */}
      <section
        id="inventory-intelligence"
        aria-labelledby="inventory-title"
        className="py-24 sm:py-32 px-4 sm:px-6 max-w-6xl mx-auto border-t border-white/[0.06]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-white/[0.03] border border-white/10 text-xs text-slate-400 mb-4">
              <Boxes className="w-3.5 h-3.5 text-brand-sky" />
              <span>Real-Time SKU Allocation</span>
            </div>
            <h2
              id="inventory-title"
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight"
            >
              Inventory intelligence that prevents lost sales.
            </h2>
            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed mb-6">
              Never oversell again. Matager allocates stock concurrently across physical checkout counters and digital baskets, predicting depletion rates and dispatching automated supplier purchase orders.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-brand-sky mt-0.5 shrink-0" />
                <span className="text-sm text-slate-300">
                  <strong className="text-white">Batch & Serial Number Tracking:</strong> Granular traceability for electronics, apparel sizes, and expiry-dated goods.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-brand-sky mt-0.5 shrink-0" />
                <span className="text-sm text-slate-300">
                  <strong className="text-white">Autonomous Re-Order Triggers:</strong> Generate POs before stock hits critical safety buffer.
                </span>
              </div>
            </div>
          </motion.div>

          {/* Interactive Stock Level Card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            className="rounded-2xl bg-[var(--color-surface)]/90 border border-white/10 p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-4"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <span className="text-sm font-semibold text-white">Live Stock Levels</span>
              <span className="text-xs text-slate-400">4,280 Total SKUs</span>
            </div>

            {/* Item 1: High stock */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-white">Nordic Minimalist Chrono</span>
                <span className="text-xs text-emerald-400 font-semibold">182 in stock</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full w-[85%]" />
              </div>
            </div>

            {/* Item 2: Low stock alert */}
            <div className="p-3.5 rounded-xl bg-amber-500/[0.04] border border-amber-500/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-medium text-white">Merino Wool Overshirt (M)</span>
                </div>
                <span className="text-xs text-amber-400 font-semibold">6 left (Low Stock)</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full w-[15%]" />
              </div>
            </div>

            {/* Item 3: Auto reorder placed */}
            <div className="p-3.5 rounded-xl bg-blue-500/[0.04] border border-blue-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-white">Ceramic Pour-Over Dripper</span>
                <span className="text-xs text-brand-sky font-semibold">PO #810 Dispatched</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-brand-sky rounded-full w-[45%]" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: SALES & REAL-TIME ORDERS (SPARKLINE DRAW-IN)
          ───────────────────────────────────────────────────────────── */}
      <section
        id="sales-orders"
        aria-labelledby="sales-title"
        className="py-24 sm:py-32 px-4 sm:px-6 max-w-6xl mx-auto border-t border-white/[0.06]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Order Stream Visual */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            className="rounded-2xl bg-[var(--color-surface)]/90 border border-white/10 p-6 sm:p-7 shadow-2xl backdrop-blur-xl order-2 lg:order-1"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
              <div>
                <span className="text-xs text-slate-400 block">TODAY’S VOLUME</span>
                <span className="text-2xl font-bold text-white">$24,910.40</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-emerald-400 font-medium">+18.4% vs yesterday</span>
                <span className="text-[11px] text-slate-400 block">348 orders</span>
              </div>
            </div>

            {/* Revenue Sparkline Drawing In */}
            <div className="w-full h-24 mb-6 relative">
              <svg
                viewBox="0 0 300 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full overflow-visible"
              >
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary-light)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--color-primary-light)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 65 Q 40 55 80 40 T 160 30 T 240 15 T 300 8 L 300 80 L 0 80 Z"
                  fill="url(#revenueGrad)"
                />
                {!prefersReducedMotion ? (
                  <motion.path
                    d="M 0 65 Q 40 55 80 40 T 160 30 T 240 15 T 300 8"
                    stroke="var(--color-primary-light)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  />
                ) : (
                  <path
                    d="M 0 65 Q 40 55 80 40 T 160 30 T 240 15 T 300 8"
                    stroke="var(--color-primary-light)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </div>

            {/* Live Order Ticker */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-xs">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-brand-sky" />
                  <span className="text-slate-300">#4912 · Web Fast Cart</span>
                </div>
                <span className="text-white font-semibold">$184.00</span>
                <span className="text-emerald-400">Paid</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-xs">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-300">#4911 · Store POS 02</span>
                </div>
                <span className="text-white font-semibold">$45.50</span>
                <span className="text-emerald-400">Settled</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            className="order-1 lg:order-2"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-white/[0.03] border border-white/10 text-xs text-slate-400 mb-4">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Real-Time Transaction Stream</span>
            </div>
            <h2
              id="sales-title"
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight"
            >
              Unified checkout across every sales channel.
            </h2>
            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed mb-6">
              Whether a customer taps Apple Pay at your physical register, orders for scheduled pickup, or checks out in under three clicks online, every order converges into one centralized ledger.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-2xl font-bold text-white block">0.3s</span>
                <span className="text-xs text-slate-400">Average POS Scan Velocity</span>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-2xl font-bold text-white block">0%</span>
                <span className="text-xs text-slate-400">Inventory Sync Discrepancy</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: TEAM & ROLE-BASED ACCESS CONTROL
          ───────────────────────────────────────────────────────────── */}
      <section
        id="team-roles"
        aria-labelledby="team-title"
        className="py-24 sm:py-32 px-4 sm:px-6 max-w-6xl mx-auto border-t border-white/[0.06]"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-white/[0.03] border border-white/10 text-xs text-slate-400 mb-4">
            <Users className="w-3.5 h-3.5 text-brand-blue" />
            <span>Role Boundaries & Security</span>
          </div>
          <h2
            id="team-title"
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight"
          >
            Granular permissions. Frictionless staff onboarding.
          </h2>
          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            Give cashiers rapid checkout terminals without risking financial access. Empower managers while locking bank details to verified store owners.
          </p>
        </motion.div>

        {/* Roles 3-Tier Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Owner Tier */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
            className="p-6 rounded-2xl bg-white/[0.02] border border-brand-blue/30 relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-brand-sky">LEVEL 01</span>
              <Lock className="w-4 h-4 text-brand-sky" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Store Owner</h3>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Full control over bank payouts, store creation, subscription plans, platform settings, and tax configurations.
            </p>
            <ul className="space-y-2 text-xs text-slate-300 border-t border-white/5 pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-sky" /> Payout & Banking Access
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-sky" /> Staff Invite Code Generation
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-sky" /> Global Audit Logs
              </li>
            </ul>
          </motion.div>

          {/* Store Manager Tier */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-slate-400">LEVEL 02</span>
              <Sliders className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Store Manager</h3>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Oversees shifts, supplier inventory restocks, cash drawer close-out totals, and product catalog updates.
            </p>
            <ul className="space-y-2 text-xs text-slate-300 border-t border-white/5 pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" /> Product & Pricing Edits
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" /> Stock Intake & Purchase Orders
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" /> Shift Drawer Auditing
              </li>
            </ul>
          </motion.div>

          {/* POS Cashier Tier */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-slate-400">LEVEL 03</span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">POS Cashier</h3>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Distraction-free high-speed barcode scanning, split payments, return verification, and digital receipts.
            </p>
            <ul className="space-y-2 text-xs text-slate-300 border-t border-white/5 pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" /> Fast Line-Item Scanning
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" /> Split Tender Checkout
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" /> No Access to Sensitive Metrics
              </li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5: ACTIONABLE ANALYTICS (NON-LOOPING CHARTS)
          ───────────────────────────────────────────────────────────── */}
      <section
        id="analytics-engine"
        aria-labelledby="analytics-title"
        className="py-24 sm:py-32 px-4 sm:px-6 max-w-6xl mx-auto border-t border-white/[0.06]"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-white/[0.03] border border-white/10 text-xs text-slate-400 mb-4">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Velocity & Margins</span>
          </div>
          <h2
            id="analytics-title"
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight"
          >
            Insights that drive margin, not vanity charts.
          </h2>
          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            Understand your top-performing products, peak hour customer traffic, and repeat retention velocity in clean, digestible visual summaries.
          </p>
        </motion.div>

        {/* 3 Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/10"
          >
            <span className="text-xs text-slate-400">NET PROFIT MARGIN</span>
            <div className="text-3xl font-extrabold text-white mt-2 mb-1">38.4%</div>
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +4.2% after supplier auto-reorder
            </span>
            <div className="mt-6 flex items-end gap-2 h-16">
              {[40, 55, 45, 68, 72, 85, 92].map((height, i) => (
                <div key={i} className="flex-1 bg-white/5 rounded-t overflow-hidden h-full flex items-end">
                  {!prefersReducedMotion ? (
                    <motion.div
                      initial={{ height: 0 }}
                      whileInView={{ height: `${height}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: i * 0.05 }}
                      className="w-full bg-brand-blue rounded-t"
                    />
                  ) : (
                    <div style={{ height: `${height}%` }} className="w-full bg-brand-blue rounded-t" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/10"
          >
            <span className="text-xs text-slate-400">AVERAGE BASKET SIZE</span>
            <div className="text-3xl font-extrabold text-white mt-2 mb-1">$72.60</div>
            <span className="text-xs text-brand-sky flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> +14% uplift from Fast Cart bundles
            </span>
            <div className="mt-6 flex items-end gap-2 h-16">
              {[30, 48, 62, 54, 76, 80, 88].map((height, i) => (
                <div key={i} className="flex-1 bg-white/5 rounded-t overflow-hidden h-full flex items-end">
                  {!prefersReducedMotion ? (
                    <motion.div
                      initial={{ height: 0 }}
                      whileInView={{ height: `${height}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: i * 0.05 }}
                      className="w-full bg-brand-sky rounded-t"
                    />
                  ) : (
                    <div style={{ height: `${height}%` }} className="w-full bg-brand-sky rounded-t" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/10"
          >
            <span className="text-xs text-slate-400">REPEAT CUSTOMER RATE</span>
            <div className="text-3xl font-extrabold text-white mt-2 mb-1">68.2%</div>
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 2.8x higher than industry average
            </span>
            <div className="mt-6 flex items-end gap-2 h-16">
              {[50, 52, 60, 64, 70, 75, 84].map((height, i) => (
                <div key={i} className="flex-1 bg-white/5 rounded-t overflow-hidden h-full flex items-end">
                  {!prefersReducedMotion ? (
                    <motion.div
                      initial={{ height: 0 }}
                      whileInView={{ height: `${height}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: i * 0.05 }}
                      className="w-full bg-emerald-400 rounded-t"
                    />
                  ) : (
                    <div style={{ height: `${height}%` }} className="w-full bg-emerald-400 rounded-t" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 6: INTEGRATIONS MARQUEE (HOVER PAUSE)
          ───────────────────────────────────────────────────────────── */}
      <section
        id="integrations"
        aria-label="Ecosystem Integrations"
        className="py-20 px-4 sm:px-6 max-w-6xl mx-auto border-t border-white/[0.06] overflow-hidden"
      >
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-widest text-slate-400">
            Hardware & Cloud Ecosystem
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-white mt-2">
            Seamlessly connects with your existing stack.
          </h3>
        </div>

        {/* Marquee Strip with hover pause */}
        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]">
          <div className="flex w-max gap-8 animate-marquee hover:[animation-play-state:paused] py-4 select-none">
            {[
              "Stripe Terminal",
              "Square Payments",
              "Apple Pay",
              "Shopify Sync",
              "Star Micronics POS",
              "Epson Receipt Printers",
              "QuickBooks Online",
              "WhatsApp Commerce",
              "DHL Express",
              "ShipStation",
              "Google Shopping",
              "Zebra Barcode Scanners",
            ].map((item, idx) => (
              <div
                key={idx}
                className="px-5 py-2.5 rounded-full bg-white/[0.03] border border-white/10 text-xs font-medium text-slate-300 hover:text-white hover:border-brand-sky/40 transition-colors whitespace-nowrap"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 7: TRUST / TESTIMONIAL
          ───────────────────────────────────────────────────────────── */}
      <section
        aria-label="Merchant Proof"
        className="py-20 px-4 sm:px-6 max-w-4xl mx-auto border-t border-white/[0.06] text-center"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="space-y-6"
        >
          <div className="flex justify-center gap-1 text-brand-sky">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="text-lg">★</span>
            ))}
          </div>
          <blockquote className="text-xl sm:text-2xl md:text-3xl font-medium text-slate-200 leading-snug tracking-tight">
            “Matager gave us real-time inventory integrity across our 4 flagship stores and online shop. We eliminated stockouts in week one and our cashiers learned the interface in ten minutes.”
          </blockquote>
          <div>
            <div className="text-sm font-semibold text-white">Alexander Vance</div>
            <div className="text-xs text-slate-400">Founder & CEO · Vesper Lifestyle Retail Group</div>
          </div>
        </motion.div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 8: FINAL CALL TO ACTION
          ───────────────────────────────────────────────────────────── */}
      <section
        id="final-cta"
        aria-labelledby="cta-title"
        className="py-24 sm:py-32 px-4 sm:px-6 max-w-4xl mx-auto border-t border-white/[0.06] text-center"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="p-10 sm:p-14 rounded-3xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 relative overflow-hidden shadow-2xl backdrop-blur-xl"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-brand-blue/15 blur-3xl pointer-events-none" />

          <h2
            id="cta-title"
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight"
          >
            Start your store on Matager today.
          </h2>
          <p className="max-w-xl mx-auto text-sm sm:text-base text-slate-300 font-normal leading-relaxed mb-8">
            Create your account in under two minutes. Import your existing catalog via CSV or build your inventory from scratch with full multi-channel sync.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => onOpenAuth("signup", "owner")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-sm text-black bg-white hover:bg-slate-200 transition-all duration-200 shadow-lg shadow-white/10 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
            >
              <span>Launch Store Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onOpenAuth("signin", "owner")}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full font-medium text-sm text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
            >
              Existing Member Sign In
            </button>
          </div>

          <p className="mt-6 text-xs text-slate-400">
            No credit card required · 14-day full enterprise trial · Instant activation
          </p>
        </motion.div>
      </section>
    </div>
  );
};
