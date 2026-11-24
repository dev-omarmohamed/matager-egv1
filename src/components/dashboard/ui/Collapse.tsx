"use client";

import React from "react";

interface CollapseProps {
  open: boolean;
  id?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Height animation with no max-height guessing: animates grid-template-rows 0fr -> 1fr,
 * so content of any height opens and closes smoothly (and never gets clipped).
 * Closed content is `inert`, so it can't be tabbed into or read by screen readers.
 */
export const Collapse: React.FC<CollapseProps> = ({ open, id, className = "", children }) => {
  const inertProps = open ? {} : ({ inert: "" } as Record<string, string>);
  return (
    <div
      id={id}
      aria-hidden={!open}
      {...inertProps}
      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      } ${className}`}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
};
