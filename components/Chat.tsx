"use client";

import { useRef, useState, type FormEvent } from "react";
import { api, ApiError, type ChatResponse, type ProjectDetail } from "@/lib/api";
import { Alert } from "./ui";
import { ReviewPanel } from "./ReviewPanel";

interface Msg { id: number; from: "you" | "han"; text: string; response?: ChatResponse }

const EXAMPLES = [
  "Translate this text from English to German: Thank you for your patience.",
  "Which language pairs can you help with?",
];

const GREETING = "Hello, I'm HAN. I can prepare translation drafts for your review, check them against approved terminology and your project's Translation Memory, and help you revise them.";

export function Chat({ project, onOpenWorkspace }: { project: ProjectDetail; onOpenWorkspace: (translationId: string) => void }) {
  const [messages, setMessages] = useState<Msg[]>([{ id: 0, from: "han", text: GREETING }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const conversation = useRef<string | undefined>(undefined);
  const seq = useRef(1);
  const bottom = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    setError(null);
    setBusy(true);
    setMessages((m) => [...m, { id: seq.current++, from: "you", text: message }]);
    setInput("");
    try {
      const r = await api.chat({ project_id: project.id, message, conversation_id: conversation.current });
      conversation.current = r.conversation_id;
      setMessages((m) => [...m, { id: seq.current++, from: "han", text: r.reply, response: r }]);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "I'm sorry, I couldn't complete the translation at the moment. Please try again shortly.");
    } finally {
      setBusy(false);
      setTimeout(() => bottom.current?.scrollIntoView?.({ behavior: "smooth", block: "end" }), 50);
    }
  }

  const submit = (e: FormEvent) => { e.preventDefault(); void send(input); };

  return (
    <div className="card flex flex-col gap-4">
      <ol aria-label="Conversation with HAN" className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
        {messages.map((m) => (
          <li key={m.id} className={m.from === "you" ? "flex justify-end" : "flex justify-start"}>
            <div className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm ${m.from === "you" ? "bg-brand text-white" : "border border-line bg-wash"}`}>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wide opacity-70">{m.from === "you" ? "You" : "HAN"}</p>
              {m.response?.translation ? (
                <>
                  <p>Here is my suggested translation:</p>
                  <div className="mt-3 rounded-xl bg-white p-4 text-ink">
                    <ReviewPanel translationId={m.response.translation.translation_id} canApprove={project.can_approve}
                      context={{ warnings: m.response.translation.warnings, tm_matches: m.response.translation.tm_matches,
                        terminology: m.response.translation.terminology, review_note: m.response.translation.review_note }}
                      onOpenWorkspace={() => onOpenWorkspace(m.response!.translation!.translation_id)} />
                  </div>
                  <p className="mt-3">Please review it and make any corrections before approving it.</p>
                </>
              ) : (
                <p className="whitespace-pre-wrap">{m.text}</p>
              )}
            </div>
          </li>
        ))}
        <div ref={bottom} />
      </ol>
      {error ? <Alert>{error}</Alert> : null}
      <div className="flex flex-wrap gap-2" aria-label="Example requests">
        {EXAMPLES.map((ex) => (
          <button key={ex} type="button" className="rounded-full border border-line bg-white px-3 py-1 text-xs text-ink-soft hover:bg-wash" onClick={() => setInput(ex)}>{ex}</button>
        ))}
      </div>
      <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="chat-input">Message to HAN</label>
        <textarea id="chat-input" className="input min-h-[64px] flex-1 resize-y" placeholder="Ask HAN to translate something…" value={input}
          maxLength={20000} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); void send(input); } }} />
        <button type="submit" className="btn btn-primary sm:self-end" disabled={busy || !input.trim()}>{busy ? "HAN is working…" : "Send"}</button>
      </form>
      <p className="text-xs text-ink-muted">Press Ctrl/⌘ + Enter to send. HAN prepares drafts only; you decide what is approved.</p>
    </div>
  );
}
