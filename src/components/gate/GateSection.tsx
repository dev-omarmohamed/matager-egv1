"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MatagerLogo } from "@/components/brand/MatagerLogo";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ArrowRight, ShoppingBag, Store, ShieldCheck } from "lucide-react";

interface GateSectionProps {
  onCustomerSelect: () => void;
  onInsiderSelect: () => void;
  isUnlocked: boolean;
}

export const GateSection: React.FC<GateSectionProps> = ({
  onCustomerSelect,
  onInsiderSelect,
  isUnlocked,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [stage, setStage] = useState<"overture" | "gate">("overture");
  const [hoveredChoice, setHoveredChoice] = useState<"customer" | "insider" | null>(
    null
  );

  // Mouse coordinate tracker for cursor-aware magnetic highlight
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleOvertureComplete = () => {
    // Transition smoothly from overture to gate
    setTimeout(() => {
      setStage("gate");
    }, prefersReducedMotion ? 0 : 400);
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      aria-labelledby="gate-headline"
      className={`relative w-full overflow-hidden flex flex-col justify-between items-center transition-all duration-700 ${
        isUnlocked ? "min-h-[85vh] py-16" : "h-[100vh] min-h-[100svh] max-h-[100svh]"
      }`}
      style={{
        minHeight: "100svh",
        paddingTop: "max(1.5rem, env(safe-area-inset-top))",
        paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
        paddingLeft: "max(1.25rem, env(safe-area-inset-left))",
        paddingRight: "max(1.25rem, env(safe-area-inset-right))",
      }}
    >
      {/* Background Ambience: Subtle Noise & Soft Mesh Gradient */}
      <div className="absolute inset-0 pointer-events-none -z-10 bg-[var(--color-surface)]">
        {/* Animated ambient glow */}
        <div
          className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-b from-blue-600/10 via-sky-500/5 to-transparent blur-[140px] pointer-events-none"
          aria-hidden="true"
        />

        {/* Dynamic cursor aura for desktop */}
        <div
          className="absolute w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none transition-transform duration-300 ease-out hidden md:block"
          style={{
            transform: `translate(${mousePos.x - 200}px, ${mousePos.y - 200}px)`,
          }}
          aria-hidden="true"
        />

        {/* Micro hairline grid for depth */}
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* Top Header Row / Brand Identity */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between z-10">
        <MatagerLogo size="sm" showWordmark={true} />
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-xs font-medium text-slate-300 bg-white/[0.03] border border-white/[0.08]">
            <span className="w-1.5 h-1.5 rounded-full bg-status-live animate-pulse" />
            v1.0 Live Platform
          </span>
        </div>
      </header>

      {/* Main Center Stage */}
      <div className="relative z-10 w-full max-w-4xl mx-auto my-auto flex flex-col items-center justify-center text-center px-4">
        <AnimatePresence mode="wait">
          {stage === "overture" && !prefersReducedMotion ? (
            /* STAGE 1: BRAND OVERTURE */
            <motion.div
              key="overture"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98, filter: "blur(8px)" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center justify-center py-10"
            >
              <MatagerLogo
                size="xl"
                animated={true}
                showWordmark={true}
                onAnimationComplete={handleOvertureComplete}
              />
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="mt-4 text-sm tracking-widest text-slate-400 uppercase"
              >
                Commerce, without the noise.
              </motion.p>
            </motion.div>
          ) : (
            /* STAGE 2: THE GATE ("Are you a customer?") */
            <motion.div
              key="gate"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="w-full flex flex-col items-center"
            >
              {/* Question Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-blue-500/10 border border-blue-500/20 text-brand-sky text-xs font-medium mb-6">
                <Store className="w-3.5 h-3.5" />
                <span>Identity verification & routing</span>
              </div>

              {/* Main Headline */}
              <h1
                id="gate-headline"
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-4 leading-[1.08]"
              >
                Are you a <span className="bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">customer?</span>
              </h1>

              <p className="max-w-xl text-base sm:text-lg text-slate-300 font-normal mb-10 leading-relaxed">
                Select your path to enter the live storefront or access the unified store operations platform.
              </p>

              {/* TWO LARGE TACTILE CHOICES */}
              <div
                className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto"
                role="group"
                aria-label="Role entry choices"
              >
                {/* CHOICE A: CUSTOMER */}
                <motion.button
                  type="button"
                  onClick={onCustomerSelect}
                  onMouseEnter={() => setHoveredChoice("customer")}
                  onMouseLeave={() => setHoveredChoice(null)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  aria-label="Yes, I am a customer — take me to the store"
                  className="group relative flex flex-col items-start text-left p-6 sm:p-7 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-brand-blue/50 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue shadow-lg shadow-black/40 overflow-hidden"
                >
                  {/* Subtle hover gradient glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  <div className="flex items-center justify-between w-full mb-4">
                    <div className="w-11 h-11 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white group-hover:text-brand-sky group-hover:border-brand-sky/40 transition-colors">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-slate-400 group-hover:text-brand-sky transition-colors flex items-center gap-1">
                      Direct Store <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>

                  <span className="text-lg sm:text-xl font-bold text-white mb-1.5 group-hover:text-brand-sky transition-colors">
                    Yes — take me to the store
                  </span>
                  <span className="text-xs sm:text-sm text-slate-300 leading-normal">
                    Browse active catalog, discover collections, and use Fast Cart for instant checkout.
                  </span>
                </motion.button>

                {/* CHOICE B: OWNER OR EMPLOYEE */}
                <motion.button
                  type="button"
                  onClick={onInsiderSelect}
                  onMouseEnter={() => setHoveredChoice("insider")}
                  onMouseLeave={() => setHoveredChoice(null)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  aria-label="No, I am a store owner or employee — unlock product tour"
                  className="group relative flex flex-col items-start text-left p-6 sm:p-7 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-brand-sky/50 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sky shadow-lg shadow-black/40 overflow-hidden"
                >
                  {/* Subtle hover gradient glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-sky/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  <div className="flex items-center justify-between w-full mb-4">
                    <div className="w-11 h-11 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white group-hover:text-brand-sky group-hover:border-brand-sky/40 transition-colors">
                      <Store className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-slate-400 group-hover:text-brand-sky transition-colors flex items-center gap-1">
                      Platform Tour <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>

                  <span className="text-lg sm:text-xl font-bold text-white mb-1.5 group-hover:text-brand-sky transition-colors">
                    No — I’m a store owner or staff
                  </span>
                  <span className="text-xs sm:text-sm text-slate-300 leading-normal">
                    Explore inventory intelligence, POS terminals, team management, and launch your store.
                  </span>
                </motion.button>
              </div>

              {/* Status helper text below choices */}
              <div className="mt-8 flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Hardware-ready POS & Online sync
                </span>
                <span className="hidden sm:inline-block text-slate-700">•</span>
                <span className="hidden sm:inline-block">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white text-[11px]">Tab</kbd> to navigate
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Footer Row with Discreet Meta */}
      <footer className="w-full max-w-6xl mx-auto flex items-center justify-between text-xs text-slate-500 z-10 pt-4">
        <span>© {new Date().getFullYear()} Matager Technologies</span>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline">Zero telemetry on initial gate</span>
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500/50" />
          <span>Multi-tenant SaaS</span>
        </div>
      </footer>
    </section>
  );
};
