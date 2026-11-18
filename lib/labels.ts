import type { SegmentStatus, Tier, Version } from "./api";

export const STATUS_LABEL: Record<SegmentStatus, string> = {
  not_started: "Not started",
  draft: "Draft",
  in_review: "In review",
  approved: "Approved",
  rejected: "Rejected",
  needs_attention: "Needs attention",
};

export const STATUS_STYLE: Record<SegmentStatus, string> = {
  not_started: "bg-slate-100 text-slate-700",
  draft: "bg-sky-100 text-sky-800",
  in_review: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
  needs_attention: "bg-orange-100 text-orange-800",
};

export const TIER_LABEL: Record<Tier, string> = { production: "Production", assisted: "Assisted", experimental: "Experimental", unsupported: "Unsupported" };

export const TIER_MEANING: Record<Tier, string> = {
  production: "Evaluated on TNI content. Normal AI-assisted workflow, always with human review.",
  assisted: "Useful drafts with known limitations. Please review with extra care.",
  experimental: "Controlled pilot only. Treat drafts as early suggestions.",
  unsupported: "No automated translation. Contact TNI for a human translator.",
};

export const TIER_STYLE: Record<Tier, string> = {
  production: "bg-emerald-100 text-emerald-800",
  assisted: "bg-sky-100 text-sky-800",
  experimental: "bg-amber-100 text-amber-800",
  unsupported: "bg-slate-200 text-slate-700",
};

/** The three visually distinct kinds of target text (spec §4.2). */
export type VersionKind = "approved" | "rejected" | "ai" | "edited";

export function versionKind(v: Pick<Version, "origin" | "approval_state">): VersionKind {
  if (v.approval_state === "approved") return "approved";
  if (v.approval_state === "rejected") return "rejected";
  return v.origin === "ai" ? "ai" : "edited";
}

export const KIND_LABEL: Record<VersionKind, string> = {
  approved: "Approved translation",
  rejected: "Rejected",
  ai: "Suggested draft",
  edited: "Translator-edited",
};

export const KIND_STYLE: Record<VersionKind, string> = {
  approved: "border-emerald-300 bg-emerald-50 text-emerald-900",
  rejected: "border-red-300 bg-red-50 text-red-900",
  ai: "border-sky-300 bg-sky-50 text-sky-900",
  edited: "border-violet-300 bg-violet-50 text-violet-900",
};

export const ROLE_LABEL: Record<string, string> = {
  translator: "Translator", reviewer: "Reviewer", project_manager: "Project manager", tni_admin: "TNI administrator",
  technical_admin: "Technical administrator", auditor: "Auditor",
};

export const formatDate = (iso: string): string => new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
