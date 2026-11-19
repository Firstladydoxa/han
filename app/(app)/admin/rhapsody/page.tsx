"use client";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { api, type AdminUser, type Language, type RhapsodyEdition } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Alert, PageTitle, Spinner } from "@/components/ui";
function Panel({ children }: { children: React.ReactNode }) { return <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-xl shadow-black/10">{children}</section>; }
const field = "mt-1 w-full rounded-lg border border-white/15 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none focus:border-violet-300";
const button = "rounded-lg bg-violet-500 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-40";
export default function RhapsodyAdminPage() {
  const { user, loading } = useAuth();
  const [editions,setEditions]=useState<RhapsodyEdition[]>([]), [users,setUsers]=useState<AdminUser[]>([]), [languages,setLanguages]=useState<Language[]>([]);
  const [selectedEdition,setSelectedEdition]=useState(""), [month,setMonth]=useState(String(new Date().getMonth()+1)), [year,setYear]=useState(String(new Date().getFullYear()));
  const [file,setFile]=useState<File|null>(null), [targetLanguage,setTargetLanguage]=useState(""), [translatorId,setTranslatorId]=useState(""), [reviewerId,setReviewerId]=useState(""), [dueDate,setDueDate]=useState("");
  const [busy,setBusy]=useState(false), [error,setError]=useState(""), [notice,setNotice]=useState("");
  const refresh=useCallback(async()=>{const rows=await api.rhapsody.editions();setEditions(rows);setSelectedEdition(old=>old&&rows.some(e=>e.id===old)?old:rows[0]?.id??"");},[]);
  useEffect(()=>{if(!user||!["tni_admin","technical_admin"].includes(user.role))return;Promise.all([refresh(),api.admin.users(),api.languages()]).then(([,u,l])=>{setUsers(u);setLanguages(l);}).catch((e:unknown)=>setError(e instanceof Error?e.message:"Could not load Rhapsody administration data."));},[user,refresh]);
  const selected=editions.find(e=>e.id===selectedEdition);
  const activeMaster=useMemo(()=>selected?.master_versions.find(m=>m.id===selected.active_master_version_id),[selected]);
  const translators=users.filter(u=>u.role==="translator"&&u.status==="active"), reviewers=users.filter(u=>["reviewer","tni_admin","technical_admin"].includes(u.role)&&u.status==="active");
  async function createEdition(event:FormEvent){event.preventDefault();setBusy(true);setError("");setNotice("");try{const row=await api.rhapsody.createEdition({month:Number(month),year:Number(year)});await refresh();setSelectedEdition(row.id);setNotice("Monthly edition created.");}catch(e){setError(e instanceof Error?e.message:"Could not create the edition.");}finally{setBusy(false);}}
  async function uploadAndIngest(event:FormEvent){event.preventDefault();if(!selectedEdition||!file)return;setBusy(true);setError("");setNotice("");try{const source=await api.rhapsody.uploadSource(selectedEdition,file);const master=await api.rhapsody.ingest(selectedEdition,source.id);setNotice(`Source processed. Master version ${master.version_number} contains ${master.validation.segment_count??0} segments in ${master.validation.section_count??0} sections.`);setFile(null);await refresh();}catch(e){setError(e instanceof Error?e.message:"Upload or document extraction failed.");}finally{setBusy(false);}}
  async function activate(masterId:string){if(!selectedEdition)return;setBusy(true);setError("");setNotice("");try{await api.rhapsody.activate(selectedEdition,masterId);await refresh();setNotice("English master activated. New assignments can now use this version.");}catch(e){setError(e instanceof Error?e.message:"Could not activate the master.");}finally{setBusy(false);}}
  async function assign(event:FormEvent){event.preventDefault();if(!activeMaster||!translatorId||!targetLanguage)return;setBusy(true);setError("");setNotice("");try{await api.rhapsody.createAssignment({master_version_id:activeMaster.id,target_language:targetLanguage,translator_id:translatorId,reviewer_id:reviewerId||undefined,due_at:dueDate?new Date(dueDate).toISOString():undefined});setNotice("Translation assignment created.");}catch(e){setError(e instanceof Error?e.message:"Could not create the assignment.");}finally{setBusy(false);}}
  if(loading)return <Spinner label="Checking publication permissions"/>;
  if(!user||!["tni_admin","technical_admin"].includes(user.role))return <Panel><h1 className="text-lg font-semibold">Access restricted</h1><p className="mt-2 text-sm text-white/55">Rhapsody Studio is available to authorised HAN administrators.</p></Panel>;
  return <div className="space-y-6">
    <PageTitle eyebrow="ADMINISTRATION · PUBLICATIONS" title="Rhapsody Studio">Create monthly English masters, prepare translator assignments and oversee proofreading and publishing.</PageTitle>
    {error?<Alert kind="error">{error}</Alert>:null}{notice?<Alert kind="success">{notice}</Alert>:null}
    <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
      <Panel><h2 className="text-lg font-semibold">Create monthly edition</h2><form onSubmit={createEdition} className="mt-4 space-y-3">
        <label className="block text-sm">Month<select className={field} value={month} onChange={e=>setMonth(e.target.value)}>{Array.from({length:12},(_,i)=><option key={i+1} value={i+1}>{new Date(2000,i,1).toLocaleString("en",{month:"long"})}</option>)}</select></label>
        <label className="block text-sm">Year<input className={field} type="number" min="2000" max="2200" value={year} onChange={e=>setYear(e.target.value)}/></label><button className={button} disabled={busy}>Create edition</button>
      </form></Panel>
      <Panel><h2 className="text-lg font-semibold">Monthly editions</h2><select className={field} value={selectedEdition} onChange={e=>setSelectedEdition(e.target.value)}><option value="">Select an edition</option>{editions.map(e=><option key={e.id} value={e.id}>{e.title} · {e.status}</option>)}</select>
        {selected?<div className="mt-4 space-y-3"><div className="text-sm font-medium">{selected.title} <span className="ml-2 text-xs text-white/45">{selected.sources.length} source(s)</span></div>
          {selected.master_versions.map(m=><div key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 p-3"><div><p className="text-sm font-medium">Master v{m.version_number}</p><p className="text-xs text-white/45">{m.section_count} sections · {m.segment_count} segments</p></div>{selected.active_master_version_id===m.id?<span className="text-xs text-emerald-300">Active master</span>:<button className={button} disabled={busy||!!selected.active_master_version_id} onClick={()=>activate(m.id)}>Activate</button>}</div>)}
        </div>:null}
      </Panel>
    </div>
    <Panel><h2 className="text-lg font-semibold">Upload monthly source</h2><p className="mt-1 text-sm text-white/50">DOCX or XLIFF. HAN extracts paragraphs or translation units and preserves source identifiers and inline XLIFF markup.</p>
      <form onSubmit={uploadAndIngest} className="mt-4 flex flex-wrap items-end gap-3"><label className="min-w-[240px] flex-1 text-sm">Source document<input className={field} type="file" accept=".docx,.xlf,.xliff" onChange={e=>setFile(e.target.files?.[0]??null)}/></label><button className={button} disabled={busy||!selectedEdition||!file}>{busy?"Processing…":"Upload and extract"}</button></form>
      <p className="mt-3 text-xs text-white/40">Maximum 25 MB per file. The current ingestion endpoint processes each source file as a separate master version; paired DOCX/XLIFF reconciliation is still to be implemented.</p>
    </Panel>
    <Panel><h2 className="text-lg font-semibold">Create translation assignment</h2><p className="mt-1 text-sm text-white/50">Assignments are bound to the active master version.</p>
      {activeMaster?<form onSubmit={assign} className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="text-sm">Target language<select className={field} value={targetLanguage} onChange={e=>setTargetLanguage(e.target.value)}><option value="">Select language</option>{languages.map(l=><option key={l.code} value={l.code}>{l.display_name} ({l.code})</option>)}</select></label>
        <label className="text-sm">Translator<select className={field} value={translatorId} onChange={e=>setTranslatorId(e.target.value)}><option value="">Select translator</option>{translators.map(u=><option key={u.id} value={u.id}>{u.display_name} · {u.email}</option>)}</select></label>
        <label className="text-sm">Reviewer (optional)<select className={field} value={reviewerId} onChange={e=>setReviewerId(e.target.value)}><option value="">Assign later</option>{reviewers.map(u=><option key={u.id} value={u.id}>{u.display_name}</option>)}</select></label>
        <label className="text-sm">Due date<input className={field} type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)}/></label>
        <div className="md:col-span-2"><button className={button} disabled={busy||!translatorId||!targetLanguage}>Create assignment</button></div>
      </form>:<p className="mt-4 rounded-lg border border-dashed border-white/15 p-4 text-sm text-white/45">Activate an English master to enable language assignments.</p>}
    </Panel>
  </div>;
}
