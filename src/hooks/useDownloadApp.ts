"use client";

import { useState, useRef, useCallback } from "react";
import { APP_LINKS } from "@/config/app-links.config";

export function useDownloadApp() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);

  const handleDownload = useCallback((triggerElement?: HTMLElement | null) => {
    if (triggerElement) {
      triggerRef.current = triggerElement;
    } else if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
      triggerRef.current = document.activeElement;
    }

    if (typeof window !== "undefined") {
      const ua = navigator.userAgent || "";
      const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
      const isAndroid = /android/i.test(ua);

      if (isIOS && APP_LINKS.ios) {
        window.location.href = APP_LINKS.ios;
        return;
      }

      if (isAndroid && APP_LINKS.android) {
        window.location.href = APP_LINKS.android;
        return;
      }
    }

    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    if (triggerRef.current && typeof triggerRef.current.focus === "function") {
      setTimeout(() => {
        triggerRef.current?.focus();
      }, 50);
    }
  }, []);

  return {
    isDownloadModalOpen: isOpen,
    handleDownload,
    closeDownloadModal: closeModal,
  };
}

