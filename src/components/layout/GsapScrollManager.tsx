"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSmoothScroll } from "./SmoothScrollProvider";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useLanguage } from "@/i18n";

export const GsapScrollManager: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const { locale, dir } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const { lenis } = useSmoothScroll();

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    // If user prefers reduced motion, skip heavy animations
    if (prefersReducedMotion) {
      return;
    }

    if (lenis) {
      lenis.on("scroll", ScrollTrigger.update);
    }

    // ─── Build GSAP ScrollTrigger Animations for Landing Page ───
    const ctx = gsap.context(() => {
      // Parallax effect on Hero Terminal Mockup
      const heroTerminal = document.querySelector(".group.relative.w-full.max-w-\\[1100px\\]");
      if (heroTerminal) {
        gsap.fromTo(
          heroTerminal,
          { y: 0, scale: 1 },
          {
            y: 40,
            scale: 0.985,
            ease: "none",
            scrollTrigger: {
              trigger: heroTerminal,
              start: "top 20%",
              end: "bottom top",
              scrub: 1.2,
            },
          }
        );
      }

      // Parallax on Ambient Purple Glow
      const ambientGlow = document.querySelectorAll(".blur-\\[90px\\], .blur-\\[80px\\]");
      ambientGlow.forEach((glow) => {
        gsap.to(glow, {
          y: -50,
          opacity: 0.45,
          ease: "none",
          scrollTrigger: {
            trigger: glow,
            start: "top bottom",
            end: "bottom top",
            scrub: 2,
          },
        });
      });

      // Section Headings Reveal Animation (Pill + Headline + Subhead)
      const sectionHeaders = document.querySelectorAll(
        "#pillars .text-center, #how-it-works .text-center, #ecosystem .text-center, #metrics .text-center, #integrations .text-center"
      );
      sectionHeaders.forEach((header) => {
        gsap.fromTo(
          header,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
              trigger: header,
              start: "top 82%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      // Stagger Cards in Value Pillars
      const pillarCards = document.querySelectorAll("#pillars .carbon-card");
      if (pillarCards.length > 0) {
        gsap.fromTo(
          pillarCards,
          { opacity: 0, y: 40, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.75,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: "#pillars",
              start: "top 75%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Stagger Steps in How It Works
      const flowSteps = document.querySelectorAll("#how-it-works .carbon-card");
      if (flowSteps.length > 0) {
        gsap.fromTo(
          flowSteps,
          { opacity: 0, y: 45 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: "#how-it-works",
              start: "top 75%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Stagger Modules in Ecosystem Grid
      const ecoCards = document.querySelectorAll("#ecosystem .carbon-card");
      if (ecoCards.length > 0) {
        gsap.fromTo(
          ecoCards,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: "#ecosystem",
              start: "top 75%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Metric Cards in Social Proof Telemetry
      const metricCards = document.querySelectorAll("#metrics .carbon-card");
      if (metricCards.length > 0) {
        gsap.fromTo(
          metricCards,
          { opacity: 0, scale: 0.94, y: 30 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: "back.out(1.4)",
            scrollTrigger: {
              trigger: "#metrics",
              start: "top 75%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Interactive 3D Card Hover Tilting Effect on Desktop
      if (window.matchMedia("(min-width: 1024px)").matches) {
        const interactiveCards = document.querySelectorAll(".carbon-card");
        interactiveCards.forEach((card) => {
          const el = card as HTMLElement;
          const onMouseMove = (e: MouseEvent) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -3.5;
            const rotateY = ((x - centerX) / centerX) * 3.5;

            gsap.to(el, {
              rotateX,
              rotateY,
              transformPerspective: 900,
              duration: 0.3,
              ease: "power1.out",
            });
          };

          const onMouseLeave = () => {
            gsap.to(el, {
              rotateX: 0,
              rotateY: 0,
              duration: 0.5,
              ease: "power2.out",
            });
          };

          el.addEventListener("mousemove", onMouseMove);
          el.addEventListener("mouseleave", onMouseLeave);
        });
      }
    }, containerRef);

    // Refresh ScrollTrigger when DOM settles
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 400);

    return () => {
      clearTimeout(refreshTimer);
      ctx.revert();
    };
  }, [prefersReducedMotion, locale, dir, lenis]);

  return (
    <div ref={containerRef} className="w-full">
      {children}
    </div>
  );
};
