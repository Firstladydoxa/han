import type { Warning } from "@/lib/api";

const TYPE_LABEL: Record<Warning["type"], string> = {
  number: "Numbers", terminology: "Terminology", name: "Names", consistency: "Consistency", format: "Formatting", readiness: "Language pair",
};

/** Renders only the whitelisted warning fields (type, severity, message). */
export function Warnings({ warnings, emptyText }: { warnings: Warning[]; emptyText?: string }) {
  if (warnings.length === 0) {
    return <p className="text-xs text-emerald-800">{emptyText ?? "No basic issues found. Please still review meaning, tone and context."}</p>;
  }
  return (
    <ul className="space-y-1.5 text-xs">
      {warnings.map((w, i) => (
        <li key={`${w.type}-${i}`} className={`rounded-md px-2.5 py-1.5 ${w.severity === "warning" ? "bg-amber-50 text-amber-900" : "bg-sky-50 text-sky-900"}`}>
          <span className="font-bold">{TYPE_LABEL[w.type] ?? w.type}: </span>
          {w.message}
        </li>
      ))}
    </ul>
  );
}
