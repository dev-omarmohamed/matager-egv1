"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import { useLanguage } from "@/i18n";
import { isReducedMotion } from "@/lib/motion";

interface MarqueeProps {
  children: React.ReactNode;
  speed?: number; // pixels per second
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

  const [isGrabbing, setIsGrabbing] = useState(false);

  // Position and interaction state in refs for 60/120fps lock without React re-renders
  const currentXRef = useRef<number>(0);
  const setWidthRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const isHoveredRef = useRef<boolean>(false);
  const isInViewRef = useRef<boolean>(true);
  const dragDistanceRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);

  const pointerStartXRef = useRef<number>(0);
  const trackStartXRef = useRef<number>(0);
  const lastPointerXRef = useRef<number>(0);
  const lastPointerTimeRef = useRef<number>(0);

  // Directional flow
  const effectiveDirection = isRtl
    ? direction === "left"
      ? "right"
      : "left"
    : direction;
  const dirSign = effectiveDirection === "left" ? -1 : 1;

  // Seamless modulo wrap into [-setWidth, 0)
  const wrapX = useCallback((val: number, setW: number) => {
    if (setW <= 0) return 0;
    const mod = ((val % setW) + setW) % setW;
    return mod - setW;
  }, []);

  // Set measure and animation loop
  useEffect(() => {
    if (!trackRef.current || !containerRef.current) return;

    const track = trackRef.current;
    const firstSet = track.children[0] as HTMLElement;
    if (!firstSet) return;

    // Measure one set width
    const updateDimensions = () => {
      if (firstSet) {
        setWidthRef.current = firstSet.offsetWidth + gap;
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    resizeObserver.observe(firstSet);

    // Initial positioning
    if (currentXRef.current === 0) {
      currentXRef.current = wrapX(0, setWidthRef.current);
      track.style.transform = `translate3d(${currentXRef.current}px, 0, 0)`;
    }

    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1); // clamp delta time to 100ms max to prevent jumps
      lastTime = now;

      const setW = setWidthRef.current;

      if (setW > 0 && isInViewRef.current) {
        if (isDraggingRef.current) {
          // Track is driven directly by pointermove
        } else if (Math.abs(velocityRef.current) > 10) {
          // Momentum coasting after user flung/swiped
          currentXRef.current = wrapX(
            currentXRef.current + velocityRef.current * dt,
            setW
          );
          velocityRef.current *= Math.pow(0.92, dt * 60); // frame-rate independent friction
          track.style.transform = `translate3d(${currentXRef.current}px, 0, 0)`;
        } else {
          // Normal auto-scroll
          velocityRef.current = 0;
          const shouldMove = !isReducedMotion() && (!pauseOnHover || !isHoveredRef.current);
          if (shouldMove) {
            currentXRef.current = wrapX(
              currentXRef.current + dirSign * speed * dt,
              setW
            );
            track.style.transform = `translate3d(${currentXRef.current}px, 0, 0)`;
          }
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    // Viewport intersection observer to conserve CPU when scrolled out of view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isInViewRef.current = entry.isIntersecting;
        });
      },
      { threshold: 0.02 }
    );
    observer.observe(containerRef.current);

    // Pause on document hidden (tab switch)
    const handleVisibilityChange = () => {
      isInViewRef.current = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [speed, dirSign, gap, pauseOnHover, wrapX]);

  // Pointer drag event handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag on primary mouse button (0) or touch/pen
    if (e.button !== 0) return;

    isDraggingRef.current = true;
    dragDistanceRef.current = 0;
    pointerStartXRef.current = e.clientX;
    lastPointerXRef.current = e.clientX;
    lastPointerTimeRef.current = performance.now();
    trackStartXRef.current = currentXRef.current;
    velocityRef.current = 0;
    setIsGrabbing(true);

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignored if capture unsupported
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    const dx = e.clientX - pointerStartXRef.current;
    dragDistanceRef.current = Math.abs(dx);

    const setW = setWidthRef.current;
    if (setW > 0) {
      currentXRef.current = wrapX(trackStartXRef.current + dx, setW);
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${currentXRef.current}px, 0, 0)`;
      }
    }

    // Measure velocity for momentum fling
    const now = performance.now();
    const dt = (now - lastPointerTimeRef.current) / 1000;
    if (dt > 0.008) {
      const instantaneousVelocity = (e.clientX - lastPointerXRef.current) / dt;
      // Exponential moving average for smooth fling
      velocityRef.current = 0.6 * instantaneousVelocity + 0.4 * velocityRef.current;
      lastPointerXRef.current = e.clientX;
      lastPointerTimeRef.current = now;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsGrabbing(false);

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignored
    }

    // Clamp fling velocity to sane boundaries (max 2000px/s)
    const maxVelocity = 2000;
    if (Math.abs(velocityRef.current) > maxVelocity) {
      velocityRef.current = Math.sign(velocityRef.current) * maxVelocity;
    }
  };

  // Horizontal wheel / shift-wheel support
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey;
    if (isHorizontal && setWidthRef.current > 0) {
      const delta = e.shiftKey ? e.deltaY : e.deltaX;
      currentXRef.current = wrapX(currentXRef.current - delta, setWidthRef.current);
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${currentXRef.current}px, 0, 0)`;
      }
      e.preventDefault();
    }
  };

  // Suppress clicks on child elements if user was actively dragging
  const handleClickCapture = (e: React.MouseEvent) => {
    if (dragDistanceRef.current > 6) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={ariaLabel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      onClickCapture={handleClickCapture}
      onMouseEnter={() => {
        isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
      }}
      className={`relative w-full overflow-hidden select-none touch-pan-y ${
        isGrabbing ? "cursor-grabbing" : "cursor-grab"
      } ${className}`}
      style={{
        direction: "ltr", // Enforces stable mechanical LTR coordinate plane for wrap calculations in both EN and AR
        maskImage:
          "linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)",
      }}
    >
      <div
        ref={trackRef}
        className="flex items-center w-max will-change-transform"
        style={{ gap: `${gap}px`, direction: "ltr" }}
      >
        {/* Set 1: Primary items */}
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

        {/* Set 3: Duplicate 2 */}
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

        {/* Set 4: Duplicate 3 (guarantees seamless coverage on ultra-wide / 4K displays during drag) */}
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
