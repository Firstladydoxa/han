"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { api, ApiError, type Language, type ProjectDetail } from "@/lib/api";
import { Alert, PageTitle, Spinner, TierBadge } from "@/components/ui";
import { Chat } from "@/components/Chat";
import { QuickTranslate } from "@/components/QuickTranslate";
import { Workspace } from "@/components/Workspace";

type Tab = "chat" | "quick" | "workspace";
const TABS: { id: Tab; label: string }[] = [
  { id: "chat", label: "HAN Chat" },
  { id: "quick", label: "Quick translate" },
  { id: "workspace", label: "Translation Workspace" },
];

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("chat");
  const [openId, setOpenId] = useState<string | null>(null);
  const openInWorkspace = (translationId: string) => { setOpenId(translationId); setTab("workspace"); };

  useEffect(() => {
    Promise.all([api.project(id), api.languages()])
      .then(([p, l]) => { setProject(p); setLanguages(l); })
      .catch((e: unknown) => setError(e instanceof ApiError ? e.message : "Unable to load this project."));
  }, [id]);

  const names = useMemo(() => Object.fromEntries(languages.map((l) => [l.code, l.display_name])), [languages]);

  if (error) return <Alert>{error}</Alert>;
  if (!project) return <Spinner label="Loading project" />;

  return (
    <>
      <PageTitle eyebrow={project.domain ?? "Project"} title={project.name}>{[project.style, project.member_role.replace("_", " ")].filter(Boolean).join(" · ")}</PageTitle>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <div role="tablist" aria-label="Work mode" className="mb-4 flex gap-1 overflow-x-auto rounded-xl border border-line bg-white p-1">
            {TABS.map((t) => (
              <button key={t.id} role="tab" type="button" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls={`panel-${t.id}`}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold ${tab === t.id ? "bg-brand text-white" : "text-ink-soft hover:bg-wash"}`}
                onClick={() => setTab(t.id)}>{t.label}</button>
            ))}
          </div>
          <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
            {tab === "chat" ? <Chat project={project} onOpenWorkspace={openInWorkspace} /> : null}
            {tab === "quick" ? <QuickTranslate project={project} names={names} onOpenWorkspace={openInWorkspace} /> : null}
            {tab === "workspace" ? <Workspace project={project} names={names} openTranslationId={openId} /> : null}
          </div>
        </div>
        <aside className="space-y-4" aria-label="Project context">
          <section className="card">
            <h2 className="mb-2 text-sm font-semibold">Project instructions</h2>
            <p className="whitespace-pre-wrap text-sm text-ink-soft">{project.instructions || "No special instructions."}</p>
          </section>
          <section className="card">
            <h2 className="mb-2 text-sm font-semibold">Language readiness</h2>
            {project.language_directions.length === 0 ? <p className="text-xs text-ink-muted">No language pairs are available yet.</p> : null}
            <ul className="space-y-2">
              {project.language_directions.map((d) => (
                <li key={`${d.source_code}-${d.target_code}`} className="text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{names[d.source_code] ?? d.source_code} → {names[d.target_code] ?? d.target_code}</span>
                    <TierBadge tier={d.readiness_tier} />
                  </div>
                  {d.readiness_tier === "experimental" ? <p className="mt-0.5 text-amber-800">Internal warning: controlled pilot only.</p> : null}
                  {d.review_note ? <p className="mt-0.5 text-ink-muted">{d.review_note}</p> : null}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
}
