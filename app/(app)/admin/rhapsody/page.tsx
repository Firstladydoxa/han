"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { PageTitle, Spinner } from "@/components/ui";

function Panel({ children }: { children: ReactNode }) { return <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-xl shadow-black/10">{children}</section>; }

const workflow = [
  ["01", "Upload manuscript", "Accept the monthly Word manuscript and/or supplied XLIFF. Record edition, source version and rights metadata."],
  ["02", "Extract and structure", "Identify front matter, daily articles, prayers, reading plans and special sections while retaining order and inline formatting."],
  ["03", "Review the master", "Inspect extracted sections, missing content, tags, day sequence and layout warnings before activation."],
  ["04", "Activate edition", "Publish an immutable, versioned English master for translator assignments."],
];

export default function RhapsodyAdminPage() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner label="Checking publication permissions" />;
  if (!user || !["tni_admin", "technical_admin"].includes(user.role)) return <Panel><h1 className="text-lg font-semibold">Access restricted</h1><p className="mt-2 text-sm text-white/55">Rhapsody Studio is available to authorised HAN administrators.</p></Panel>;
  return <div className="space-y-6">
    <PageTitle eyebrow="ADMINISTRATION · PUBLICATIONS" title="Rhapsody Studio">Prepare monthly English masters, allocate translation work, oversee proofreading and control publication outputs.</PageTitle>
    <Panel><h2 className="text-lg font-semibold">Monthly master preparation</h2><p className="mt-1 text-sm text-white/50">The admin workflow will take an edition from source files to an approved, immutable English master.</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">{workflow.map(([number, title, detail]) => <div key={number} className="rounded-xl border border-white/10 bg-white/[0.025] p-4"><span className="text-xs text-violet-300">{number}</span><h3 className="mt-2 font-medium">{title}</h3><p className="mt-2 text-sm leading-6 text-white/55">{detail}</p></div>)}</div>
      <div className="mt-5 rounded-xl border border-dashed border-violet-300/30 bg-violet-300/[0.04] p-5"><h3 className="font-medium">Source package</h3><p className="mt-2 text-sm leading-6 text-white/55">DOCX, XLIFF, or a mixed monthly package will be supported. Upload and extraction controls will be enabled when the secure ingestion API, storage and validation pipeline are in place; this page does not simulate a successful upload.</p></div>
    </Panel>
    <Panel><h2 className="text-lg font-semibold">Edition oversight</h2><div className="mt-4 grid gap-3 md:grid-cols-3"><div><p className="font-medium">Assignments</p><p className="mt-1 text-sm text-white/50">Assign a specific master version, target language, translator, reviewer and deadline.</p></div><div><p className="font-medium">Proofreading</p><p className="mt-1 text-sm text-white/50">Review submissions, comment at segment level and approve or return work.</p></div><div><p className="font-medium">Publishing</p><p className="mt-1 text-sm text-white/50">Run print preflight and export approved editions through either publishing engine.</p></div></div></Panel>
  </div>;
}
