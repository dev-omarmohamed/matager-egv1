"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface SmoothScrollContextValue {
  lenis: Lenis | null;
  scrollTo: (
    target: string | number | HTMLElement,
    options?: {
      offset?: number;
      immediate?: boolean;
      duration?: number;
      easing?: (t: number) => number;
      onComplete?: () => void;
    }
  ) => void;
  start: () => void;
  stop: () => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  lenis: null,
  scrollTo: () => {},
  start: () => {},
  stop: () => {},
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export const SmoothScrollProvider: React.FC<SmoothScrollProviderProps> = ({
  children,
}) => {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Respect user's accessibility preferences for reduced motion
    if (prefersReducedMotion) {
      document.documentElement.classList.remove("lenis", "lenis-smooth");
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Initialize unified platform-wide Lenis smooth scroll instance
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      infinite: false,
    });

    lenisRef.current = lenis;
    setLenisInstance(lenis);
    (window as any).__lenis = lenis;

    // Connect Lenis scroll updates to GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    // GSAP ticker alignment for smooth frame rendering
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      lenisRef.current = null;
      setLenisInstance(null);
      if ((window as any).__lenis === lenis) {
        delete (window as any).__lenis;
      }
    };
  }, [prefersReducedMotion]);

  // Reset scroll smoothly to top on route navigation across storefront, dashboard, cashier, admin
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
      const timer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 80);
      return () => clearTimeout(timer);
    } else if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  const contextValue = useMemo<SmoothScrollContextValue>(
    () => ({
      lenis: lenisInstance,
      scrollTo: (target, options) => {
        if (lenisRef.current) {
          lenisRef.current.scrollTo(target, options);
        } else if (typeof window !== "undefined") {
          if (typeof target === "number") {
            window.scrollTo({
              top: target,
              behavior: options?.immediate ? "auto" : "smooth",
            });
          } else if (typeof target === "string") {
            const el = document.querySelector(target);
            if (el) {
              const top =
                el.getBoundingClientRect().top +
                window.pageYOffset +
                (options?.offset || 0);
              window.scrollTo({
                top,
                behavior: options?.immediate ? "auto" : "smooth",
              });
            }
          } else if (target instanceof HTMLElement) {
            const top =
              target.getBoundingClientRect().top +
              window.pageYOffset +
              (options?.offset || 0);
            window.scrollTo({
              top,
              behavior: options?.immediate ? "auto" : "smooth",
            });
          }
        }
      },
      start: () => lenisRef.current?.start(),
      stop: () => lenisRef.current?.stop(),
    }),
    [lenisInstance]
  );

  return (
    <SmoothScrollContext.Provider value={contextValue}>
      {children}
    </SmoothScrollContext.Provider>
  );
};
