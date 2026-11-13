"use client";

import React, { useRef, useEffect } from "react";
import { useLanguage } from "@/i18n";
import { gsap, isReducedMotion } from "@/lib/motion";

interface MarqueeProps {
  children: React.ReactNode;
  speed?: number; // pixels per second or relative duration
  direction?: "left" | "right";
  gap?: number; // gap in px
  pauseOnHover?: boolean;
  ariaLabel?: string;
  className?: string;
}

export const Marquee: React.FC<MarqueeProps> = ({
  children,
  speed = 35,
  direction = "left",
  gap = 24,
  pauseOnHover = true,
  ariaLabel,
  className = "",
}) => {
  const { dir } = useLanguage();
  const isRtl = dir === "rtl";

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  // Invert directional flow in RTL so movement feels natural
  const effectiveDirection = isRtl
    ? direction === "left"
      ? "right"
      : "left"
    : direction;

  useEffect(() => {
    if (!trackRef.current || !containerRef.current) return;

    if (isReducedMotion()) return;

    // Measure track width of one set
    const track = trackRef.current;
    const firstSet = track.children[0] as HTMLElement;
    if (!firstSet) return;

    const setWidth = firstSet.offsetWidth + gap;
    if (setWidth <= 0) return;

    const duration = Math.max(12, setWidth / speed);

    // Initial positioning based on direction (stable in LTR coordinate space)
    const fromX = effectiveDirection === "left" ? 0 : -setWidth;
    const toX = effectiveDirection === "left" ? -setWidth : 0;

    gsap.set(track, { x: fromX });

    const tween = gsap.to(track, {
      x: toX,
      duration,
      ease: "none",
      repeat: -1,
      overwrite: "auto",
    });

    tweenRef.current = tween;

    // IntersectionObserver to pause when off-screen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            tween.play();
          } else {
            tween.pause();
          }
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(containerRef.current);

    // Pause on document hidden (tab switch)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        tween.pause();
      } else {
        tween.play();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      tween.kill();
    };
  }, [speed, effectiveDirection, gap, isRtl]);

  // Smooth deceleration to 0 and re-acceleration to 1
  const decelerate = () => {
    if (!tweenRef.current || isReducedMotion()) return;
    gsap.to(tweenRef.current, {
      timeScale: 0,
      duration: 0.35,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const accelerate = () => {
    if (!tweenRef.current || isReducedMotion()) return;
    gsap.to(tweenRef.current, {
      timeScale: 1,
      duration: 0.45,
      ease: "power2.inOut",
      overwrite: "auto",
    });
  };

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={ariaLabel}
      onMouseEnter={pauseOnHover ? decelerate : undefined}
      onMouseLeave={pauseOnHover ? accelerate : undefined}
      onFocusCapture={pauseOnHover ? decelerate : undefined}
      onBlurCapture={pauseOnHover ? accelerate : undefined}
      onTouchStart={pauseOnHover ? decelerate : undefined}
      onTouchEnd={pauseOnHover ? accelerate : undefined}
      className={`relative w-full overflow-hidden select-none ${className}`}
      style={{
        direction: "ltr", // Enforces stable mechanical LTR coordinate plane for GSAP in both EN and AR
        maskImage:
          "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
      }}
    >
      <div
        ref={trackRef}
        className="flex items-center w-max will-change-transform"
        style={{ gap: `${gap}px`, direction: "ltr" }}
      >
        {/* Set 1: Primary interactive items */}
        <div className="flex items-center shrink-0" style={{ gap: `${gap}px`, direction: "ltr" }}>
          {children}
        </div>

        {/* Set 2: Duplicate 1 */}
        <div
          aria-hidden="true"
          className="flex items-center shrink-0 pointer-events-none"
          style={{ gap: `${gap}px`, direction: "ltr" }}
        >
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
                tabIndex: -1,
                "aria-hidden": true,
              });
            }
            return child;
          })}
        </div>

        {/* Set 3: Duplicate 2 (ensures seamless continuous loop on ultra-wide viewports) */}
        <div
          aria-hidden="true"
          className="flex items-center shrink-0 pointer-events-none"
          style={{ gap: `${gap}px`, direction: "ltr" }}
        >
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
                tabIndex: -1,
                "aria-hidden": true,
              });
            }
            return child;
          })}
        </div>
      </div>
    </div>
  );
};
