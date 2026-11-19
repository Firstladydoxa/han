import { PageTitle, Panel } from "@/components/ui";

const workflow = [
  ["01", "Upload manuscript", "Accept the monthly Word manuscript and/or supplied XLIFF. Record edition, source version and rights metadata."],
  ["02", "Extract and structure", "Identify front matter, daily articles, prayers, reading plans and special sections while retaining order and inline formatting."],
  ["03", "Review the master", "Inspect extracted sections, missing content, tags, day sequence and layout warnings before activation."],
  ["04", "Activate edition", "Publish an immutable, versioned English master for translator assignments."],
];

export default function RhapsodyAdminPage() {
  return <div className="space-y-6">
    <PageTitle eyebrow="ADMINISTRATION · PUBLICATIONS" title="Rhapsody Studio" description="Prepare monthly English masters, allocate translation work, oversee proofreading and control publication outputs." />
    <div className="grid gap-4 md:grid-cols-3">
      <Panel><p className="text-sm text-white/50">Current edition</p><p className="mt-2 text-2xl font-semibold">November 2026</p><p className="mt-1 text-xs text-amber-200/80">Draft · not activated</p></Panel>
      <Panel><p className="text-sm text-white/50">Master validation</p><p className="mt-2 text-2xl font-semibold">Not run</p><p className="mt-1 text-xs text-white/45">Validation runs after document ingestion.</p></Panel>
      <Panel><p className="text-sm text-white/50">Publication engines</p><p className="mt-2 text-2xl font-semibold">Dual output</p><p className="mt-1 text-xs text-white/45">InDesign-compatible and modern publishing.</p></Panel>
    </div>
    <Panel><h2 className="text-lg font-semibold">Monthly master workflow</h2><p className="mt-1 text-sm text-white/50">A controlled process from source upload to active master.</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">{workflow.map(([number, title, detail]) => <div key={number} className="rounded-xl border border-white/10 bg-white/[0.025] p-4"><span className="text-xs text-violet-300">{number}</span><h3 className="mt-2 font-medium">{title}</h3><p className="mt-2 text-sm leading-6 text-white/55">{detail}</p></div>)}</div>
      <div className="mt-5 rounded-xl border border-dashed border-violet-300/30 bg-violet-300/[0.04] p-5"><h3 className="font-medium">Manuscript ingestion</h3><p className="mt-2 text-sm leading-6 text-white/55">Upload and extraction must be backed by secure file storage, DOCX/XLIFF parsing, validation, audit events and versioned database records. This screen does not present a fake upload or activation action.</p><p className="mt-3 text-xs text-white/40">Supported source plan: DOCX, XLIFF, or a mixed monthly package.</p></div>
    </Panel>
    <Panel><h2 className="text-lg font-semibold">After master activation</h2><div className="mt-4 grid gap-3 md:grid-cols-3"><div><p className="font-medium">Assignments</p><p className="mt-1 text-sm text-white/50">Choose target languages, translators and deadlines against a specific master version.</p></div><div><p className="font-medium">Proofreading</p><p className="mt-1 text-sm text-white/50">Review submitted language editions, resolve paragraph comments and approve or return work.</p></div><div><p className="font-medium">Publishing</p><p className="mt-1 text-sm text-white/50">Run layout preflight and export approved editions to the selected publishing engine.</p></div></div></Panel>
  </div>;
}
