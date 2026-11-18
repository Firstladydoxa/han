/**
 * Typed client for the HAN API. The browser only talks to same-origin `/v1/*` (proxied to the backend);
 * it never holds provider credentials and never calls a model provider.
 */

export type Role = "translator" | "reviewer" | "project_manager" | "tni_admin" | "technical_admin" | "auditor";
export type Tier = "production" | "assisted" | "experimental" | "unsupported";
export type SegmentStatus = "not_started" | "draft" | "in_review" | "approved" | "rejected" | "needs_attention";
export type JobStatus = "queued" | "processing" | "ready" | "failed" | "partial";

export interface User { id: string; email: string; display_name: string; role: Role; status: string }
export interface Session { user: User; csrf_token: string }
export interface ProjectListItem { id: string; name: string; domain: string | null; style: string | null; member_role: string }
export interface Direction { source_code: string; target_code: string; readiness_tier: Tier; review_note: string | null }
export interface ProjectDetail extends ProjectListItem { instructions: string | null; can_approve: boolean; language_directions: Direction[] }
export interface Language { code: string; display_name: string; script: string | null }
export interface Warning { type: "number" | "terminology" | "name" | "consistency" | "format" | "readiness"; severity: "info" | "warning"; message: string; span?: unknown }
export interface TMMatch { source_text: string; target_text: string; match_percent: number; tm_id: string }
export interface Term { source_term: string; target_term: string; usage_note: string | null; forbidden: string[] }
export interface UserRef { id: string; display_name: string }
export interface Approval { approver: UserRef; decision: "approved" | "rejected"; comment: string | null; created_at: string }
export interface Version {
  version_id: string; version_number: number; target_text: string; origin: "ai" | "human"; created_by: UserRef; created_at: string;
  parent_version_id: string | null; change_note: string | null; approval_state: "unapproved" | "approved" | "rejected"; approval: Approval | null;
}
export interface TranslateResponse {
  translation_id: string; version_id: string; status: "draft"; source_language: string; target_language: string; source_text: string;
  translated_text: string; review_required: boolean; review_note: string | null; warnings: Warning[]; tm_matches: TMMatch[]; terminology: Term[]; message: string;
}
export interface Translation {
  translation_id: string; project_id: string; source_language: string; target_language: string; source_text: string; context: string | null;
  status: string; versions: Version[]; current_version_id: string | null;
}
export interface JobProgress { total: number; done: number; approved: number }
export interface JobSegment { segment_id: string; sequence: number; source_text: string; status: SegmentStatus; current_version: Version | null; warnings: Warning[] }
export interface Job { job_id: string; project_id: string; title: string | null; source_language: string; target_language: string; status: JobStatus; progress: JobProgress; segments: JobSegment[] }
export interface JobSummary { job_id: string; title: string | null; source_language: string; target_language: string; status: JobStatus; progress: JobProgress; created_at: string }
export interface TMResult { tm_id: string; source_text: string; target_text: string; match_percent: number; match_type: "exact" | "fuzzy"; approved_at: string; provenance: Record<string, string> }
export interface TermResult { term_id: string; source_term: string; target_term: string; definition: string | null; domain: string | null; part_of_speech: string | null; usage_note: string | null; forbidden: string[]; status: string }
export interface ChatResponse {
  conversation_id: string; reply: string; translation: TranslateResponse | null;
  clarification: { question: string; field: string } | null; actions: { type: "open_in_workspace"; translation_id: string }[];
}
export interface AdminUser extends User { engine_details_granted: boolean; created_at: string; generated_password?: string | null }
export interface AdminProject {
  id: string; name: string; client: string | null; domain: string | null; style: string | null; instructions: string | null; status: string;
  retention_days: number | null; allow_external_processing: boolean; pilot_opt_in: boolean; monthly_char_quota: number | null;
  monthly_spend_limit: number | null; spend_alert_pct: number;
}
export interface Member { user_id: string; email: string; display_name: string; role: string; can_approve: boolean }
export interface AdminTerm extends TermResult { project_id: string | null; scope: string; source_language: string; target_language: string }
export interface AuditEvent { id: string; actor_id: string | null; actor_role: string | null; project_id: string | null; action: string; object_type: string | null; object_id: string | null; outcome: string; request_id: string | null; created_at: string; details: Record<string, unknown> | null }

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public fields?: { field: string; message: string }[]) {
    super(message);
    this.name = "ApiError";
  }
}

const GENERIC = "Something went wrong. Please try again shortly.";
let csrfToken = "";

export function setCsrf(token: string): void { csrfToken = token; }
export function getCsrf(): string { return csrfToken; }

type Method = "GET" | "POST" | "PUT" | "PATCH";
const AUTH_PATHS = ["/v1/auth/login", "/v1/auth/me"];

async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (method !== "GET") headers["X-CSRF-Token"] = csrfToken;
  let res: Response;
  try {
    res = await fetch(path, { method, headers, credentials: "same-origin", body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError(0, "network_error", "I couldn't reach the service. Please check your connection and try again.");
  }
  if (res.ok) return (await res.json()) as T;
  let code = "error";
  let message = GENERIC;
  let fields: { field: string; message: string }[] | undefined;
  try {
    const data = (await res.json()) as { detail?: { code?: string; message?: string; fields?: { field: string; message: string }[] } };
    code = data.detail?.code ?? code;
    message = data.detail?.message ?? message;
    fields = data.detail?.fields;
  } catch { /* non-JSON error body: keep generic message */ }
  if (res.status === 401 && !AUTH_PATHS.includes(path) && typeof window !== "undefined") {
    window.location.assign("/login");
  }
  throw new ApiError(res.status, code, message, fields);
}

const qs = (params: Record<string, string | number | undefined>): string => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") p.set(k, String(v));
  const s = p.toString();
  return s ? `?${s}` : "";
};

export const api = {
  login: async (email: string, password: string): Promise<Session> => {
    const s = await request<Session>("POST", "/v1/auth/login", { email, password });
    setCsrf(s.csrf_token);
    return s;
  },
  me: async (): Promise<Session> => {
    const s = await request<Session>("GET", "/v1/auth/me");
    setCsrf(s.csrf_token);
    return s;
  },
  logout: () => request<{ ok: boolean }>("POST", "/v1/auth/logout", {}),
  projects: () => request<ProjectListItem[]>("GET", "/v1/projects"),
  project: (id: string) => request<ProjectDetail>("GET", `/v1/projects/${id}`),
  languages: () => request<Language[]>("GET", "/v1/languages"),
  translate: (b: { project_id: string; source_language: string; target_language: string; text: string; context?: string }) =>
    request<TranslateResponse>("POST", "/v1/translate", b),
  chat: (b: { project_id: string; message: string; conversation_id?: string }) => request<ChatResponse>("POST", "/v1/chat", b),
  translation: (id: string) => request<Translation>("GET", `/v1/translations/${id}`),
  saveVersion: (id: string, b: { target_text: string; parent_version_id: string; change_note?: string }) =>
    request<{ version: Version; warnings: Warning[] }>("POST", `/v1/translations/${id}/versions`, b),
  decide: (versionId: string, decision: "approved" | "rejected", comment?: string) =>
    request<{ version: Version; message: string }>("POST", `/v1/versions/${versionId}/approve`, { decision, comment }),
  createJob: (b: { project_id: string; source_language: string; target_language: string; title?: string; text: string }) =>
    request<{ job_id: string; status: JobStatus; segment_count: number }>("POST", "/v1/translation-jobs", b),
  jobs: (projectId: string) => request<JobSummary[]>("GET", `/v1/translation-jobs${qs({ project_id: projectId })}`),
  job: (id: string) => request<Job>("GET", `/v1/translation-jobs/${id}`),
  tmSearch: (p: { project_id: string; source_language: string; target_language: string; q: string }) =>
    request<{ results: TMResult[] }>("GET", `/v1/tm/search${qs(p)}`),
  termSearch: (p: { project_id: string; source_language: string; target_language: string; q?: string }) =>
    request<{ results: TermResult[] }>("GET", `/v1/terminology/search${qs(p)}`),
  qaCheck: (b: { project_id: string; source_text: string; target_text: string; source_language: string; target_language: string }) =>
    request<{ warnings: Warning[] }>("POST", "/v1/qa/check", b),
  admin: {
    users: () => request<AdminUser[]>("GET", "/v1/admin/users"),
    createUser: (b: { email: string; display_name: string; role: Role; password?: string }) => request<AdminUser>("POST", "/v1/admin/users", b),
    patchUser: (id: string, b: Partial<{ role: Role; status: "active" | "disabled"; display_name: string }>) => request<AdminUser>("PATCH", `/v1/admin/users/${id}`, b),
    projects: () => request<AdminProject[]>("GET", "/v1/admin/projects"),
    createProject: (b: Partial<AdminProject> & { name: string }) => request<AdminProject>("POST", "/v1/admin/projects", b),
    patchProject: (id: string, b: Partial<AdminProject>) => request<AdminProject>("PATCH", `/v1/admin/projects/${id}`, b),
    members: (id: string) => request<Member[]>("GET", `/v1/admin/projects/${id}/members`),
    putMembers: (id: string, members: { user_id: string; role: string; can_approve?: boolean }[]) => request<Member[]>("PUT", `/v1/admin/projects/${id}/members`, { members }),
    terms: (projectId?: string) => request<AdminTerm[]>("GET", `/v1/admin/terminology${qs({ project_id: projectId })}`),
    createTerm: (b: { project_id?: string; scope: "project" | "global"; source_language: string; target_language: string; source_term: string; target_term: string; status?: string }) =>
      request<AdminTerm>("POST", "/v1/admin/terminology", b),
    patchTerm: (id: string, b: { status?: string; comment?: string; target_term?: string }) => request<AdminTerm>("PATCH", `/v1/admin/terminology/${id}`, b),
    directions: () => request<Direction[]>("GET", "/v1/admin/language-directions"),
    putDirections: (directions: { source_code: string; target_code: string; readiness_tier: Tier; review_note?: string }[]) =>
      request<Direction[]>("PUT", "/v1/admin/language-directions", { directions }),
    audit: (p: { action?: string; limit?: number } = {}) => request<AuditEvent[]>("GET", `/v1/admin/audit-events${qs(p)}`),
    // Protected operations: the backend returns these only to technical administrators (or explicitly granted users).
    models: () => request<Record<string, unknown>[]>("GET", "/v1/admin/models"),
    routingEvents: () => request<Record<string, unknown>[]>("GET", "/v1/admin/routing-events"),
    usage: () => request<{ since: string; rows: Record<string, unknown>[] }>("GET", "/v1/admin/usage"),
    health: () => request<Record<string, unknown>>("GET", "/v1/admin/health"),
  },
};
