"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  getStoreProfile,
  resolveViewer,
  getAllRegisteredStores,
  type StoreProfile,
  type ViewerProfile,
} from "./store-registry";

interface StoreContextValue {
  currentStore: StoreProfile;
  viewer: ViewerProfile;
  allStores: StoreProfile[];
  setStoreId: (storeId: string) => void;
  setViewerId: (viewerId: string) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function StoreContextProviderInner({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const urlStoreId = searchParams.get("storeId") || searchParams.get("store");
  const urlViewerId = searchParams.get("viewerId") || searchParams.get("uid");

  const [activeStoreId, setActiveStoreId] = useState<string>(urlStoreId || "peacock_store");
  const [activeViewerId, setActiveViewerId] = useState<string>(urlViewerId || "");

  // Update when URL changes
  useEffect(() => {
    if (urlStoreId && urlStoreId !== activeStoreId) {
      setActiveStoreId(urlStoreId);
    }
  }, [urlStoreId]);

  useEffect(() => {
    if (urlViewerId && urlViewerId !== activeViewerId) {
      setActiveViewerId(urlViewerId);
    }
  }, [urlViewerId]);

  // Save active store to local storage
  useEffect(() => {
    if (typeof window !== "undefined" && activeStoreId) {
      localStorage.setItem("matager_active_store_id", activeStoreId);
    }
  }, [activeStoreId]);

  const currentStore = useMemo(() => {
    return getStoreProfile(activeStoreId);
  }, [activeStoreId]);

  const viewer = useMemo(() => {
    return resolveViewer(activeViewerId);
  }, [activeViewerId]);

  const allStores = useMemo(() => {
    return getAllRegisteredStores();
  }, []);

  const handleSetStoreId = (newStoreId: string) => {
    setActiveStoreId(newStoreId);
    if (typeof window !== "undefined") {
      localStorage.setItem("matager_active_store_id", newStoreId);
      const params = new URLSearchParams(window.location.search);
      params.set("storeId", newStoreId);
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  const handleSetViewerId = (newViewerId: string) => {
    setActiveViewerId(newViewerId);
    if (typeof window !== "undefined") {
      localStorage.setItem("matager_viewer_id", newViewerId);
      const params = new URLSearchParams(window.location.search);
      params.set("viewerId", newViewerId);
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        currentStore,
        viewer,
        allStores,
        setStoreId: handleSetStoreId,
        setViewerId: handleSetViewerId,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center text-xs">Loading Matager Store Environment...</div>}>
      <StoreContextProviderInner>{children}</StoreContextProviderInner>
    </Suspense>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    // Graceful fallback if used outside provider
    const fallbackStore = getStoreProfile("peacock_store");
    const fallbackViewer = resolveViewer();
    return {
      currentStore: fallbackStore,
      viewer: fallbackViewer,
      allStores: getAllRegisteredStores(),
      setStoreId: () => {},
      setViewerId: () => {},
    };
  }
  return ctx;
}
