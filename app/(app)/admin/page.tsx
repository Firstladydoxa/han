"use client";

import { useState } from "react";
import { PageTitle } from "@/components/ui";
import { ProjectsPanel, ReadinessPanel, TerminologyPanel, UsersPanel } from "@/components/AdminPanels";

const TABS = [
  { id: "users", label: "Users", view: <UsersPanel /> },
  { id: "projects", label: "Projects & members", view: <ProjectsPanel /> },
  { id: "terminology", label: "Terminology", view: <TerminologyPanel /> },
  { id: "readiness", label: "Language readiness", view: <ReadinessPanel /> },
] as const;

export default function AdminPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("users");
  return (
    <>
      <PageTitle eyebrow="Administration" title="TNI administration">Manage people, projects, approved terminology and language readiness.</PageTitle>
      <div role="tablist" aria-label="Administration" className="mb-4 flex gap-1 overflow-x-auto rounded-xl border border-line bg-white p-1">
        {TABS.map((t) => (
          <button key={t.id} role="tab" type="button" aria-selected={tab === t.id}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold ${tab === t.id ? "bg-brand text-white" : "text-ink-soft hover:bg-wash"}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>
      <div role="tabpanel">{TABS.find((t) => t.id === tab)?.view}</div>
    </>
  );
}
