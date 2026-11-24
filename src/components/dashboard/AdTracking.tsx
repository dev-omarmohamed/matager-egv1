"use client";

import React from "react";
import { StatusPill } from "@/components/ui/StatusPill";
import { useDash } from "@/lib/useDash";
import { Panel } from "./ui/Panel";
import { btnGhost, divider } from "./ui/styles";

export const AdTracking: React.FC = () => {
  const { t } = useDash();

  const integrations = [
    { id: "meta", title: t.adTracking.metaTitle, desc: t.adTracking.metaDesc, icon: "bi-meta", linked: true },
    { id: "tiktok", title: t.adTracking.tiktokTitle, desc: t.adTracking.tiktokDesc, icon: "bi-tiktok", linked: false },
    { id: "ga4", title: t.adTracking.googleTitle, desc: t.adTracking.googleDesc, icon: "bi-google", linked: true },
  ];

  return (
    <Panel
      title={t.adTracking.title}
      subtitle={t.adTracking.subtitle}
      icon="bi-bullseye"
      toggleLabel={t.adTracking.showDetails}
      defaultOpen={false}
      meta={
        <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-bold text-[var(--color-status-green)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-status-green)] animate-pulse" />
          {t.adTracking.live}
        </span>
      }
    >
      <div className="p-3 sm:p-4 space-y-3">
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--color-status-green-bg)] border border-[var(--color-status-green-border)]">
          <span className="w-2 h-2 mt-1 rounded-full shrink-0 bg-[var(--color-status-green)] animate-pulse" />
          <div>
            <p className="text-xs font-bold text-[var(--color-status-green)]">
              {t.adTracking.pixelHealth} · {t.adTracking.live}
            </p>
            <p className="text-[11px] text-[var(--color-text-secondary)] font-subtitle leading-relaxed">{t.adTracking.healthDesc}</p>
          </div>
        </div>

        <ul className={`rounded-xl border ${divider} divide-y ${divider} overflow-hidden`}>
          {integrations.map((i) => (
            <li key={i.id} className="flex items-center gap-3 px-3 sm:px-4 py-2.5">
              <span className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]">
                <i className={`bi ${i.icon}`} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[var(--color-text-primary)] truncate">{i.title}</p>
                <p className="text-[10px] text-[var(--color-text-muted)] truncate">{i.desc}</p>
              </div>
              <StatusPill variant={i.linked ? "success" : "neutral"}>{i.linked ? t.adTracking.connected : t.adTracking.notLinked}</StatusPill>
              <button type="button" className={btnGhost}>{i.linked ? t.adTracking.editBtn : t.adTracking.setupBtn}</button>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
};
