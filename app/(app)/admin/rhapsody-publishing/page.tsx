"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { PageTitle } from "@/components/ui";
import { api, ApiError, type RhapsodyFont, type RhapsodyLanguageProfile, type RhapsodyAssignmentRow } from "@/lib/api";

const roles = ["body", "heading", "subheading", "scripture", "caption", "notes"] as const;
type FontRole = typeof roles[number];
const errText = (e: unknown) => e instanceof ApiError ? e.message : "Something went wrong. Please try again.";

export default function RhapsodyPublishingPage() {
  const [profiles, setProfiles] = useState<RhapsodyLanguageProfile[]>([]);
  const [fonts, setFonts] = useState<RhapsodyFont[]>([]);
  const [assignmentsList, setAssignmentsList] = useState<RhapsodyAssignmentRow[]>([]);
  const [proofAssignment, setProofAssignment] = useState("");
  const [validation, setValidation] = useState<{ status: string; sample_text: string; checks: { code: string; severity: string; message: string }[]; note: string } | null>(null);
  const [proof, setProof] = useState<Record<string, unknown> | null>(null);
  const [proofId, setProofId] = useState("");
  const [pdfReady, setPdfReady] = useState(false);
  const [selected, setSelected] = useState("");
  const [draft, setDraft] = useState<RhapsodyLanguageProfile | null>(null);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [fontForm, setFontForm] = useState({ family: "", style: "Regular", license_name: "", license_note: "" });
  const [fontFile, setFontFile] = useState<File | null>(null);

  const load = useCallback(async () => {
    const [p, f] = await Promise.all([api.rhapsodyPublishing.profiles(), api.rhapsodyPublishing.fonts()]);
    setProfiles(p); setFonts(f);
    setSelected((current) => current || p[0]?.language_code || "");
  }, []);
  useEffect(() => { void load().catch((e) => setNotice(errText(e))); }, [load]);
  useEffect(() => {
    const p = profiles.find((x) => x.language_code === selected) ?? null;
    setDraft(p);
    setAssignments(p ? Object.fromEntries(Object.entries(p.fonts).map(([k,v]) => [k,v.id])) : {});
  }, [profiles, selected]);

  async function save(e: FormEvent) {
    e.preventDefault(); if (!draft) return;
    setBusy(true);
    try {
      await api.rhapsodyPublishing.saveProfile(draft.language_code, {
        direction: draft.direction, locale: draft.locale, typography: draft.typography,
        localization: draft.localization, layout: draft.layout, fonts: assignments,
      });
      await load(); setNotice("Language publishing profile saved as a draft.");
    } catch (err) { setNotice(errText(err)); } finally { setBusy(false); }
  }
  async function validateProfile() {
    if (!draft) return; setBusy(true); setValidation(null);
    try { const result = await api.rhapsodyPublishing.validateProfile(draft.language_code); setValidation(result); await load(); setNotice(result.status === "validated" ? "Font coverage checks passed. Complex-script shaping still requires visual proof." : "Profile validation found issues to resolve."); }
    catch (err) { setNotice(errText(err)); } finally { setBusy(false); }
  }
  async function activateProfile() {
    if (!draft) return; setBusy(true);
    try { await api.rhapsodyPublishing.activateProfile(draft.language_code); await load(); setNotice("Language publishing profile activated."); }
    catch (err) { setNotice(errText(err)); } finally { setBusy(false); }
  }
  async function renderProofPdf() {
    if (!proofId) return; setBusy(true); setPdfReady(false);
    try { await api.rhapsodyPublishing.renderProofPdf(proofId); setPdfReady(true); setNotice("The reflowable PDF proof was generated and stored securely."); }
    catch (err) { setNotice(errText(err)); } finally { setBusy(false); }
  }
  async function generateProof() {
    if (!proofAssignment) return; setBusy(true); setProof(null);
    try { const result = await api.rhapsodyPublishing.createLayoutProof(proofAssignment); setProof(result.manifest); setProofId(result.id); setPdfReady(false); setNotice("Publishing preflight manifest generated. You can now render a reflowable proof PDF."); }
    catch (err) { setNotice(errText(err)); } finally { setBusy(false); }
  }

  async function upload(e: FormEvent) {
    e.preventDefault(); if (!fontFile) return;
    setBusy(true);
    try {
      const fd = new FormData(); fd.append("file", fontFile);
      Object.entries(fontForm).forEach(([k,v]) => fd.append(k,v));
      await api.rhapsodyPublishing.uploadFont(fd); setFontFile(null);
      setFontForm({ family: "", style: "Regular", license_name: "", license_note: "" });
      await load(); setNotice("Font uploaded to the managed library.");
    } catch (err) { setNotice(errText(err)); } finally { setBusy(false); }
  }
  async function removeFont(font: RhapsodyFont) {
    if (!window.confirm(`Delete ${font.family} ${font.style} from the font library?`)) return;
    try { await api.rhapsodyPublishing.deleteFont(font.id); await load(); setNotice("Font deleted."); }
    catch (err) { setNotice(errText(err)); }
  }

  return <div className="han-page space-y-6">
    <PageTitle eyebrow="Rhapsody Publishing" title="Language publishing profiles">
      Configure language-specific typography, writing direction and localization. Profiles are reused when HAN prepares each monthly edition.
    </PageTitle>
    {notice ? <div className="rounded-lg border border-line bg-surface p-3 text-sm" role="status">{notice}</div> : null}
    <section className="card space-y-4">
      <div><h2 className="text-lg font-semibold">Language profile</h2><p className="text-sm text-ink-muted">Choose a language to edit its publishing configuration.</p></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><label className="label" htmlFor="profile-language">Language</label>
          <select id="profile-language" className="input" value={selected} onChange={(e) => setSelected(e.target.value)}>
            {profiles.map(p => <option key={p.language_code} value={p.language_code}>{p.language_name} ({p.language_code})</option>)}
          </select></div>
        {draft ? <div><label className="label" htmlFor="profile-locale">Locale</label><input id="profile-locale" className="input" value={draft.locale} onChange={e => setDraft({...draft,locale:e.target.value})}/></div> : null}
      </div>
      {draft ? <form onSubmit={save} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className="label" htmlFor="profile-direction">Writing direction</label><select id="profile-direction" className="input" value={draft.direction} onChange={e=>setDraft({...draft,direction:e.target.value as "ltr"|"rtl"})}><option value="ltr">Left to right</option><option value="rtl">Right to left</option></select></div>
          <div><label className="label">Profile status</label><div className="input bg-surface-secondary">{draft.status} · version {draft.version}</div></div>
        </div>
        <div><h3 className="font-semibold">Typography assignments</h3><p className="text-xs text-ink-muted">Choose a registered font family for each content role.</p></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map(role => <div key={role}><label className="label capitalize" htmlFor={`font-${role}`}>{role.replace("_"," ")}</label>
            <select id={`font-${role}`} className="input" value={assignments[role] ?? ""} onChange={e=>setAssignments({...assignments,[role]:e.target.value})}>
              <option value="">Use publishing fallback</option>{fonts.map(f=><option key={f.id} value={f.id}>{f.family} · {f.style}</option>)}
            </select></div>)}
        </div>
        <div className="flex flex-wrap justify-end gap-2"><button className="btn btn-secondary" type="button" disabled={busy || !draft.id} onClick={()=>void validateProfile()}>Validate font coverage</button><button className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : "Save language profile"}</button><button className="btn btn-secondary" type="button" disabled={busy || draft.status !== "validated"} onClick={()=>void activateProfile()}>Activate profile</button></div>
      </form> : <p className="text-sm text-ink-muted">No active target languages are available.</p>}
      {validation ? <div className="rounded-lg border border-line p-3 space-y-2"><h3 className="font-semibold">Font validation · {validation.status}</h3><p className="text-sm">{validation.sample_text}</p>{validation.checks.length ? validation.checks.map((item,i)=><p key={i} className={item.severity === "error" ? "text-sm text-red-600" : "text-sm text-amber-600"}>{item.severity.toUpperCase()}: {item.message}</p>) : <p className="text-sm text-green-700">No missing characters found in the sample.</p>}<p className="text-xs text-ink-muted">{validation.note}</p></div> : null}

    </section>
    <section className="card space-y-4">
      <div><h2 className="text-lg font-semibold">Approved translation layout preflight</h2><p className="text-sm text-ink-muted">Generate a profile-bound layout manifest and a reflowable PDF proof for an approved translation.</p></div>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <select className="input" aria-label="Approved Rhapsody assignment" value={proofAssignment} onChange={e=>setProofAssignment(e.target.value)}>
          <option value="">Choose an approved translation</option>
          {assignmentsList.filter(a=>a.status === "approved" || a.status === "published").map(a=><option key={a.id} value={a.id}>{a.edition_title} · {a.target_language} · {a.status}</option>)}
        </select>
        <button type="button" className="btn btn-primary" disabled={busy || !proofAssignment} onClick={()=>void generateProof()}>Generate layout proof</button>
      </div>
      {proof ? <div className="rounded-lg border border-line p-3 space-y-2">
        <h3 className="font-semibold">Preflight result</h3>
        <p className="text-sm">Language: {String(proof.language)} · Direction: {String(proof.direction)} · Profile version: {String(proof.profile_version)}</p>
        <p className="text-sm">Estimated pages: {String((proof.pagination as Record<string, unknown> | undefined)?.estimated_pages ?? "—")}</p>
        <p className="text-xs text-ink-muted">Estimated pagination is a rough preflight. The PDF renderer performs actual text reflow and pagination; it is not yet an exact IDML style reproduction.</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary" disabled={busy || !proofId} onClick={()=>void renderProofPdf()}>Render proof PDF</button>
          {pdfReady ? <a className="btn btn-secondary" href={api.rhapsodyPublishing.proofPdfUrl(proofId)} target="_blank" rel="noreferrer">Open proof PDF</a> : null}
        </div>
      </div> : null}
    </section>
    <section className="card space-y-4">
      <div><h2 className="text-lg font-semibold">Managed font library</h2><p className="text-sm text-ink-muted">Upload licensed OTF, TTF, WOFF or WOFF2 files. Font binaries remain private to the publishing service.</p></div>
      <form onSubmit={upload} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div><label className="label" htmlFor="font-family">Font family</label><input id="font-family" className="input" required maxLength={200} value={fontForm.family} onChange={e=>setFontForm({...fontForm,family:e.target.value})}/></div>
        <div><label className="label" htmlFor="font-style">Style</label><input id="font-style" className="input" value={fontForm.style} onChange={e=>setFontForm({...fontForm,style:e.target.value})}/></div>
        <div><label className="label" htmlFor="font-license">Licence</label><input id="font-license" className="input" required value={fontForm.license_name} onChange={e=>setFontForm({...fontForm,license_name:e.target.value})}/></div>
        <div className="sm:col-span-2"><label className="label" htmlFor="font-license-note">Licence notes (optional)</label><input id="font-license-note" className="input" value={fontForm.license_note} onChange={e=>setFontForm({...fontForm,license_note:e.target.value})}/></div>
        <div><label className="label" htmlFor="font-file">Font file</label><input id="font-file" className="input" type="file" accept=".otf,.ttf,.woff,.woff2" required onChange={e=>setFontFile(e.target.files?.[0] ?? null)}/></div>
        <div className="sm:col-span-2 lg:col-span-3"><button className="btn btn-primary" disabled={busy || !fontFile}>{busy ? "Working…" : "Upload font"}</button></div>
      </form>
      {fonts.length ? <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-line text-xs uppercase text-ink-muted"><th className="py-2">Family</th><th>Style</th><th>Format</th><th>Licence</th><th/></tr></thead><tbody>
        {fonts.map(f=><tr key={f.id} className="border-b border-line"><td className="py-3 font-semibold">{f.family}</td><td>{f.style}</td><td>{f.format.toUpperCase()}</td><td>{f.license_name}</td><td className="text-right"><button type="button" className="btn btn-secondary min-h-[32px] px-3" onClick={()=>void removeFont(f)}>Delete</button></td></tr>)}
      </tbody></table></div> : <p className="text-sm text-ink-muted">No fonts have been uploaded yet.</p>}
    </section>
    <p className="text-xs text-ink-muted">Font coverage validation checks sample characters. The PDF proof uses WeasyPrint/Pango for reflow and pagination; exact IDML style-token mapping, complex-script visual QA and print-production approval remain outstanding.</p>
  </div>;
}
