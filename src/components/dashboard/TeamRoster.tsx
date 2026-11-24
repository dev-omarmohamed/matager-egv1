"use client";

import React, { useState } from "react";
import { useStoreOwnerData } from "@/lib/useStoreOwnerData";
import { useDashboardModal } from "@/components/dashboard/DashboardModalContext";
import { useDash } from "@/lib/useDash";
import { Panel } from "./ui/Panel";
import { EmptyState } from "./ui/EmptyState";
import { btnPrimary, btnIconDanger, divider, focusRing } from "./ui/styles";

export const MAX_TEAM_MEMBERS_WITHOUT_OWNER = 6;

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: string;
  avatarClass: string;
  permissions: string[];
}

interface TeamRosterProps {
  defaultExpanded?: boolean;
  onSelectMember?: (member: TeamMember) => void;
}

export const TeamRoster: React.FC<TeamRosterProps> = ({ defaultExpanded = false, onSelectMember }) => {
  const { t, tr } = useDash();
  const { teamMembers: live, storeConfig, addTeamMember, removeTeamMember } = useStoreOwnerData();
  const { openCrudModal } = useDashboardModal();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const ownerName = storeConfig?.store_name || "Store Owner";
  const ownerInitials = ownerName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  const members = live.slice(0, MAX_TEAM_MEMBERS_WITHOUT_OWNER);
  const seatsLeft = MAX_TEAM_MEMBERS_WITHOUT_OWNER - members.length;
  const atLimit = seatsLeft <= 0;

  const openAdd = () => {
    if (atLimit) return;
    openCrudModal({
      mode: "create",
      entity: "team_member",
      title: tr("Add New Team Member", "إضافة عضو فريق جديد"),
      fields: [
        { name: "name", label: tr("Full Name", "الاسم بالكامل"), required: true, placeholder: "e.g. Sara Khaled" },
        { name: "email", label: tr("Email Address", "البريد الإلكتروني"), type: "email", required: true, placeholder: "staff@matager.com" },
        {
          name: "role",
          label: tr("Role", "الدور الوظيفي"),
          type: "select",
          defaultValue: "Manager",
          options: [
            { label: tr("Store Manager", "مدير متجر"), value: "Manager" },
            { label: tr("Cashier", "كاشير / مبيعات"), value: "Cashier" },
            { label: tr("Support", "خدمة عملاء"), value: "Support" },
            { label: tr("Viewer", "مراقب تقارير"), value: "Viewer" },
          ],
        },
      ],
      onSubmit: async (d) => {
        await addTeamMember({
          name: d.name,
          email: d.email,
          role: d.role || "Manager",
          permissions: d.role === "Cashier" ? ["POS Register"] : ["Orders", "Products"],
        });
      },
    });
  };

  const openDelete = (m: any) =>
    openCrudModal({
      mode: "delete",
      entity: "team_member",
      title: tr(`Confirm Removing ${m.name}`, `تأكيد إزالة العضو ${m.name}`),
      initialData: { id: m.id, name: `${m.name} (${m.role})` },
      onDelete: async () => {
        await removeTeamMember(m.id);
      },
    });

  return (
    <Panel
      title={t.team.title}
      subtitle={tr(`Owner (${ownerName}) + ${members.length} member(s)`, `المالك (${ownerName}) + ${members.length} أعضاء`)}
      icon="bi-people"
      badge={members.length + 1}
      toggleLabel={t.team.showDetails}
      defaultOpen={defaultExpanded}
      meta={
        <span className="hidden sm:flex items-center -space-x-1.5 rtl:space-x-reverse ms-1" aria-hidden="true">
          <span className="w-5 h-5 rounded-full text-[8px] font-bold flex items-center justify-center ring-2 ring-[var(--color-glass-card-bg)] bg-[var(--color-status-blue-bg)] text-[var(--color-status-blue)] border border-[var(--color-status-blue-border)]">
            {ownerInitials}
          </span>
          {members.slice(0, 4).map((m) => (
            <span key={m.id} className={`w-5 h-5 rounded-full text-[8px] font-bold flex items-center justify-center border ring-2 ring-[var(--color-glass-card-bg)] ${m.avatarClass}`}>
              {m.initials}
            </span>
          ))}
        </span>
      }
      actions={
        <button type="button" onClick={openAdd} disabled={atLimit} className={btnPrimary} aria-label={t.team.addMember}>
          <i className="bi bi-plus-lg" aria-hidden="true" />
          <span className="hidden sm:inline">{t.team.addMember}</span>
        </button>
      }
    >
      <div className="p-3 sm:p-4 space-y-3">
        {members.length === 0 ? (
          <div className={`rounded-xl border ${divider}`}>
            <EmptyState icon="bi-people" title={tr("No additional team members added yet.", "لم تتم إضافة أعضاء فريق إضافيين بعد.")} />
          </div>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {members.map((m) => {
              const selected = selectedId === m.id;
              return (
                <li
                  key={m.id}
                  className={`rounded-xl border p-2.5 bg-[var(--color-surface)] transition-shadow duration-200 ${
                    selected ? "border-[var(--color-primary-light)] ring-1 ring-[var(--color-primary-light)]/30" : divider
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        setSelectedId(selected ? null : m.id);
                        onSelectMember?.(m);
                      }}
                      className={`flex-1 min-w-0 flex items-center gap-2 text-start rounded-lg ${focusRing}`}
                    >
                      <span className={`w-8 h-8 rounded-lg border shrink-0 flex items-center justify-center text-[10px] font-bold ${m.avatarClass}`}>
                        {m.initials}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-bold text-[var(--color-text-primary)] truncate">{m.name}</span>
                        <span dir="ltr" className="block text-[10px] text-[var(--color-text-muted)] truncate text-start">{m.email}</span>
                      </span>
                    </button>
                    <span className="text-[10px] font-semibold text-[var(--color-text-muted)] shrink-0">{m.role}</span>
                    <button type="button" onClick={() => openDelete(m)} className={btnIconDanger} aria-label={tr("Remove", "إزالة")}>
                      <i className="bi bi-trash3" aria-hidden="true" />
                    </button>
                  </div>
                  <p className={`mt-2 pt-2 border-t ${divider} text-[10px] text-[var(--color-text-secondary)] truncate`}>
                    {m.permissions?.join(" • ") || tr("Staff Access", "صلاحيات الموظف")}
                  </p>
                </li>
              );
            })}
          </ul>
        )}

        <p className="text-[10px] text-[var(--color-text-muted)]">
          {atLimit
            ? tr("Max 6 members reached besides owner.", "الحد الأقصى 6 أعضاء بجانب المالك.")
            : tr(`${members.length}/6 members · ${seatsLeft} seat(s) left`, `${members.length}/6 أعضاء • متاح ${seatsLeft} مقاعد`)}
        </p>
      </div>
    </Panel>
  );
};
