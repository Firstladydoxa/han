"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, type RhapsodyAssignmentDetail, type RhapsodyAssignmentSegment } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Alert, PageTitle, Spinner } from "@/components/ui";

const button="rounded-lg bg-violet-500 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-400 disabled:opacity-40";
const panel="rounded-2xl border border-white/10 bg-white/[0.035] p-5";
export default function RhapsodyAssignmentPage(){
 const params=useParams<{assignmentId:string}>();const id=params.assignmentId;const {user,loading}=useAuth();
 const [data,setData]=useState<RhapsodyAssignmentDetail|null>(null);const [segments,setSegments]=useState<RhapsodyAssignmentSegment[]>([]);
 const [busy,setBusy]=useState(true);const [saving,setSaving]=useState<string|null>(null);const [error,setError]=useState("");const [notice,setNotice]=useState("");const [reviewNote,setReviewNote]=useState("");
 const load=useCallback(async()=>{const result=await api.rhapsody.assignment(id);setData(result);setSegments(result.segments);},[id]);
 useEffect(()=>{if(!user)return;load().catch(e=>setError(e instanceof Error?e.message:"Could not load this assignment.")).finally(()=>setBusy(false));},[user,load]);
 function change(segmentId:string,target_text:string){setSegments(old=>old.map(s=>s.id===segmentId?{...s,target_text}:s));}
 async function save(segment:RhapsodyAssignmentSegment){setSaving(segment.id);setError("");setNotice("");try{const result=await api.rhapsody.saveSegment(id,segment.id,{target_text:segment.target_text,expected_version_id:segment.current_version_id??undefined});setSegments(old=>old.map(s=>s.id===segment.id?{...s,current_version_id:result.version_id,version_number:result.version_number,translation_status:"draft"}:s));setNotice("Paragraph saved.");}catch(e){setError(e instanceof Error?e.message:"Could not save paragraph.");}finally{setSaving(null);}}
 async function submit(){setSaving("submit");setError("");try{await api.rhapsody.submit(id);await load();setNotice("Translation submitted for proofreading.");}catch(e){setError(e instanceof Error?e.message:"Could not submit translation.");}finally{setSaving(null);}}
 async function review(decision:"approved"|"changes_requested"){setSaving("review");setError("");try{await api.rhapsody.review(id,decision,reviewNote||undefined);await load();setNotice(decision==="approved"?"Translation approved.":"Changes requested from translator.");}catch(e){setError(e instanceof Error?e.message:"Review action failed.");}finally{setSaving(null);}}
 if(loading||busy)return <Spinner label="Loading Rhapsody assignment"/>;
 if(!data)return <Alert kind="error">{error||"Assignment unavailable."}</Alert>;
 const canEdit=!!user&&(user.role==="translator"||user.role==="tni_admin"||user.role==="technical_admin")&&["assigned","in_progress","changes_requested"].includes(data.status);
 const canReview=!!user&&(user.role==="reviewer"||user.role==="tni_admin"||user.role==="technical_admin")&&data.status==="submitted";
 const completed=segments.filter(s=>!!s.current_version_id).length;
 return <div className="space-y-5">
  <PageTitle eyebrow="RHAPSODY TRANSLATION" title={data.edition.title}>{data.target_language} · {data.status.replaceAll("_"," ")}</PageTitle>
  {error?<Alert kind="error">{error}</Alert>:null}{notice?<Alert kind="success">{notice}</Alert>:null}
  <div className={panel}><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold">{data.edition.title}</p><p className="mt-1 text-xs text-white/50">English source · {data.target_language} target · Master version locked to this assignment</p></div><p className="text-sm text-white/65">{completed} / {segments.length} paragraphs saved</p></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-violet-400" style={{width:segments.length?String(completed/segments.length*100)+"%":"0%"}}/></div></div>
  {data.sections.map(section=><section key={section.id} className="space-y-3"><div className="border-b border-white/10 pb-2"><p className="text-xs uppercase tracking-wider text-violet-300">{section.type.replaceAll("_"," ")}{section.day_number? " · Day "+section.day_number:""}</p><h2 className="text-lg font-semibold">{section.title??section.stable_key}</h2></div>
   {segments.filter(s=>s.section_id===section.id).map(segment=><article key={segment.id} className={panel}>
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><span className="text-xs text-white/40">Paragraph {segment.sequence+1} · {segment.translation_status.replaceAll("_"," ")}</span>{segment.version_number?<span className="text-xs text-white/40">Saved version {segment.version_number}</span>:null}</div>
    <div className="grid gap-4 lg:grid-cols-2"><div><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/45">English source · read only</p><div className="min-h-28 whitespace-pre-wrap rounded-lg border border-white/10 bg-black/15 p-3 text-sm leading-7 text-white/80">{segment.source_text}</div></div>
     <div><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-violet-200">Translation · {data.target_language}</p>{canEdit?<textarea className="min-h-28 w-full rounded-lg border border-white/15 bg-slate-950/60 p-3 text-sm leading-7 text-white outline-none focus:border-violet-300" value={segment.target_text} onChange={e=>change(segment.id,e.target.value)} placeholder="Enter or edit the translated paragraph…"/>:<div className="min-h-28 whitespace-pre-wrap rounded-lg border border-white/10 bg-black/15 p-3 text-sm leading-7 text-white/80">{segment.target_text||"No translation saved for this paragraph."}</div>}</div></div>
    {canEdit?<div className="mt-3 flex justify-end"><button className={button} disabled={saving===segment.id||!segment.target_text.trim()} onClick={()=>save(segment)}>{saving===segment.id?"Saving…":"Save paragraph"}</button></div>:null}
   </article>)}
  </section>)}
  {canEdit?<div className={panel}><p className="mb-3 text-sm text-white/55">Save every paragraph before submitting the edition for human proofreading.</p><button className={button} disabled={saving!==null||completed!==segments.length||segments.length===0} onClick={submit}>{saving==="submit"?"Submitting…":"Submit translation for review"}</button></div>:null}
  {canReview?<div className={panel}><h2 className="font-semibold">Admin proofreading decision</h2><textarea className="mt-3 min-h-24 w-full rounded-lg border border-white/15 bg-slate-950/60 p-3 text-sm text-white" value={reviewNote} onChange={e=>setReviewNote(e.target.value)} placeholder="Review comments for the translator (optional)…"/><div className="mt-3 flex flex-wrap gap-3"><button className={button} disabled={saving!==null} onClick={()=>review("approved")}>Approve translation</button><button className="rounded-lg border border-amber-300/40 px-4 py-2 text-sm font-semibold text-amber-100 disabled:opacity-40" disabled={saving!==null} onClick={()=>review("changes_requested")}>Request changes</button></div></div>:null}
 </div>;
}
