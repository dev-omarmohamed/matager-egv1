"use client";

import React from "react";
import { inputCls } from "./styles";

export const SearchInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  className?: string;
}> = ({ value, onChange, placeholder, className = "" }) => (
  <div className={`relative ${className}`}>
    <i
      className="bi bi-search absolute start-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)] pointer-events-none"
      aria-hidden="true"
    />
    <input
      type="text"
      inputMode="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className={`${inputCls} ps-8`}
    />
  </div>
);
