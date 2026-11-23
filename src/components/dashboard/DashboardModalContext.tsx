"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
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

export const DashboardModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<OpenModalOptions>({
    mode: "create",
    entity: "product",
  });

  const openCrudModal = useCallback((options: OpenModalOptions) => {
    setModalConfig(options);
    setIsOpen(true);
  }, []);

  const closeCrudModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <DashboardModalContext.Provider
      value={{
        openCrudModal,
        closeCrudModal,
        isModalOpen: isOpen,
      }}
    >
      {children}
      <DashboardCrudModal
        isOpen={isOpen}
        onClose={closeCrudModal}
        mode={modalConfig.mode}
        entity={modalConfig.entity}
        title={modalConfig.title}
        description={modalConfig.description}
        initialData={modalConfig.initialData}
        fields={modalConfig.fields}
        onSubmit={modalConfig.onSubmit}
        onDelete={modalConfig.onDelete}
      >
        {modalConfig.children}
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
