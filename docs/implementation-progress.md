# Implementation progress

## Services purchase history, eSewa sandbox testing & UI clarity pass — 16 September 2026

Completed the commercial beta delivery overhaul:
- **Services & Purchases Page (`/dashboard/products`)**: Wired `loadProductOrders()` and updated the backend order status mapping (`deliveryStatus: 'ready'` on completion, with `providerReference`). Purchases now display in a dedicated "Your Purchased Services & Orders" section with real-time status badges (`Paid & Verified`, `Pending Verification`, `Failed`), metadata, manual re-verification action, and immediate fulfillment buttons linking to Documents or Matches.
- **eSewa Sandbox Testing Integration**: Integrated an in-UI test helper displaying sandbox credentials (Test ID: `9841000000`, MPIN: `1122`, OTP: `123456`). Confirmed Khalti is excluded from all payment logic and only exists in Nepal company fixtures.
- **Application Documents Clarity (`/dashboard/documents`)**: Added an educational explainer and 3-step visual workflow (1. Career Profile → 2. Vacancy Selection → 3. Review & Print ATS PDF). Overhauled the empty state with direct CTAs and rendered existing packs with clear status badges (`Ready to Apply`, `Draft in Review`, `Profile Updated`).
- **Application Tracker Clarity (`/dashboard/applications`)**: Added an introductory guide explaining user-reported tracking vs. official application submission. Added a 4-card pipeline metrics summary bar (Total, Active Pipeline, Interviews, Offers), color-coded stage pills, and a guided empty state.
- **Automated Verification**: Backend `npm run typecheck` and frontend `yarn typecheck` passed with zero errors. Migrations 1 through 8 are confirmed applied in the database.

## Manual application tracker — 16 September 2026

Implemented the next commercial-first phase: owner-scoped tracked applications. Users can add a reviewed document pack to the tracker, open the official destination themselves, record submission, and maintain outcome statuses and private notes. Statuses remain user-reported; no email or employer receipt is claimed. Duplicate job tracking is idempotent per user, updates use an `expectedUpdatedAt` conflict check, and account ownership is enforced by every query.

Added `job_seeker_applications` entity/migration, authenticated `/api/me/applications` endpoints, frontend API client, dashboard tracker route/navigation, and a link from the reviewed document editor. No credits, payment, application submission, Gmail access or portal automation was added. No build, typecheck, tests, migration or browser verification was run.

The tracker boundary is now hardened: attaching a pack requires the pack's latest version to have an explicit review timestamp, and tracker destination URLs accept only credential-free HTTP(S) links. The tracker still records user-reported outcomes only; it never claims a send or receipt.

Next: verify this tracker slice, then implement B01 (versioned product catalog/quotes) before B02 (transactional credits). The tracker remains usable for free and is intentionally not coupled to payment until delivery/refund semantics are tested.

## Versioned product catalog — 16 September 2026

Added the first B01 slice: Professional CV (NPR 599), Job-Specific Application Pack (NPR 249), and Job Hunt Pack (NPR 1,499) are exposed through an authenticated versioned catalog. A quote endpoint persists the selected catalog version, amount, deliverables and 15-minute expiry for auditability. The frontend adds a Services screen and clearly states that charging is disabled; no payment or credit balance is granted.

Next: verify quote expiry and ownership, then implement B02 reservation/capture/release/refund ledger semantics before connecting eSewa or any other gateway.

## eSewa sandbox checkout — 16 September 2026

Added job-seeker payment orders and an eSewa checkout flow for the versioned product catalog. Checkout creates a pending owner-scoped order from a live quote, signs the eSewa form server-side, redirects through the eSewa sandbox, validates the signed callback, then calls eSewa transaction status before marking the order and quote complete. Browser redirects alone do not mark payment successful. Khalti is not part of the active payment path.

Added `1790000000000-job-seeker-payment-orders.ts`, authenticated checkout/verification endpoints, a public eSewa callback redirect, and the Services-page payment form. The existing partner eSewa billing remains separate. Apply the new migrations and configure sandbox frontend/backend URLs before testing; no build, typecheck, tests or migrations were run.

Remaining commercial gate: B02 transactional credits/reservations/refunds, then fulfillment/order delivery and support reconciliation. Automatic portal submission, Gmail, and recorded voice/video interviews remain later roadmap phases and are not represented as enabled by this checkout.

## Bounded inspector phase — 16 September 2026

Added admin-only `POST /api/me/application-capabilities/inspect`. It loads a stored vacancy URL, requires an explicit current host/path read-permission approval, and performs bounded HTTPS/robots inspection with public IPv4 pinning, redirect checks, deadline and byte limits. It parses a single application form into requirements and user-action gates, preserves manual/operator records and writes a short-lived capability snapshot. The document workflow reads results through its existing capability integration.

Default off: `APPLICATION_INSPECTION_ENABLED` and `APPLICATION_INSPECTION_APPROVALS` must be configured deliberately. No forms, mail, credits or applications are submitted. Added regression cases but ran no tests, build, typecheck, migration or live HTTP inspection. See [destination-inspector.md](./destination-inspector.md) for configuration, restrictions and remaining network/integration verification. This completes the code slice, not release approval or the full product roadmap.

## Destination snapshot continuation — 16 September 2026

Continued from the capability/document-pack boundary in the current local repositories (`DETECH-002/Desktop/job-finder` and `DETECH-002/Desktop/job-backend`). Other machine paths below are historical notes, not this session's filesystem.

- Replaced substring-based employer matching with exact normalized destination/source URL matching. Other roles and lookalike domains do not inherit the sample inspection.
- Added bounded registry validation, seven-day maximum inspection validity, revoked/future/expired fallback, conservative URL classification and explicit unsupported results for invalid destinations. This classifier does not resolve DNS or provide an SSRF-safe fetcher.
- Kept native dispatch and charging disabled, regardless of registry claims. The sample Guru inspection expires on 23 September 2026; it was not reinspected in this session.
- New document revisions pin the evaluated destination snapshot in their existing JSON evidence. Requirements, file constraints and mandatory user-action gates are recorded before creation. No new migration is needed for this snapshot.
- Document review now becomes invalid when destination evidence changes or expires. Older packs without a snapshot remain readable/exportable but need a fresh pack before review. Frontend review controls respect this state.
- Added policy regression cases; did not execute them. No build, typecheck, tests, migration, browser checks or external requests were run.

Next: implement an explicitly authorized, bounded read-only inspector with DNS/redirect protections; then destination-aware answer drafts and the application tracker. Current URL checks alone must never be used to authorize server-side fetching. Profile confirmation's newer stale-version recovery also needs review before submission features: approval must refer to facts actually reviewed, not silently confirm a newer unseen revision.

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
