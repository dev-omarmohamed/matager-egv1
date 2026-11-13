/**
 * GSAP Motion System & Token Library for Matager Surfaces
 *
 * Centralizes GSAP registration (Flip, ScrollTrigger), animation tokens,
 * motion toggle, and reusable interaction primitives.
 */

import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register core plugins once safely in client environment
if (typeof window !== "undefined") {
  gsap.registerPlugin(Flip, ScrollTrigger);
}

/**
 * Global kill-switch for showcase motion (for debugging or instant mode)
 */
export const MOTION_ENABLED = true;

/**
 * Standardized motion curves and timing
 */
export const ease = {
  out: "power3.out",
  inOut: "power2.inOut",
  soft: "expo.out",
  gentle: "sine.inOut",
  elastic: "back.out(1.4)",
} as const;

export const dur = {
  instant: 0.05,
  fast: 0.2,
  base: 0.45,
  slow: 0.8,
  glow: 6.0,
} as const;

export const distance = {
  sm: 8,
  md: 16,
  lg: 32,
  xl: 48,
} as const;

/**
 * Check if the user prefers reduced motion
 */
export function isReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Animate sliding indicator highlight for segmented controls and tab lists
 */
export function slideIndicator(
  indicatorEl: HTMLElement | null,
  activeTargetEl: HTMLElement | null,
  containerEl: HTMLElement | null,
  options: {
    isRtl?: boolean;
    duration?: number;
    immediate?: boolean;
  } = {}
) {
  if (!indicatorEl || !activeTargetEl || !containerEl) return;

  const containerRect = containerEl.getBoundingClientRect();
  const targetRect = activeTargetEl.getBoundingClientRect();

  // If elements are not rendered yet, skip
  if (targetRect.width === 0 || targetRect.height === 0 || containerRect.width === 0) {
    return;
  }

  // Ensure strict absolute positioning from container origin
  indicatorEl.style.top = "0px";
  indicatorEl.style.left = "0px";
  indicatorEl.style.margin = "0px";
  indicatorEl.style.position = "absolute";

  // Calculate position relative to container
  const leftOffset = targetRect.left - containerRect.left + containerEl.scrollLeft;
  const width = targetRect.width;
  const height = targetRect.height;
  const topOffset = targetRect.top - containerRect.top + containerEl.scrollTop;

  if (isReducedMotion() || !MOTION_ENABLED || options.immediate) {
    gsap.set(indicatorEl, {
      x: leftOffset,
      y: topOffset,
      width,
      height,
      opacity: 1,
    });
    return;
  }

  gsap.to(indicatorEl, {
    x: leftOffset,
    y: topOffset,
    width,
    height,
    opacity: 1,
    duration: options.duration ?? dur.base,
    ease: ease.soft,
    overwrite: "auto",
  });
}

/**
 * Create a gentle idle vertical float animation
 */
export function createIdleFloat(
  element: HTMLElement | null,
  options: {
    yDistance?: number;
    duration?: number;
    delay?: number;
  } = {}
): gsap.core.Tween | null {
  if (!element || isReducedMotion() || !MOTION_ENABLED) return null;

  const yDist = options.yDistance ?? 5;
  const duration = options.duration ?? 3.8;
  const delay = options.delay ?? 0;

  return gsap.to(element, {
    y: `+=${yDist}`,
    duration,
    ease: ease.gentle,
    repeat: -1,
    yoyo: true,
    delay,
    overwrite: "auto",
  });
}

export { gsap, Flip, ScrollTrigger };

