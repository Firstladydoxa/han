import type { ReactNode } from "react";
import { PageTitle } from "@/components/ui";

function Panel({ children }: { children: ReactNode }) { return <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-xl shadow-black/10">{children}</section>; }

export default function RhapsodyHomePage() {
  return <div className="space-y-6">
    <PageTitle eyebrow="TNI PUBLICATION WORKSPACE" title="Rhapsody of Realities">Monthly devotional translation with HAN-assisted drafting, paragraph-level human review and controlled publishing.</PageTitle>
    <div className="grid gap-4 md:grid-cols-3">
      <Panel><p className="text-sm text-white/55">Monthly master</p><p className="mt-2 text-xl font-semibold">Awaiting publication data</p><p className="mt-1 text-xs text-white/45">Your active English master will appear here after admin activation.</p></Panel>
      <Panel><p className="text-sm text-white/55">Translation assignments</p><p className="mt-2 text-xl font-semibold">No assignments loaded</p><p className="mt-1 text-xs text-white/45">Assignments will be listed here when allocated to you.</p></Panel>
      <Panel><p className="text-sm text-white/55">Review principle</p><p className="mt-2 text-xl font-semibold">AI drafts. You decide.</p><p className="mt-1 text-xs text-white/45">HAN suggestions never replace translator approval.</p></Panel>
    </div>
    <Panel><h2 className="text-lg font-semibold">Your monthly editions</h2><p className="mt-1 text-sm text-white/50">Assigned editions, target languages, deadlines and completion progress will appear here.</p><div className="mt-5 rounded-xl border border-dashed border-white/15 p-8 text-center"><p className="font-medium">No active Rhapsody assignments</p><p className="mt-2 text-sm text-white/45">When an administrator assigns an edition to you, open it here to translate article by article and paragraph by paragraph.</p></div></Panel>
    <Panel><h2 className="text-lg font-semibold">How the workflow works</h2><div className="mt-4 grid gap-4 md:grid-cols-4">{["Admin prepares English master", "Admin reviews and activates", "Translator drafts and edits", "Admin proofreads and publishes"].map((step, i) => <div key={step} className="rounded-xl border border-white/10 bg-white/[0.025] p-4"><span className="text-xs text-violet-300">STEP 0{i+1}</span><p className="mt-2 text-sm">{step}</p></div>)}</div></Panel>
  </div>;
}
