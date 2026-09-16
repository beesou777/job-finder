# KamKhoj implementation backlog

Companion to the [product roadmap](./kamkhoj-product-roadmap.md). Prepared 15 September 2026. All items below are proposed work, not claims of implemented features.

Implementation update, 16 September: the first application-document slice now has code for deterministic drafting, saved revisions, review and text/printable HTML downloads. This partially addresses D01-D04; acceptance evidence is still pending. See [the document handoff](./application-documents.md). The user deferred checks, builds, tests and migration execution during this implementation turn.

## Working rules

Inspect the actual backend before editing API contracts or database tables. Reuse existing architecture and Yarn configuration. Make small reviewed changes; use migrations and feature flags for new behavior. Never test a submission adapter by sending unauthorized or fictitious applications to real employers.

Each ticket requires a demonstrated user flow, failure states, authorization checks, relevant automated tests, observability and a rollback/disable path. The phase gate is passed only after evidence is recorded, not merely after UI completion.

## P0: foundation before monetization

| ID | Deliverable | Acceptance evidence | Dependency |
| --- | --- | --- | --- |
| F01 | Current-system inventory | Frontend/backend/deployments identified; each CV/match/interview flow marked working, partial or absent with evidence | Backend access |
| F02 | Source/capability registry | Every active source has permission status, allowed operations, owner and review date; unknown sources not auto-enabled | F01 |
| F03 | Authentication hardening | Session theft exposure reviewed; server session design, CSRF and ownership tests; safe migration preserving valid users | F01 |
| F04 | Reliable availability UI | Backend outage differs from zero jobs; retries and errors visible without leaking internals | F01 |
| F05 | Privacy/support baseline | Data inventory, retention/deletion, contact, consent and incident procedures documented | F01 |
| F06 | User/business validation | Ten seeker interviews, five employer conversations and explicit pack-price feedback summarized without invented demand | Founder research |

F06 authorizes planning conversations as a future founder task, not automatic outreach by this documentation task.

## P1: profile and identity

| ID | Deliverable | Acceptance evidence | Dependency |
| --- | --- | --- | --- |
| P01 | Optional Google identity | Email login retained; verified identity linking; OAuth error/revocation cases; no Gmail scopes at signup | F03 |
| P02 | Staged onboarding | Save/resume, manual alternative, accessible mobile flow, required/optional fields clear | F05 |
| P03 | Safe CV processing | MIME/content/size validation; isolated parsing; failed/scanned/encrypted files explained; private storage | F03, F05 |
| P04 | Fact review and provenance | Extracted facts editable; source/version retained; uncertain facts remain unconfirmed | P03 |
| P05 | Versioned profile/editor | Concurrent edits handled; applications pin versions; updates invalidate relevant pending approval | P04 |
| P06 | Account export/deletion | Owned data export; deletion cascade and backup-expiry behavior tested; delivered employer copies disclosed | P05 |

Do not silently add OCR services for scanned CVs. Start with a clear manual-entry fallback; price and evaluate OCR separately if demand warrants it.

## P2: matching and documents

Before D02/D04 are expanded, add destination inspection and capability classification to each selected job. Document generation must receive the bounded vacancy snapshot and capability result, so the user sees whether the next step is manual handoff, assisted review, permitted native submission or unsupported. AI provider work is downstream of this inspection and must not acquire submission authority.

| ID | Deliverable | Acceptance evidence | Dependency |
| --- | --- | --- | --- |
| M01 | Canonical job records | Duplicate examples, expiry, source provenance, unknown salary and Nepal eligibility cases handled | F02 |
| M02 | Explainable matching | Hard constraints enforced; labeled evaluation meets documented target; unknowns visible | M01, P05 |
| D01 | AI settings | Defaults, persistence, per-user access and language/review/budget behavior tested | P05 |
| D02 | Structured generation | Validated outputs; no critical invented facts in evaluation; provider timeouts and malformed output handled | D01, M01 |
| D03 | Document rendering/diff | PDF text extractable; Nepali characters, long names, multi-page layouts and contact details checked | D02 |
| D04 | Pack version/approval | User sees exact artifacts, destination and price; approval tied to immutable version | D03 |
| D05 | Cost instrumentation | Per-task token usage, retries and cost recorded without private prompt logging | D02 |

Run generation against fixture CVs/jobs that include malicious instructions, conflicting dates, missing qualifications and unusually long descriptions. Verify that content cannot invoke a send, modify credits or override policy.

## P3: tracking and monetization

| ID | Deliverable | Acceptance evidence | Dependency |
| --- | --- | --- | --- |
| A01 | Application tracker | Draft, manual handoff, user-reported submission and verified receipt distinguished | D04 |
| B01 | Price catalog/quotes | Versioned action prices, expiry and deliverables visible; no surprise background spending | D05 |
| B02 | Transactional credits | Reserve/capture/release/refund tested under concurrent spending and retries | B01 |
| B03 | Payment gateway | Sandbox purchase, signed/status verification, amount mismatch and duplicate callback tests | Merchant access, B02 |
| B04 | Refund/support console | Least-privilege audited adjustments; clear failed/unknown delivery policy | B03, A01 |
| B05 | Free entitlements | Monthly text allowance server-enforced; resumable sessions; no duplicate grants | F03 |
| B06 | Paid beta | 20–30 opt-in users, real costs and support minutes measured; receipts and refund path usable | B04, D04 |

Minimum billing tests: two simultaneous spends cannot overspend; repeated callback grants once; browser success URL alone grants nothing; wrong amount/provider/order is rejected; delayed success reconciles safely; refund is not duplicated; worker crash releases or reconciles reservations; admin adjustment leaves an audit trail.

## P4: safe delivery

Application intelligence is the prerequisite for S01-S05: inspect and classify the actual employer destination before building an adapter or charging for a send. A listing source does not by itself authorize submission. See [application intelligence strategy](./application-intelligence-strategy.md).

| ID | Deliverable | Acceptance evidence | Dependency |
| --- | --- | --- | --- |
| S01 | Consent and queue | Approval snapshot, limits, expiry/revocation, durable jobs and cancel-before-send verified | A01, B02 |
| S02 | First permitted channel | Employer/native/email agreement and tested destination; required fields and receipt definition documented | F02, S01 |
| S03 | Reconciliation | Timeout after send becomes unknown; no blind retries; evidence resolves state | S02 |
| S04 | Operator tools | Kill switch, redacted error detail, retry eligibility and user notification | S03 |
| S05 | Pilot gate | At least 50 authorized attempts/ten users; zero duplicates and unauthorized sends; resolved-outcome target met | S04 |

Concurrency decision: revocation before dispatch prevents sending. If a provider has already accepted an in-flight request, do not promise recall; report the exact outcome. Establish the dispatch boundary in code and tests.

## P5: portal integration and bounded automation

| ID | Deliverable | Acceptance evidence | Dependency |
| --- | --- | --- | --- |
| X01 | Portal research matrix | 30 representative flows inspected without fake submissions; rights and technical feasibility recorded separately | F02 |
| X02 | One permitted adapter | Explicit supported domains/forms; versioned field mapping; files, custom questions and receipts tested | X01, S05 |
| X03 | User intervention | Login/MFA/CAPTCHA/assessment routes pause and hand control to user | X02 |
| X04 | Bounded auto mode | Explicit opt-in, exclusions, job criteria, daily/monthly caps, expiry and immediate pause | X03 |
| X05 | Coverage dashboard | Supported relevant jobs/total relevant jobs shown; failure and unknown rates include all attempts | X04 |

Adapter specification must include: permission evidence, supported operation, authentication owner, minimum fields, supported file types, screening-question handling, rate limits, success evidence, duplicate strategy, timeout reconciliation, user handoff, sensitive-data retention and kill switch.

Test cases: closed vacancy, changed form, newly required question, expired login, malformed upload, unsupported demographic question, payment reservation expiry, revocation while queued, crash after dispatch, duplicate job from another source and provider outage. Never use evasion infrastructure to convert an unsupported portal into a supported one.

## P6: application mail

| ID | Deliverable | Acceptance evidence | Dependency |
| --- | --- | --- | --- |
| E01 | Selective forwarding | Private alias, verified receiving webhook, quotas, attachment handling and misassociation correction | F05, A01 |
| E02 | Optional Gmail send | Required approval/scopes complete; exact-message confirmation; encrypted token storage | Google approval, S01 |
| E03 | Optional Gmail read | Restricted-scope/security requirements resolved; minimize data, disconnect/delete and history recovery tested | Google review/budget, E01 |
| E04 | Response timeline | Acknowledgment versus invitation/rejection distinguished; confidence and user corrections retained | E01 or E03 |

Mail tests include forged forwarded headers, unrelated messages, multiple jobs at one company, changed subjects, duplicate notifications, watch expiration, revoked OAuth access, historical-message replay and malicious instructions embedded in email. Drafting a reply must not cause it to be sent.

## P7: interviews

| ID | Deliverable | Acceptance evidence | Dependency |
| --- | --- | --- | --- |
| I01 | Text quality and quotas | Role/CV questions, understandable rubric, bounded eight-question session, reliable report/resume | B05, P05 |
| I02 | Turn-based voice | Permission denied, noisy audio, Nepali/English quality, interrupted upload and cost ceilings tested | I01, measured demand |
| I03 | Optional recording | Consent, visible recording indicator, deletion, retention, bandwidth and accessibility alternatives | I02, privacy review |

Do not couple free monthly practice to compulsory recording. Interview answers are practice content, not permission to update the user's employment history or submit claims to employers.

## Release evidence template

For each completed ticket record its identifier, commit, test commands/results, manual scenarios, screenshot or receipt where relevant, observed cost, open limitations and rollback flag. Store only redacted evidence; use synthetic data for routine tests.

Before a paid release confirm:

- The stated deliverable exists and the UI does not overclaim automation coverage.
- No known cross-user data access or unauthorized send path remains.
- Payment reconciliation and refunds work without trusting the browser.
- Support can explain every credit debit and application status.
- Provider outages and spending caps have been exercised.
- Documents and consent are versioned, and private data is excluded from public pages/search.
- Production monitoring and a tested backup recovery procedure exist.
- Relevant legal, merchant, source and OAuth requirements are resolved for enabled features.

## Recommended next implementation slice

Complete F01–F05 first, then P02–P05: a secure, editable, versioned profile and CV fact-review workflow. That foundation supports matching, documents, applications and interviews without locking the product into a particular AI provider or portal.

Do not implement the entire backlog in one change. Each slice should end with tested user-visible value and an explicit decision about whether the next investment is justified.
