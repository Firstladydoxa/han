import { PageTitle } from "@/components/ui";

function Panel({ children }: { children: React.ReactNode }) { return <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-xl shadow-black/10">{children}</section>; }

const editions = [
  { month: "November 2026", status: "Master awaiting activation", languages: 0, days: 30 },
  { month: "October 2026", status: "Archive", languages: 8, days: 31 },
];

export default function RhapsodyHomePage() {
  return <div className="space-y-6">
    <PageTitle eyebrow="TNI PUBLICATION WORKSPACE" title="Rhapsody of Realities" >Translate each monthly edition with HAN-assisted drafting, paragraph-level human review and a controlled publishing workflow.</PageTitle>
    <div className="grid gap-4 md:grid-cols-3">
      <Panel><p className="text-sm text-white/55">Active monthly master</p><p className="mt-2 text-2xl font-semibold">Not activated</p><p className="mt-1 text-xs text-white/45">An administrator must review and activate the English master.</p></Panel>
      <Panel><p className="text-sm text-white/55">Your assignments</p><p className="mt-2 text-2xl font-semibold">0 active</p><p className="mt-1 text-xs text-white/45">Assignments appear here when allocated.</p></Panel>
      <Panel><p className="text-sm text-white/55">Workflow principle</p><p className="mt-2 text-xl font-semibold">AI drafts. You decide.</p><p className="mt-1 text-xs text-white/45">Every translation remains under human control.</p></Panel>
    </div>
    <Panel><h2 className="text-lg font-semibold">Monthly editions</h2><p className="mt-1 text-sm text-white/50">Your assigned editions and publication status.</p>
      <div className="mt-5 divide-y divide-white/10">{editions.map((item) => <div key={item.month} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-medium">{item.month}</p><p className="mt-1 text-xs text-white/45">{item.days} daily articles · {item.languages} language assignments</p></div><span className="text-sm text-white/55">{item.status}</span></div>)}</div>
    </Panel>
    <Panel><h2 className="text-lg font-semibold">How the Rhapsody workflow works</h2><div className="mt-4 grid gap-4 md:grid-cols-4">{["Admin prepares English master", "Admin reviews and activates", "Translator drafts and edits", "Admin proofreads and publishes"].map((step, i) => <div key={step} className="rounded-xl border border-white/10 bg-white/[0.025] p-4"><span className="text-xs text-violet-300">STEP 0{i+1}</span><p className="mt-2 text-sm">{step}</p></div>)}</div></Panel>
    <p className="text-xs text-white/40">Monthly editions and assignments will be loaded from the Rhapsody service. No translation is final until it has passed the required human review.</p>
  </div>;
}
