# Implementation progress

## Application strategy clarification - 16 September 2026

Recorded the intended product direction in [application intelligence strategy](./application-intelligence-strategy.md): inspect the employer's actual application destination before tailoring documents or considering submission; classify each destination as manual handoff, assisted review, permitted native submission or unsupported; then ground documents in the confirmed profile and vacancy, require explicit approval, and reconcile receipts. The current `template-v1` generator uses no Gemini/external model and performs no application submission. Future paid value is reliable, destination-specific assistance and permitted bounded automation, not a universal browser bot.

Inspected the supplied Guru Infosys vacancy and linked application page. It is a company-owned Django multipart form, not Greenhouse: résumé upload (PDF/DOC/DOCX, displayed 5 MB limit), optional cover letter and portfolio, required experience summary, CSRF token, visible CAPTCHA and accuracy confirmation. Classified it as `assisted_review`/`manual_handoff`; no test or unauthorized submission was performed. Details and limitations are recorded in the strategy document.

## Profile save payload hardening - 16 September 2026

Fixed a malformed profile-save failure where the API received no JSON body and reported every required field as missing. The frontend now validates the loaded profile before sending, constructs an explicit payload with safe AI preference defaults, and reports a reload-needed message when profile state is unavailable. The backend now unwraps legacy `data`/`payload` request wrappers and recovers an empty save request as a draft of the latest owned profile, so older dashboard bundles do not lose the user's CV-derived data. No checks or builds were run for this fix per the user's instruction.

Added a dedicated `POST /api/me/profile/confirm` path. When the confirmation checkbox is checked, the frontend sends the expected profile version to this endpoint instead of relying on the general draft-save body. It confirms the exact latest loaded revision transactionally and returns a conflict if another session changed it. This fixes the case where the UI checkbox was checked but the documents context still reported `confirmed: false`.

Follow-up recovery: confirmation now treats the explicit checkbox action as permission to confirm the latest unconfirmed owned revision when the page's expected version is stale. This handles duplicate or older save retries without weakening stale-write protection for ordinary profile edits. If the profile is already confirmed, the endpoint is idempotent and returns the confirmed revision.

## Application documents - 16 September 2026, implementation only

Added `/dashboard/documents` and a pack editor at `/dashboard/documents/[id]`, plus desktop/mobile navigation and Prepare documents links in Matches. The backend can create a résumé and optional cover letter from the latest confirmed profile and a selected database job, save edited revisions, record version-specific review, list/delete packs and export text or printable HTML. Deterministic drafting preserves profile wording, prioritizes relevant skills/projects, honors current document preferences and incurs no external AI charge.

Added ownership scoping, strict request validation, expected-version conflict handling, create-request deduplication, profile/vacancy snapshots, stale-review detection, session-reset behavior and unknown-outcome recovery. The history UI reads old revisions, compares text blocks and restores both documents into the editor to save as a new revision. HTML exports escape content; PDF saving is through the browser's print dialog, not a verified server PDF renderer. This is a partial D01-D04 slice; full document quality evaluation, pricing and provider instrumentation remain pending.

Added backend migration `1789600000000-application-document-packs.ts` and `APPLICATION_DOCUMENTS_ENABLED` (default off). **No checks, builds, tests, browser verification, migration or deployment were run**, per the latest user instruction. Review/apply migrations and enable the flag in development before exercising the feature. All earlier passing checks below apply only to their earlier changes.

See [application-documents.md](./application-documents.md) for user flow, API, source mapping, retry semantics, rollout, limitations and continuation tasks.

## Confirmed profile matching - 16 September 2026

The matching service now loads the latest career-profile revision for the authenticated user. When that revision is confirmed, its reviewed professional title, skills and summary are used as the matching source of truth; CV fields remain the fallback for users without a confirmed profile. The existing preferences-only mode remains unchanged. Backend typecheck and build pass after this change. Matching evaluation against a representative job fixture and browser verification remain pending.

## Profile verification continuation - 16 September 2026

Current repositories:

- Frontend: `C:/Users/bishwa shah/OneDrive/Desktop/job-finder`.
- Backend: `C:/Users/bishwa shah/Desktop/job-finder-backend` (the older path below is historical).

Continued the profile foundation rather than moving into billing or automated applications. Fixed account-switch isolation in `CareerProfileEditor`: the full workspace now remounts on account identity changes, clearing profile data, nested inputs and pending requests. Previously a failed load for the next account could leave the previous account's draft visible and editable.

Removed an incomplete duplicate array declaration from the backend CV verification script that prevented compilation. Removed one stale generated Next route type for the deleted `/partner` page; no source route or TypeScript exclusion was added.

Added `career-profile.integration.spec.ts` and `yarn test:profile` in the backend. The integration suite uses the real Nest controller, JWT guard/strategy, validation pipe, profile service, TypeORM transactions and profile migration. It creates synthetic users and an isolated PostgreSQL schema, then removes that schema. It does not load `.env` or use the application's configured database. The account table is a minimal fixture; this is not a test of the complete initial migration, authentication signup/login, or the full deployed app.

Verification completed:

- Frontend `yarn typecheck` and `yarn build`: passed. Existing hook/image lint warnings, outdated Browserslist data and a webpack cache warning remain.
- Backend `yarn typecheck` and `yarn build`: passed.
- Profile suite: 20 reported tests passed, zero skipped, against a separate temporary PostgreSQL 18 instance on localhost port 55439. This includes 11 existing tests, eight integration scenarios and their parent test.
- HTTP evidence: unauthenticated, malformed-token, expired-token and missing-account requests rejected; validation paths preserved; client-injected ownership rejected; authenticated save/reload and stale-write conflict verified; profile responses marked `no-store`; CV suggestions scoped to their owner.
- Database evidence: concurrent first saves serialize; failed inserts roll back; a retry can reuse the uncommitted version; draft saves preserve prior confirmation history; deleting a fixture account cascades only its revisions; profile migration down/up succeeds in the isolated fixture schema.

Run the backend suite with `yarn test:profile`. Database cases explicitly skip unless `PROFILE_TEST_DATABASE_URL` points to an isolated local PostgreSQL database. See backend `docs/profile-verification.md` for the command and test boundaries.

Still pending for this slice: browser regression checks for account switching and save/reload, desktop/mobile visual review, and application of the migration to a reviewed development database. No application database migration or deployment was performed. Authentication/session hardening, extraction provenance and the wider roadmap remain separate work.

## Career profile foundation — implemented, verification deferred

Backend repository: `C:/Users/DETECH-002/Desktop/job-backend`.

Added authenticated `GET /api/me/profile`, `PUT /api/me/profile` and `GET /api/me/profile/cv-suggestions` routes. Saves validate a complete profile snapshot and expected version, lock the owning user row transactionally, and append a revision. Stale saves receive HTTP 409. CV suggestions do not automatically overwrite or confirm facts. AI preferences are stored; automatic submission remains disabled and review remains mandatory.

Added migration `1789500000000-career-profile-revisions.ts`, entity registration and schema regression tests. The migration has NOT been run. Review migration history and deployment configuration before running it; the backend currently includes an initial migration that may not match every deployed database's history. Do not enable schema synchronization as a shortcut.

Frontend: added a runtime-validated API client and a staged career-profile editor. Following the user's instruction to continue after the mockup, the editor now lives at `/dashboard/profile`, with desktop/mobile dashboard navigation and a link from Preferences. It uses the existing branding and the concept's light-blue, two-column layout. No build, typecheck, tests, formatter, browser check or database migration was run during this implementation stage, as requested.

Added profile-copy JSON download, saved-versus-unsaved confirmation status, link-navigation warnings, separate CV-loading and save states, account-change request cancellation, validation-error section routing, and reconciliation for unknown save outcomes. JSON download exports the current editor snapshot, not all account data or profile history. Link interception protects ordinary clicked navigation and beforeunload protects document exits; browser history/programmatic navigation still needs dedicated integration coverage and is not claimed fully guarded.

Added backend service regression tests for scoped reads, owner locking, revision creation, stale writes, confirmation clearing, missing users and client-injected ownership. They use test doubles and have NOT been executed. They do not prove real PostgreSQL concurrency or rollback behavior. URL validation now safely rejects malformed and credential-bearing links, with added regression cases.

The image-generation preview is a concept, not implementation evidence. Its invented logo mark/tagline and sample counters are not approved brand assets or factual product claims and must not be copied into production. Preserve the existing KamKhoj wordmark. Confirmation status in the real UI must distinguish the checkbox's unsaved state from server-confirmed saved facts.

## Still required before release

- Render and review desktop/mobile implementation against the approved direction; visual fidelity is not yet verified.
- Verify schema tests, HTTP validation, cross-user isolation, concurrent first saves, stale revisions and rollback behavior.
- Apply the reviewed migration to a development database and exercise authenticated save/reload flows.
- Add integration regression tests covering transaction serialization and revision ownership.
- Complete authentication/session hardening separately; existing auth behavior is unchanged.
- Add field-level extraction provenance, profile history/export/deletion UX, and retention policy implementation.
- Connect confirmed profiles to matching and document generation explicitly; existing matching/interviews still use their current data sources.
- Add actual applications, job-seeker credit accounting, payments and approved submission integrations in later slices. Partner billing is not treated as job-seeker billing.
- Run final typecheck, build, tests and visual checks when the user is ready for verification.

Existing unrelated README, backend `.env.example` and backend `package.json` edits were not changed by this implementation.
## 16 September 2026 — application capability boundary

- Added the `application_capabilities` backend entity, migration and authenticated read endpoint.
- Added the first concrete Guru Infosys capability mapping: required identity/contact fields, resume and cover-letter file rules, experience field, portfolio URL, CAPTCHA, CSRF session and confirmation gates, plus receipt signals.
- Document context and saved document responses now expose the destination mode and a paid-service boundary. The UI explains assisted review/manual handoff and links to the official application page; it does not claim that document generation submits an application.
- No typecheck, build, lint, test, migration or browser verification was run, per instruction.
