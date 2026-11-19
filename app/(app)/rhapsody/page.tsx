"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, type RhapsodyAssignment } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Alert, PageTitle, Spinner } from "@/components/ui";
function Panel({children}:{children:React.ReactNode}){return <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">{children}</section>;}
export default function RhapsodyHomePage(){
 const {user,loading}=useAuth();const [items,setItems]=useState<RhapsodyAssignment[]>([]);const [busy,setBusy]=useState(true);const [error,setError]=useState("");
 useEffect(()=>{if(!user)return;api.rhapsody.assignments().then(setItems).catch(e=>setError(e instanceof Error?e.message:"Could not load assignments.")).finally(()=>setBusy(false));},[user]);
 if(loading)return <Spinner label="Loading Rhapsody workspace"/>;
 return <div className="space-y-6"><PageTitle eyebrow="TNI PUBLICATION WORKSPACE" title="Rhapsody of Realities">Monthly devotional translation with HAN-assisted drafting, paragraph-level human review and controlled publishing.</PageTitle>
 {error?<Alert kind="error">{error}</Alert>:null}
 <div className="grid gap-4 md:grid-cols-3"><Panel><p className="text-sm text-white/55">Your assignments</p><p className="mt-2 text-2xl font-semibold">{items.length}</p><p className="mt-1 text-xs text-white/45">Monthly editions allocated to your account.</p></Panel><Panel><p className="text-sm text-white/55">Human review</p><p className="mt-2 text-xl font-semibold">Always required</p><p className="mt-1 text-xs text-white/45">HAN suggestions never replace translator approval.</p></Panel><Panel><p className="text-sm text-white/55">Publication principle</p><p className="mt-2 text-xl font-semibold">AI drafts. You decide.</p></Panel></div>
 <Panel><h2 className="text-lg font-semibold">Monthly translation assignments</h2><p className="mt-1 text-sm text-white/50">Open an assignment to translate article by article and paragraph by paragraph.</p>
 {busy?<div className="py-8"><Spinner label="Loading assignments"/></div>:items.length===0?<div className="mt-5 rounded-xl border border-dashed border-white/15 p-8 text-center"><p className="font-medium">No Rhapsody assignments yet</p><p className="mt-2 text-sm text-white/45">When an administrator assigns a monthly edition to you, it will appear here.</p></div>:<div className="mt-4 divide-y divide-white/10">{items.map(a=><div key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-medium">{a.edition_title??"Rhapsody edition"}</p><p className="mt-1 text-xs text-white/45">Target language: {a.target_language} · Status: {a.status}{a.due_at ? " · Due "+new Date(a.due_at).toLocaleDateString() : ""}</p></div><Link className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-semibold text-white" href={"/rhapsody/"+a.id}>Open edition</Link></div>)}</div>}</Panel>
 <Panel><h2 className="text-lg font-semibold">Translation workflow</h2><div className="mt-4 grid gap-4 md:grid-cols-4">{["Admin prepares English master","Admin reviews and activates","Translator drafts and edits","Admin proofreads and publishes"].map((step,i)=><div key={step} className="rounded-xl border border-white/10 bg-white/[0.025] p-4"><span className="text-xs text-violet-300">STEP 0{i+1}</span><p className="mt-2 text-sm">{step}</p></div>)}</div></Panel></div>;
}
