"use client";

import React from "react";
import { useDashboardLanguage } from "@/lib/i18n";
import { StatusPill } from "@/components/ui/StatusPill";

export const TeamRoster: React.FC = () => {
  const { t } = useDashboardLanguage();

  const members = [
    {
      id: "1",
      name: "Mohamed Ahmed",
      email: "mohamed@matager.com",
      initials: "MA",
      role: t.team.roles.mainAdmin,
      variant: "info" as const,
      bg: "bg-[var(--color-status-blue)]",
    },
    {
      id: "2",
      name: "John Doe",
      email: "j.doe@matager.com",
      initials: "JD",
      role: t.team.roles.manager,
      variant: "purple" as const,
      bg: "bg-[var(--color-status-purple)]",
    },
    {
      id: "3",
      name: "Ahmed Kamal",
      email: "a.kamal@matager.com",
      initials: "AK",
      role: t.team.roles.support,
      variant: "success" as const,
      bg: "bg-[var(--color-status-green)]",
    },
    {
      id: "4",
      name: "Sara Khaled",
      email: "sara@matager.com",
      initials: "SK",
      role: t.team.roles.viewer,
      variant: "pending" as const,
      bg: "bg-[var(--color-status-amber)]",
    },
  ];

  return (
    <div className="glass-panel rounded-[20px] bg-[var(--color-glass-card-bg)] border border-[var(--color-glass-card-border)] shadow-[var(--shadow-glass-card)] overflow-hidden transition-all duration-200 hover:-translate-y-[1px]">
      <input
        type="checkbox"
        id="toggle-team"
        className="peer/team hidden"
        aria-hidden="true"
      />

      <div className="p-4 sm:p-5 border-b border-[var(--color-border-subtle)] flex justify-between items-center">
        <div>
          <h3 className="text-sm sm:text-base font-bold font-heading text-[var(--color-text-primary)]">
            {t.team.title}
          </h3>
          <p className="text-[11px] font-subtitle text-[var(--color-text-muted)] mt-0.5">
            {t.team.subtitle}
          </p>
        </div>

        <label
          htmlFor="toggle-team"
          className="text-[11px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1.5 transition-colors group cursor-pointer select-none peer-checked/team:[&_.team-chevron]:rotate-180"
        >
          <span className="tracking-wide">{t.team.showDetails}</span>
          <i className="bi bi-chevron-down transition-transform duration-300 group-hover:text-[var(--color-text-primary)] team-chevron text-[10px]" />
        </label>
      </div>

      <div className="max-h-0 overflow-hidden transition-all duration-500 ease-in-out peer-checked/team:max-h-[380px] bg-white/[0.01]">
        <div className="p-4 sm:p-5 space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between border-b border-[var(--color-border-subtle)]/40 pb-2.5 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full ${member.bg} flex items-center justify-center text-xs font-bold font-heading text-white shrink-0 shadow-sm`}
                >
                  {member.initials}
                </div>
                <div>
                  <p className="text-xs font-bold font-ui text-[var(--color-text-primary)]">
                    {member.name}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">
                    {member.email}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <StatusPill variant={member.variant}>{member.role}</StatusPill>
              </div>
            </div>
          ))}

          {/* Add New Member Button */}
          <button
            type="button"
            className="w-full mt-3 py-2 px-3 bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] hover:opacity-95 text-white rounded-lg text-xs font-bold font-ui transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.99]"
          >
            <i className="bi bi-plus-lg text-xs" />
            <span>{t.team.addMember}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
