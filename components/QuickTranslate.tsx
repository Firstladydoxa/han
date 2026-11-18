"use client";

import { useMemo, useState, type FormEvent } from "react";
import { api, ApiError, type Direction, type ProjectDetail, type TranslateResponse } from "@/lib/api";
import { TIER_LABEL } from "@/lib/labels";
import { Alert } from "./ui";
import { ReviewPanel } from "./ReviewPanel";

export const usableDirections = (project: ProjectDetail): Direction[] => project.language_directions.filter((d) => d.readiness_tier !== "unsupported");
export const pairKey = (d: Pick<Direction, "source_code" | "target_code">) => `${d.source_code}>${d.target_code}`;

export function QuickTranslate({ project, names, onOpenWorkspace }: { project: ProjectDetail; names: Record<string, string>; onOpenWorkspace: (translationId: string) => void }) {
  const directions = useMemo(() => usableDirections(project), [project]);
  const [pair, setPair] = useState(directions[0] ? pairKey(directions[0]) : "");
  const [text, setText] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState<TranslateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const label = (c: string) => names[c] ?? c.toUpperCase();

  async function submit(e: FormEvent) {
    e.preventDefault();
    const [source, target] = pair.split(">");
    if (!source || !target || !text.trim()) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      setResult(await api.translate({ project_id: project.id, source_language: source, target_language: target, text, context: context.trim() || undefined }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "I'm sorry, I couldn't complete the translation at the moment. Please try again shortly.");
    } finally {
      setBusy(false);
    }
  }

  if (directions.length === 0) {
    return <Alert kind="info">No language pairs are available for this project yet. Please contact your TNI administrator.</Alert>;
  }

  return (
    <div className="card space-y-4">
      <h2 className="text-lg font-semibold">Quick translation</h2>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="label" htmlFor="qt-pair">Language pair</label>
          <select id="qt-pair" className="input" value={pair} onChange={(e) => setPair(e.target.value)}>
            {directions.map((d) => (
              <option key={pairKey(d)} value={pairKey(d)}>{label(d.source_code)} → {label(d.target_code)} ({TIER_LABEL[d.readiness_tier]})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="qt-text">Text to translate</label>
          <textarea id="qt-text" className="input min-h-[120px]" maxLength={4000} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste or type the text…" />
          <p className="mt-1 text-right text-xs text-ink-muted">{text.length.toLocaleString()} / 4,000</p>
        </div>
        <div>
          <label className="label" htmlFor="qt-context">Context (optional)</label>
          <input id="qt-context" className="input" maxLength={5000} value={context} onChange={(e) => setContext(e.target.value)} placeholder="Audience, purpose or preferred tone" />
        </div>
        <button className="btn btn-primary" type="submit" disabled={busy || !text.trim()}>{busy ? "Preparing draft…" : "Prepare draft"}</button>
      </form>
      {error ? <Alert>{error}</Alert> : null}
      {result ? (
        <div className="space-y-3 border-t border-line pt-4">
          <Alert kind="success">{result.message}</Alert>
          <ReviewPanel key={result.translation_id} translationId={result.translation_id} canApprove={project.can_approve} onOpenWorkspace={() => onOpenWorkspace(result.translation_id)}
            context={{ warnings: result.warnings, tm_matches: result.tm_matches, terminology: result.terminology, review_note: result.review_note }} />
        </div>
      ) : null}
    </div>
  );
}
