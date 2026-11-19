# HAN — Rhapsody of Realities Translation Module

## Product boundary

Build a new, first-class Rhapsody module inside the existing HAN application. Do not rebuild, inspect, port, or depend on the unpublished server-hosted Rhapsody application. The existing Pilot Translation project remains unchanged.

The module shares HAN authentication, users, role enforcement, language registry, translation orchestration, terminology, knowledge retrieval, audit logging and deployment infrastructure. Rhapsody-specific publication records and workflows are isolated in their own domain.

## Confirmed decisions

- Knowledge sources: authorised books and Rhapsody publications, plus authorised sermons/video transcripts.
- Publishing: retain an InDesign-compatible route and build a modern publishing route.
- Monthly input: DOCX, XLIFF, or a mixed package.
- Automation: support end-to-end assistance, introduced in safe increments with human approval gates.
- Content permissions: the source materials are authorised for this use, as confirmed by the project owner.

## Monthly workflow

1. Admin creates an edition (month/year) and uploads DOCX, XLIFF, or both.
2. Ingestion stores immutable source files and checks file type, size, malware status and source metadata.
3. Document intelligence extracts a canonical ordered structure: front matter, daily articles, prayers/confessions, optional further study, one-/two-year reading plans, footer material and special sections.
4. Parsing preserves source paragraph/run formatting, stable segment IDs, trans-unit IDs and inline XLIFF codes. Unknown or malformed tags are surfaced as blocking validation issues rather than silently discarded.
5. Admin reviews extracted structure, article/day sequence, missing sections, duplicate IDs, unresolved tags and layout warnings.
6. Admin activates a versioned, immutable English master.
7. Admin creates language assignments tied to that exact master version, target language, translator/reviewer and due date.
8. Translator opens the active source read-only and edits target segments paragraph by paragraph. HAN provides a draft, terminology/TM suggestions and authorised theological context.
9. Autosave and version history protect work. Segment comments and status are tracked independently.
10. Translator submits. Admin proofreads, approves or returns with comments.
11. Only approved content can enter final publication preflight and export.

## Canonical data model (proposed)

- rhapsody_editions: edition month/year, status, active master version, created_by, timestamps.
- rhapsody_source_files: edition, format, storage key, checksum, filename, source metadata, ingestion status.
- rhapsody_master_versions: edition, version, source file refs, canonical structure JSON, validation report, activation metadata.
- rhapsody_sections: stable section ID, parent section, type, order, optional day number, formatting metadata.
- rhapsody_segments: stable segment ID, section ID, order, source text/runs, source trans-unit ID, inline tag structure, metadata.
- rhapsody_assignments: master version, target language, translator, reviewer, due date, state.
- rhapsody_segment_translations: assignment, segment, current version, state.
- rhapsody_translation_versions: target content/runs, author, origin (HAN/human), parent version, change note, timestamp.
- rhapsody_comments: assignment/segment, author, comment, resolution state.
- rhapsody_reviews: decision, reviewer, notes, timestamp.
- rhapsody_publication_jobs: assignment, engine, state, preflight report, output artifact references.

Use existing HAN user and language foreign keys. Use PostgreSQL JSONB for structured inline runs and format metadata where appropriate, while keeping core relationships relational. Add Alembic migrations; do not create a parallel Mongo/Node stack.

## Backend service boundaries

- rhapsody_editions: edition lifecycle, master versions and activation.
- rhapsody_ingestion: safe upload, DOCX/XLIFF parsing, canonical structure and source checksums.
- rhapsody_assignments: language assignment, ownership, due dates and access.
- rhapsody_translation: segment drafts, autosave, versioning, submission.
- rhapsody_intelligence: call existing HAN translation gateway and authorised knowledge retrieval; never expose provider identities.
- rhapsody_review: admin proofread, comments, return/approve.
- rhapsody_publishing: XLIFF round-trip, InDesign handoff, modern layout, PDF and preflight.
- rhapsody_qa: structure, segment completeness, tag integrity, numbers/references, terminology and layout checks.

## API outline

All endpoints under /v1/rhapsody. Require existing authenticated session and CSRF policy for mutations. Enforce permissions on the server; hiding links in the frontend is not security.

- GET /editions; POST /editions
- POST /editions/{id}/sources; POST /editions/{id}/ingest
- GET /editions/{id}/master; PATCH /editions/{id}/master
- POST /editions/{id}/validate; POST /editions/{id}/activate
- POST /editions/{id}/assignments
- GET /assignments; GET /assignments/{id}
- PUT /assignments/{id}/segments/{segment_id}
- POST /assignments/{id}/segments/{segment_id}/draft
- POST /assignments/{id}/submit; POST /assignments/{id}/review
- POST /assignments/{id}/comments; POST /assignments/{id}/publish

## HAN theological intelligence

Start with retrieval over authorised, versioned source material and a curated ministry glossary; do not fine-tune a general model as the first step. Index both books/Rhapsody and approved sermon/transcript material with provenance (work, edition/date, section, source type, language, permission record). Suggestions should expose source references to authorised translators/reviewers. A doctrinal QA flag is advisory and evidence-linked, never an automated theological verdict. Do not fabricate quotations or attribute unsupported statements to Pastor Chris. Track Bible translation/version provenance and respect the relevant text licences.

## Publishing strategy

Treat XLIFF as translation interchange, not a complete page-layout file. The InDesign route needs an actual InDesign master/IDML package, linked assets, fonts, style mappings and export settings. Build a round-trip fixture with representative source and translated content before promising faithful layout reconstruction. The modern engine should consume the same canonical structure and support long text, RTL, script-specific fonts, pagination, overflow detection, embedded fonts, print margins/bleed and preflight. PDF is a publication artifact; browser preview alone is not print approval.

## Security and integrity

- Reuse HAN session, CSRF, RBAC, audit and response serialization patterns.
- Roles: admin publication controls; translators only their assignments; reviewers only assigned review work; technical admins maintain service configuration. Exact capability mapping must be enforced server-side.
- Never expose model/provider names, routing traces, credentials or internal costs in translator-facing responses.
- Uploaded documents are untrusted input. Validate content type and extension, enforce size limits, malware scan, store outside web root and use generated storage keys.
- Active master versions are immutable. Assignment snapshots the master version.
- Optimistic concurrency on segment updates; autosave must not overwrite newer edits.
- Audit source upload, ingestion, activation, assignment, draft generation, edits, submission, review and publication.

## Delivery increments

1. Foundation: editions, source uploads, secure storage, DOCX/XLIFF parsing, canonical model, validation and admin activation.
2. Translation: assignments, translator dashboard, segment editor, HAN draft integration, autosave, history and submit.
3. Review: proofreading queue, paragraph comments, approve/return and audit.
4. Publishing: XLIFF export/round-trip, InDesign handoff and modern PDF layout/preflight.
5. Theological intelligence: governed source ingestion, retrieval, glossary and evidence-linked advisory QA.

## Acceptance criteria

- Existing Pilot Translation routes and tests continue to work.
- DOCX-only, XLIFF-only and mixed uploads are represented without losing content.
- Round-trip fixtures preserve stable IDs and inline formatting exactly.
- An inactive master cannot be assigned; an assignment remains tied to its master version.
- A translator cannot access another translator's assignment or edit source content.
- HAN drafts remain drafts until human review; no autonomous approval.
- A reviewer can comment, return or approve with an auditable decision.
- Publication export is blocked on configured critical validation failures and unapproved content.
- Provider identity and routing metadata never reach translator-facing payloads.
- Print output is validated for overflow, fonts, scripts, pagination and page geometry.
