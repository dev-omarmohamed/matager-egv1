"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import {
  DashboardCrudModal,
  CrudMode,
  CrudEntity,
  CrudFieldConfig,
} from "./DashboardCrudModal";

export interface OpenModalOptions {
  mode: CrudMode;
  entity: CrudEntity | string;
  title?: string;
  description?: string;
  initialData?: Record<string, any>;
  fields?: CrudFieldConfig[];
  onSubmit?: (data: Record<string, any>) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
  children?: React.ReactNode;
}

export interface DashboardModalContextValue {
  openCrudModal: (options: OpenModalOptions) => void;
  closeCrudModal: () => void;
  isModalOpen: boolean;
}

const DashboardModalContext = createContext<DashboardModalContextValue | undefined>(undefined);

export const DashboardModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  // The last config is intentionally kept after closing, so the exit animation still has content to show.
  const [config, setConfig] = useState<OpenModalOptions>({ mode: "create", entity: "product" });

  const openCrudModal = useCallback((options: OpenModalOptions) => {
    setConfig(options);
    setIsOpen(true);
  }, []);

  const closeCrudModal = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ openCrudModal, closeCrudModal, isModalOpen: isOpen }),
    [openCrudModal, closeCrudModal, isOpen]
  );

  return (
    <DashboardModalContext.Provider value={value}>
      {children}
      <DashboardCrudModal
        isOpen={isOpen}
        onClose={closeCrudModal}
        mode={config.mode}
        entity={config.entity}
        title={config.title}
        description={config.description}
        initialData={config.initialData}
        fields={config.fields}
        onSubmit={config.onSubmit}
        onDelete={config.onDelete}
      >
        {config.children}
      </DashboardCrudModal>
    </DashboardModalContext.Provider>
  );
};

export function useDashboardModal(): DashboardModalContextValue {
  const context = useContext(DashboardModalContext);
  if (!context) {
    throw new Error("useDashboardModal must be used within a <DashboardModalProvider />");
  }
  return context;
}
