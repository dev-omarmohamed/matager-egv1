"use client";

import React, { useId, useState } from "react";
import { useDashboardLanguage } from "@/lib/i18n";
import { useStoreOwnerData } from "@/lib/useStoreOwnerData";
import { useDashboardModal } from "@/components/dashboard/DashboardModalContext";
import { Trash2 } from "lucide-react";

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

export const TeamRoster: React.FC<TeamRosterProps> = ({
  defaultExpanded = false,
  onSelectMember,
}) => {
  const { t, locale } = useDashboardLanguage();
  const isAr = locale === "ar";
  const panelId = useId();

  const { teamMembers: liveTeamMembers, storeConfig, addTeamMember, removeTeamMember } = useStoreOwnerData();
  const { openCrudModal } = useDashboardModal();

  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const ownerName = storeConfig?.store_name || "Store Owner";
  const ownerInitials = ownerName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const teamMembers = liveTeamMembers.slice(0, MAX_TEAM_MEMBERS_WITHOUT_OWNER);
  const isAtMemberLimit = teamMembers.length >= MAX_TEAM_MEMBERS_WITHOUT_OWNER;

  const handleMemberClick = (member: any) => {
    setSelectedMemberId((prev) => (prev === member.id ? null : member.id));
    onSelectMember?.(member);
  };

  const handleOpenAddMember = () => {
    if (isAtMemberLimit) return;
    openCrudModal({
      mode: "create",
      entity: "team_member",
      title: isAr ? "إضافة عضو فريق جديد" : "Add New Team Member",
      fields: [
        { name: "name", label: isAr ? "الاسم بالكامل" : "Full Name", required: true, placeholder: "e.g. Sara Khaled" },
        { name: "email", label: isAr ? "البريد الإلكتروني" : "Email Address", type: "email", required: true, placeholder: "staff@matager.com" },
        {
          name: "role",
          label: isAr ? "الدور الوظيفي" : "Role",
          type: "select",
          defaultValue: "Manager",
          options: [
            { label: isAr ? "مدير متجر (Store Manager)" : "Store Manager", value: "Manager" },
            { label: isAr ? "كاشير / مبيعات (Cashier / POS)" : "Cashier", value: "Cashier" },
            { label: isAr ? "خدمة عملاء (Support Staff)" : "Support", value: "Support" },
            { label: isAr ? "مراقب تقارير (Viewer)" : "Viewer", value: "Viewer" },
          ],
        },
      ],
      onSubmit: async (data) => {
        await addTeamMember({
          name: data.name,
          email: data.email,
          role: data.role || "Manager",
          permissions: data.role === "Cashier" ? ["POS Register"] : ["Orders", "Products"],
        });
      },
    });
  };

  const handleOpenDeleteMember = (e: React.MouseEvent, member: any) => {
    e.stopPropagation();
    openCrudModal({
      mode: "delete",
      entity: "team_member",
      title: isAr ? `تأكيد إزالة العضو ${member.name}` : `Confirm Removing ${member.name}`,
      initialData: {
        id: member.id,
        name: `${member.name} (${member.role})`,
      },
      onDelete: async () => {
        await removeTeamMember(member.id);
      },
    });
  };

  return (
    <section
      aria-label={t.team.title}
      className="rounded-[18px] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm overflow-hidden text-[var(--color-text-primary)] transition-colors duration-200"
    >
      {/* Compact Header */}
      <div className="px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold font-heading tracking-tight text-[var(--color-text-primary)] truncate">
              {t.team.title}
            </h3>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-muted)]">
              {teamMembers.length + 1}
            </span>
          </div>
          <p className="text-[11px] font-subtitle text-[var(--color-text-muted)] mt-0.5 truncate">
            {isAr
              ? `المالك (${ownerName}) + ${teamMembers.length} أعضاء.`
              : `Owner (${ownerName}) + ${teamMembers.length} member(s).`}
          </p>
        </div>

        {/* Avatar Strip + Toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden sm:flex items-center -space-x-1.5 rtl:space-x-reverse">
            <span
              title={`${ownerName} (${isAr ? "المالك" : "Owner"})`}
              className="w-6 h-6 rounded-full text-[9px] font-bold font-ui flex items-center justify-center bg-sky-100 text-sky-700 border border-sky-200 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-400/30 ring-2 ring-[var(--color-surface)]"
            >
              {ownerInitials}
            </span>
            {teamMembers.map((m) => (
              <span
                key={m.id}
                title={`${m.name} — ${m.role}`}
                className={`w-6 h-6 rounded-full text-[9px] font-bold font-ui flex items-center justify-center border ring-2 ring-[var(--color-surface)] ${m.avatarClass}`}
              >
                {m.initials}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            aria-controls={panelId}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium font-ui text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] transition-colors cursor-pointer select-none"
          >
            <span>{t.team.showDetails}</span>
            <i
              className={`bi bi-chevron-down text-[10px] transition-transform duration-300 ${
                isExpanded ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {/* Smooth Height Accordion */}
      <div
        id={panelId}
        className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-3.5 pt-2.5 sm:px-5 sm:pb-4 space-y-2.5 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)]/30">
            {/* Accounts Row Container */}
            <div className="flex flex-wrap items-stretch gap-2">
              {teamMembers.map((member) => {
                const isSelected = selectedMemberId === member.id;
                return (
                  <div
                    key={member.id}
                    onClick={() => handleMemberClick(member)}
                    className={`group text-start flex-1 min-w-[235px] max-w-full sm:max-w-[calc(50%-0.25rem)] px-3 py-2 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "border-[var(--color-primary-light)] ring-1 ring-[var(--color-primary-light)]/30"
                        : "border-[var(--color-border-subtle)] hover:border-[var(--color-border)]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg border flex items-center justify-center text-[10px] font-bold font-ui shrink-0 ${member.avatarClass}`}
                        >
                          {member.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold font-ui text-[var(--color-text-primary)] truncate leading-tight">
                            {member.name}
                          </p>
                          <p
                            dir="ltr"
                            className="text-[10px] font-ui text-[var(--color-text-muted)] truncate text-start leading-tight mt-0.5"
                          >
                            {member.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-semibold font-ui text-[var(--color-text-muted)]">
                          {member.role}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleOpenDeleteMember(e, member)}
                          className="p-1 rounded text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-1.5 pt-1.5 border-t border-[var(--color-border-subtle)] text-[10px] font-ui text-[var(--color-text-secondary)] truncate">
                      {member.permissions?.join(" • ") || "Staff Access"}
                    </div>
                  </div>
                );
              })}

              {teamMembers.length === 0 && (
                <div className="w-full py-4 text-center text-[11px] font-ui text-[var(--color-text-muted)] rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-subtle)]">
                  {isAr ? "لم تتم إضافة أعضاء فريق إضافيين بعد." : "No additional team members added yet."}
                </div>
              )}
            </div>

            {/* Compact Footer */}
            <div className="pt-0.5 flex items-center justify-between gap-2">
              <span className="text-[10px] font-ui text-[var(--color-text-muted)]">
                {isAtMemberLimit
                  ? isAr
                    ? "الحد الأقصى 6 أعضاء بجانب المالك."
                    : "Max 6 members reached besides owner."
                  : isAr
                  ? `${teamMembers.length}/6 أعضاء • متاح ${MAX_TEAM_MEMBERS_WITHOUT_OWNER - teamMembers.length} مقاعد`
                  : `${teamMembers.length}/6 members • ${MAX_TEAM_MEMBERS_WITHOUT_OWNER - teamMembers.length} seat(s) left`}
              </span>

              <button
                type="button"
                disabled={isAtMemberLimit}
                onClick={handleOpenAddMember}
                className="py-1.5 px-3.5 rounded-lg bg-[var(--color-primary-light)] hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[11px] font-bold font-ui transition-all inline-flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
              >
                <i className="bi bi-plus-lg text-[10px]" aria-hidden="true" />
                <span>{t.team.addMember}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
