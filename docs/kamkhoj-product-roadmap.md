# KamKhoj: Nepal-first job seeker platform roadmap

Prepared: 15 September 2026. Status: researched proposal, not an implementation or a revenue guarantee.

## 1. The decision

Build KamKhoj as a trusted application assistant for Nepal job seekers: find suitable openings, maintain an accurate career profile, prepare strong documents, submit through supported channels, and track what happened. Sell time saved and reliable service, not promises of employment or enormous application counts.

Start with assisted applications. Add automatic submission destination by destination, with permission, explicit user authorization, and evidence of delivery. Do not launch a universal browser bot as the foundation of the business.

Google signup should be optional. Reading Gmail should be a separate, optional integration introduced later. A user should be able to benefit without giving access to their inbox.

Sprout is a product reference, not a partner. Its public site advertises discovery, tailored documents, automation and tracking. The supplied screenshots demonstrate editable profile sections and AI preferences. They do not establish how Sprout implements submission or what agreements it has. No Sprout integration or partnership has been verified. [Sprout](https://www.usesprout.com/)

### Recommended launch boundaries

| Decision | Recommendation |
| --- | --- |
| Initial customer | Adult Nepal-based early-career and mid-career IT/digital job seekers; validate this segment before expanding |
| Initial geography | Nepal jobs and remote jobs explicitly accepting applicants located in Nepal |
| Core promise | Relevant opportunities, truthful application packs, less repetitive work, clear tracking |
| Free product | Browse/save jobs, editable profile, basic matching and tracking; one bounded text interview monthly |
| First paid product | Reviewed, downloadable tailored application packs |
| First submission channels | Verified partner-employer intake and explicitly advertised application email, with user approval |
| Portal applications | Manual handoff initially; permitted integrations added individually |
| Pricing | Prepaid service credits, with an explicit price before each action |
| Mail tracking | Manual status and selective user forwarding first; Gmail synchronization later |
| Interviews | Text first, turn-based voice next, optional recording last |
| Growth objective | More useful applications and interviews, not more spam |

## 2. What exists and what remains unverified

This assessment is based on files inspected in this repository. It is not a production security audit. Several screens call a separately hosted backend whose implementation is not present here. A working screen or installed package does not prove a secure, complete backend feature.

| Area | Evidence in current repository | Assessment |
| --- | --- | --- |
| Web foundation | `package.json`: Next.js 14, React 18, TypeScript, Yarn | Reuse; do not rewrite the frontend |
| Authentication | `lib/auth-context.tsx`: custom login, registration and session calls | Email/password integration exists; Google OAuth not demonstrated |
| Session storage | Same file stores bearer token in localStorage and a JavaScript-written cookie | Security foundation work before adding mail permissions and payments |
| CV upload | `components/CvUploadCard.tsx`, `/api/me/cv` calls | Upload/delete UI exists; storage, parsing accuracy and ownership enforcement unverified |
| Preferences | `app/dashboard/preferences/page.tsx` | Existing preferences screen; extend verified backend contracts |
| Matching/saved jobs | `app/dashboard/matches/page.tsx` | Existing UI and service calls; matching quality and implementation unverified |
| Job data | `server/services/data-fetching.ts` calls external jobs/category APIs | Useful integration; source permissions and backend ingestion unverified |
| Apply action | `app/apply/[id]/route.ts` adds UTM parameters and redirects | An outbound click, not a completed application |
| Interview practice | `app/(tools)/interview-practice/page.tsx` calls session/evaluate endpoints | Text workflow exists; scoring quality, quotas and backend unverified |
| Credits/payments | No implementation established in inspected flow | Plan as new capability until backend audit proves otherwise |
| Gmail/portal adapters | No implementation established | New capabilities |

The job-fetching service can return an empty list after an API failure. Plan a distinct unavailable/error state; do not tell users there are no jobs when the backend is down.

`ARCHITECTURE.md` must be reconciled against the current deployment. Its descriptions are not sufficient evidence of backend code existing here. Do not estimate a percentage complete until the backend repository, schema, deployments and tests are inspected.

## 3. The complete user journey

1. Visitor sees real jobs, transparent pricing and supported application methods.
2. User creates an account with email or Google; no mailbox permission requested.
3. User chooses role, experience level, location and employment preferences.
4. User uploads a CV or enters a profile manually. Extracted information is a draft.
5. User confirms critical facts, resolves missing details and saves the profile.
6. KamKhoj explains suitable jobs and flags unknown requirements.
7. User selects a job, sees its application channel and receives a credit quote.
8. AI prepares a document pack grounded in confirmed profile facts.
9. User reviews changes, screening answers and destination before approval.
10. KamKhoj either hands off to a portal, delivers through an approved channel, or asks for missing user action.
11. The tracker shows evidence-backed status, documents used and credit transactions.
12. User records or imports responses, prepares for interviews and updates preferences.

An external link click must never automatically become “Applied.” A prepared document must never become “Submitted.” Employer receipt must never become “Employer read it.”

## 4. Onboarding and editable profile

### Staged setup

Use a short initial wizard, then a permanent profile editor. Do not require every field in the screenshots before showing useful jobs. Save progress after each stage and allow resume later on another device.

| Stage | Collect | Required to continue |
| --- | --- | --- |
| Account | Name, verified email, chosen authentication method | Account verification |
| Job goals | Desired roles, seniority, work type, preferred locations, remote preference | At least one role and location/work-mode choice |
| Import | PDF/DOCX CV or manual entry | Either path, with clear parse failures |
| Confirm facts | Employment, dates, education, skills, contact details | User confirmation of facts used in applications |
| Preferences | Salary range/currency/period, availability, exclusions, relocation | Only requirements relevant to the selected workflow |
| AI and consent | Language, document settings, review mode, credit limits | Defaults acknowledged before paid work or submission |

### Profile sections

Provide Personal Information, Summary, Experience, Education, Skills and Certifications, Projects, Links, Languages, Volunteering, Achievements, Documents, and Application Preferences. Optional sections stay optional. Group related sections on mobile instead of reproducing a long desktop sidebar unchanged.

Store employer, role, dates, current-role flag, responsibilities and achievements separately. Store education institution, qualification and dates separately. Keep salary amount, currency, pay period and negotiability separate. Distinguish current location, desired work location and work authorization: one cannot be inferred from another.

For Nepal, support Unicode names, +977 phone numbers, municipality/district/province, NPR salary and monthly/yearly periods. Store normalized dates consistently; if accepting Bikram Sambat input, label the calendar and validate conversion. Do not silently interpret an ambiguous date.

Every extracted fact needs provenance: source document/version, extraction confidence and user-confirmed status. Conflicting CV versions prompt reconciliation rather than overwriting confirmed data. Missing information stays unknown; AI must not invent employment, credentials, achievements, salary or eligibility.

Do not collect citizenship scans, caste, religion, marital status or other sensitive details by default. A particular employer form may require a user decision; ask only at that point and explain the destination. Avoid a general “Attributes” bucket that accumulates unnecessary sensitive information.

### Editing rules

- Maintain profile versions and document versions.
- Editing a profile invalidates approval for pending applications that depend on changed facts.
- Submitted applications retain an immutable snapshot of exactly what was sent.
- Let the user choose a base CV for different role families.
- Provide export, deletion and clear storage controls.
- Deleting a profile cannot recall documents already delivered to an employer; explain this before submission.

Acceptance: users can complete setup without a CV, correct extraction errors, resume interrupted setup, preview documents and understand which version a pending application uses.

## 5. Job inventory and matching

### Inventory quality first

For each opportunity, preserve its source URL, source identifier, original publication/deadline information, last verification timestamp, employer identity, location, eligibility, ingestion rights and supported application method. These are proposed requirements, not claims about the current database.

Normalize duplicates across permitted sources using employer, role, location and source identifiers. Keep provenance and avoid merging different openings merely because their titles match. Expired or unverifiable openings must not enter automatic submission queues. Display unknown salary honestly.

Audit existing ingestion permissions before expanding it. A publicly visible vacancy does not necessarily permit republication or automated collection.

### Recommended matching approach

Use structured rules for hard constraints and an explainable ranking for relevance. Start with existing database search and normalized skills; add embeddings only if measured matching quality requires them.

Hard constraints include user-excluded employers, location, explicit work authorization, job type and confirmed mandatory qualifications. An unknown requirement is a question, not a positive match. Do not infer nationality or eligibility from a name or a remote label.

For jobs passing hard constraints, an initial proposed ranking weights role fit 35%, skills 30%, experience 15%, location/work mode 10%, and compensation preference 10%. Treat missing values explicitly; these weights are a testable product hypothesis, not a validated probability of being hired.

Show “Why this matches,” “Possible gaps,” “Unknown requirements,” and “Application method.” Never label a relevance score as a hiring probability. Capture save, dismiss and correction feedback without penalizing candidates for protected characteristics.

Build a consented, anonymized evaluation set of at least 50 profile/job pairs before tuning. Ask target users to label useful versus unsuitable recommendations. Proposed beta gate: at least 70% of top-five recommendations rated worth considering, with no known hard-constraint violation in automatic queues.

## 6. AI documents and settings

### Settings to ship

| Setting | Default | Behavior |
| --- | --- | --- |
| Tailored cover letter | On when requested/appropriate | Short, job-specific, grounded in verified facts |
| Tailored resume | On for paid application pack | Reorder/emphasize true information; show a diff |
| Language | Match job language when confidently detected | User override; unsupported/unclear language prompts choice |
| Review before submission | On | Mandatory throughout initial beta |
| Gap questions | On when information is missing | Ask user, never invent an answer |
| Tone | Clear and professional | Optional concise/formal variants |
| Automatic mode | Off | Unavailable until channel and reliability gates pass |
| Spending limits | Explicit per-action quote; no background spending | Later daily and monthly credit caps |
| Employer exclusions | Empty with visible editor | Enforced before preparing and sending |
| Notifications | Transactional status enabled | Marketing preferences separate |

Pipeline: normalized job plus confirmed profile → structured draft → factual checks → deterministic document rendering → preview/diff → user approval. Keep model/provider, prompt version and token cost internally for debugging, without exposing private content in logs.

Use ordinary ATS-readable layouts: selectable text, clear headings, predictable dates, no essential information inside images. Support PDF first; add DOCX export when renderer quality is tested. Do not claim a universal ATS score or guaranteed screening success.

Treat CVs, job descriptions and emails as untrusted input. Their text must not authorize tools, change payment settings or override system rules. The model proposes content; application code validates facts, permissions, destinations and spending.

Benchmark candidate models on truthful extraction, useful tailoring, Nepali/English quality, schema adherence, latency and total cost. Choose the cheapest model that passes; do not select Grok solely because a quoted token rate looks low. No custom model training is necessary for launch.

## 7. Applying on a user's behalf

### Capability matrix

| Destination | Launch behavior | Automatic submission gate |
| --- | --- | --- |
| Verified employer using KamKhoj intake | Native application with approval | Employer agreement, secure intake, receipt and support process |
| Employer explicitly accepting email applications | Prepare email and attachments; user sends initially | Verified address, authorization and approved sending integration |
| Merojob | Manual handoff; review existing sourcing permissions | Written permission appropriate to intended integration |
| JobsNepal / KumariJob | Manual handoff | Current terms, permission and technical access verified; not established in this research |
| Greenhouse | Hosted application form unless employer integration exists | Employer-provided submission credentials and supported fields |
| Lever | Hosted application form unless employer integration exists | Employer-provided credentials and form compatibility |
| LinkedIn | Manual handoff | Officially permitted access; no unauthorized automation |
| Other ATS/custom portals | Manual handoff | Destination-specific approval, integration and reliable receipts |

Merojob's terms restrict commercial reuse and automated data collection. Do not interpret absence of a specific “auto-apply” clause as permission. [Merojob terms](https://merojob.com/terms-and-conditions)

Greenhouse exposes public job reads, but application submission requires a Job Board API key. Lever's submission API also requires an employer-side API key. Public vacancy access is not universal applicant-side submission access. [Greenhouse API](https://developers.greenhouse.io/job-board.html), [Lever API](https://github.com/lever/postings-api)

LinkedIn prohibits unauthorized software that scrapes or automates activity. A browser extension operating inside the user's browser does not remove that restriction. [LinkedIn policy](https://www.linkedin.com/help/linkedin/answer/a1341387/prohibited-software-and-extensions?lang=en)

### Three modes

1. **Assist:** create documents, suggest answers, open the destination. User submits. Label final status user-reported unless independently confirmed.
2. **Review and send:** user approves the exact employer, job, documents, answers, price and channel. KamKhoj submits through a supported integration.
3. **Bounded auto-apply:** later, user authorizes selected role/location criteria, approved profile version, supported channels, exclusions, daily count, spending cap and authorization expiry. Provide one-click pause/revoke. Novel screening questions or changed material facts return to review.

Start automatic mode with a proposed maximum of three applications per day, not hundreds. This is a quality limit, not permission to violate destination rules. Require renewal after 30 days as an initial product policy.

### Submission reliability

Use a durable queue and a destination-specific adapter. Each attempt has an idempotency key, approved snapshot and receipt strategy. Validate vacancy availability and consent immediately before dispatch. Prevent duplicate applications across retries and known duplicate listings.

Represent states separately:

`draft → needs_information → ready_for_review → approved → queued → submitting → submitted`

Additional outcomes: `needs_user_action`, `failed`, `submission_unknown`, `cancelled`. These are proposed states. A timeout after clicking submit is `submission_unknown`, not automatically failed: reconcile before retrying to avoid duplicates.

Recruiting outcomes form another timeline: `acknowledged`, `interview`, `rejected`, `offer`, `withdrawn`, with event source and confidence. Do not overwrite submission history when an email arrives.

Pause at CAPTCHA, MFA, account creation, assessments, signatures and unresolved legal declarations. Never bypass CAPTCHA, capture portal passwords, fabricate answers or take hiring tests on someone's behalf. Support user handoff rather than unattended evasion.

A future extension should request only supported-domain access and keep portal sessions in the user's browser. Explain that assisted desktop browsing is not cloud automation and may not work on mobile. Cloud browsers are a later, separately costed feature requiring stronger isolation and explicit session handling.

### Portal research before implementation

Study 30 representative application flows without sending fake applications. Record destination, required fields, file constraints, login/MFA, receipt behavior and permission status. Prioritize by the share of relevant jobs actually covered, not adapter count. Build one permitted adapter, prove it, then expand.

For partnerships, request rights to display vacancies, freshness/deletion rules, submission access, candidate consent obligations, receipt/status APIs, rate limits, branding and fees. Do not contact partners or imply an agreement without a separate authorized outreach step.

## 8. Google identity, sending email and receiving replies

### Separate permissions

Google identity is for authentication. Mail sending and mail reading are additional permissions. Keep email/password available; connect identities carefully using provider subject identifiers and verified ownership, not blind matching of email strings. [Google sign-in overview](https://developers.google.com/identity/gsi/web/guides/overview)

Gmail's send scope is sensitive; read, metadata and compose scopes are restricted. Even creating Gmail drafts can introduce restricted-scope requirements. Server-side handling of restricted data can require a security assessment, subject to Google's exceptions. Treat verification and assessment as a launch/budget dependency. [Gmail scopes](https://developers.google.com/workspace/gmail/api/auth/scopes), [restricted-scope verification](https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification)

### Rollout

**First:** downloadable attachments, copyable email, manual tracker and optional selective forwarding to a private per-user application address. Validate forwarding association, authenticate receiving webhooks and treat forwarded content as untrusted. Forwarding itself is not proof that a claimed sender is authentic.

**Next:** optional Gmail sending after the required approval. Show exact recipient/subject/body/attachments and capture authorization. If sending from KamKhoj's domain, identify KamKhoj transparently as acting for the applicant, use a verified reply address and configure domain authentication. Do not spoof the user's Gmail address.

**Later:** optional Gmail read synchronization after verification, security readiness and budget approval. Minimize fetched/stored content, offer disconnect/delete, and explain that query filters narrow processing but do not narrow the underlying OAuth permission. Respect Google's API user-data restrictions. [Google user-data policy](https://developers.google.com/workspace/workspace-api-user-data-developer-policy)

Associate messages using provider message/thread identifiers and known recipients, job/company context and application timestamps. Low-confidence associations require user correction. Provide a link to the original message rather than copying entire inboxes.

Gmail push notifications require a maintained watch and history processing; renew the watch and recover missed events. Notifications are signals to fetch changes, not a complete email payload. [Gmail push guide](https://developers.google.com/workspace/gmail/api/guides/push)

Never infer employer interest from an automated acknowledgment. Track “sent,” “delivery problem,” “acknowledged” and “interview invitation” separately. Draft follow-ups for approval initially; do not automatically accept interview times, send attachments or reply to every message.

## 9. Credits, payments and earning money

### Product rules

Credits are internal service units, not withdrawable money or a transferable financial wallet. Display action price, deliverable, refund rule and remaining balance before work begins. Never promise employment, interviews or refunds conditional on getting a job.

Suggested beta pricing is a hypothesis to test with Nepal users, not a validated market price:

| Offering | Proposed price | Intended delivery |
| --- | --- | --- |
| Free | NPR 0 | Profile, basic matching/tracking, one text interview per calendar month |
| Starter | NPR 299 / 20 credits | Occasional paid assistance |
| Active | NPR 799 / 60 credits | More frequent use without a recurring commitment |
| Application document pack | 3 credits | Tailored resume plus cover letter where useful, preview and export |
| Standalone cover letter | 1 credit | Reviewable draft/export; not charged again inside a pack |
| Supported send | Additional 1 credit | Only after supported delivery confirmation; not yet priced for cloud browser automation |
| Additional bounded text interview | 2 credits | Up to eight questions with a feedback report |

At these prices a pack costs approximately NPR 40–45 and a pack plus supported send NPR 53–60. Free manual submission remains possible. Do not charge a send fee for merely opening an external portal. Managed human assistance and expensive browser workflows need separate pricing after measurement.

Allow one pre-delivery revision inside a pack's bounded generation budget. A failed generation is not a delivered service. Charge separately only when the user explicitly requests a new pack or a new scope. Show a demo/sample before purchase; optional trial credits need a capped promotional budget.

For beta, avoid expiring purchased credits while the service operates; define promotional-credit expiry clearly. Publish an unused-balance/service-discontinuation policy reviewed for applicable obligations. Do not describe a credits purchase as a subscription unless it actually renews.

### Ledger design

Keep append-only transactions for purchase, grant, reservation, capture, release, refund and adjustment. Use integer credit units and integer currency minor units. Enforce balance checks transactionally. Browser state must never be the authority for balance or payment success.

Reserve before work; capture document credits when the usable artifact is delivered. Reserve a separate send fee and capture only on channel-defined confirmation. Release failed or cancelled work. For an unknown send outcome, reconcile within a defined support window; if evidence remains unavailable after 24 hours, release the send fee and leave status unknown. Do not silently retry or later charge without fresh authorization.

Make payment callbacks, jobs and refunds idempotent. A repeated webhook must not mint credits twice. Check provider, merchant order, amount, currency and final transaction status server-side. Khalti documents lookup verification and successful completion status; eSewa documents signed requests and transaction verification. [Khalti checkout](https://docs.khalti.com/khalti-epayment/), [eSewa ePay](https://developer.esewa.com.np/pages/Epay)

Use one Nepal gateway first, recommended Khalti if merchant onboarding is available; otherwise choose the gateway that approves your business and economics. Merchant approval, fees, settlement, refunds, tax treatment and business requirements need direct confirmation. They are not assumed free or already approved.

## 10. Budget and unit economics

Registered users do not determine API cost; actions, retries, document sizes, audio minutes and support do. The following are planning scenarios, not supplier quotes. USD and NPR are kept separate; use the actual settlement exchange rate when setting margins.

For illustration, the checked xAI price page lists Grok 4.3 short-context input at $1.25/million tokens and output at $2.50/million. A document workflow with 20,000 input tokens and 3,000 billed output tokens costs $0.0325 before retries/tools. The output budget must include billable reasoning where applicable. This is an estimate, not a measured KamKhoj request. [xAI pricing](https://docs.x.ai/developers/pricing)

Use a provisional **$0.05 per completed document pack** allowance, then measure p50/p95 costs. Stop or reprice if the allowance is exceeded persistently.

| Monthly scenario | 100 registered users | 200 registered users |
| --- | --- | --- |
| Assumed active users | 40 | 80 |
| Packs per active user | 10 | 10 |
| Total packs | 400 | 800 |
| Document AI allowance | $20 | $40 |
| Initial/revised profile parsing allowance | $3 | $6 |
| Monthly free text interview ceiling, assuming all registered users use it at $0.05 each | $5 | $10 |
| Hosting/database allowance | $15–30 | $15–40 |
| Storage/email/monitoring allowance | $5–15 | $5–20 |
| Subtotal | $48–73 | $76–116 |
| With 20% contingency | About $58–88 | About $92–139 |

These figures exclude engineering wages, marketing, gateway fees, taxes, paid job feeds, legal advice, Gmail assessment, human application work and cloud browser automation. Profile/interview allowances are assumptions requiring measurement. Existing paid hosting could reduce incremental cost; free tiers may reduce early bills but are not a reliability or commercial-use guarantee.

Usage stress case: if all 200 users request 20 packs, 4,000 packs alone consume approximately $200 at the allowance. Set provider hard limits, per-user quotas, maximum retries and daily spend alerts before beta. Set an initial internal warning at $50/month and pause nonessential free AI at a founder-approved ceiling; do not interrupt already-paid delivery without explaining/refunding it.

### Revenue reality

If 10 of 100 registered users buy the NPR 799 pack, gross cash sales are NPR 7,990. If 20 of 200 do, sales are NPR 15,980. These are arithmetic scenarios, not conversion forecasts, and do not necessarily correspond to the usage table above.

Cash collected for credits is not automatically earned revenue: unused credits remain a future service obligation. Track issued, consumed and outstanding credits separately with your accountant.

For each action calculate:

`contribution = consumed-credit revenue - model cost - delivery cost - payment allocation - support/refund allowance`

Break-even paying customers equal monthly fixed operating cost divided by average monthly contribution per paying customer, in the same currency. A plan that requires frequent manual troubleshooting can lose money even when AI tokens are cheap.

Commercial gate: measured contribution margin of at least 60% for document packs and positive contribution for every supported send channel, after realistic refunds and support allocation. These are founder targets, not industry facts. If willingness to pay does not cover delivery, change scope or price before expanding.

## 11. AI interviews

Keep the existing text experience as the starting point. Generate role/CV-specific questions, ask one at a time, evaluate against a transparent rubric and provide an improvement plan. Do not market automated feedback as an employer certification.

For the free monthly entitlement, propose eight questions and one report per verified adult account per calendar month in Asia/Kathmandu. Interrupted sessions can resume without consuming a second entitlement. Avoid unlimited regenerations. Enforce quotas server-side and count completed delivery consistently.

Then add turn-based voice: record one answer, transcribe, evaluate, speak the next question. This is easier to bound than an always-connected live voice room. Speech APIs are not assumed free; self-hosted models still require compute and maintenance. Price voice separately using measured transcription, synthesis, model and storage costs.

Only later add live voice/video. Camera and screen recording should be opt-in for practice, with visible indicators, stop controls and deletion. Recordings do not prove identity, honesty or lack of cheating. Do not analyze facial emotion or claim employability from appearance. Offer text/audio alternatives for low-bandwidth and accessibility.

Before implementation, inspect camera/microphone Permissions-Policy headers, secure context requirements, browser support and upload limits. Set a proposed seven-day default recording retention with user deletion; retain feedback separately only with a stated policy. Do not offer employer-facing proctoring until its consent, accuracy and legal requirements have been independently reviewed.

## 12. Technical blueprint

Reuse the frontend and inspect the existing backend before choosing new infrastructure. Recommended initial shape: one modular backend, relational database, private document storage, a durable worker and provider adapters. No microservice fleet, vector database or dedicated GPU is required merely to launch.

### Proposed entities, not existing schema

| Entity group | Purpose and invariants |
| --- | --- |
| Identity/session | User, linked identity, secure session, account verification |
| Profile | Versioned profile facts, preferences and provenance |
| Documents | Private object key, owner, content hash, version, parse result, retention |
| Jobs/sources | Canonical job, source references, permission/capability record, verification dates |
| AI preferences | Versioned settings, language, budget and automation limits |
| Consent | User, authorized action/channel, scope, snapshot, expiry and revocation |
| Applications | Job/user, immutable pack, answer snapshot, state and approval |
| Attempts/events | Destination, idempotency key, timestamps, receipt, error category |
| Billing | Price version, ledger, reservation, payment order and provider receipt |
| Mail | Connection metadata, encrypted tokens, minimal message associations |
| Interviews | Entitlement, session, answers, report and optional recording references |

Keep module boundaries: identity, profile, inventory, matching, documents, applications, billing, messaging and interviews. Reuse verified existing `/api/me/*` contracts where possible. Publish an OpenAPI contract after backend inspection instead of coding against invented endpoints.

The request handler should validate/enqueue, not run a long application browser session. Workers need leases, retry limits, cancellation, timeouts and an operator-visible dead-letter queue. At-least-once delivery requires idempotent effects; do not promise exactly-once external submissions when a portal supplies no such guarantee.

At this scale, use a durable database-backed queue if it fits the real backend; adopt another queue only for a demonstrated need. Isolate destination credentials and document access. Keep network destinations allowlisted; block private-network URL fetches and unsafe redirects to reduce SSRF risk.

### Security and operational requirements

- Migrate toward server-issued Secure, HttpOnly sessions with appropriate SameSite and CSRF protections; account for actual cross-origin backend deployment.
- Encrypt OAuth refresh tokens at rest; never send provider secrets to the browser or logs.
- Enforce ownership on every profile, document, credit and application operation.
- Validate MIME/content/size; quarantine unsafe files and prevent public document URLs.
- Keep model prompts, private CVs and mailbox bodies out of ordinary analytics/error logs.
- Separate admin roles; audit support access and financial adjustments.
- Provide deletion/export, backup restoration, incident response and token revocation.
- Test prompt injection from jobs/CVs/emails against spending and tool permissions.
- Rate-limit free AI and authentication without invasive device fingerprinting.
- Distinguish a denied permission, expired credential, portal change and provider outage in UI and support tools.

Proposed retention defaults: private documents until user deletion/account closure; raw extraction intermediates 24 hours; selected mail bodies up to 30 days only where needed; voice/video recordings seven days. Financial records may require longer retention: obtain local accounting/legal advice before publishing exact commitments. Deletion must include derived data and a documented backup-expiry process.

## 13. Delivery phases and completion gates

Estimates below are engineer-weeks for one experienced full-stack engineer with access to the real backend. They exclude external approval waiting and assume no major rewrite. They are not fixed delivery commitments.

| Phase | Scope | Effort | Must be true before moving on |
| --- | --- | --- | --- |
| 0. Reality and permissions | Backend audit, authentication review, source rights, user interviews, baseline metrics | 1–2 weeks | Real feature inventory; safe source plan; first segment confirmed |
| 1. Profile foundation | Optional Google login, staged onboarding, versioned profile/CV, privacy controls | 2–3 weeks | Users can correct/export/delete data; ownership/session tests pass |
| 2. Matching and packs | Verified inventory, explainable matches, AI settings, document diff/export | 2–3 weeks | No invented critical facts in evaluation; usable documents and measured costs |
| 3. Tracker and credits | Application lifecycle, manual handoff, ledger, one payment gateway, refunds | 2–3 weeks | No duplicate credits; accurate statuses; transparent paid delivery |
| 4. Supported sending | One partner/native/email channel, receipts, consent and reconciliation | 2–4 weeks | Real opt-in pilot proves safe delivery and failure handling |
| 5. Portal integrations | Permission review, one or two adapters, user handoff, bounded auto mode | 3–6 weeks | Permission and reliability gates met per destination |
| 6. Mail intelligence | Selective forwarding first; optional verified Gmail integration | 1–2 weeks forwarding; 2–4 weeks Gmail engineering | Correct associations, deletion/revocation; Google requirements satisfied |
| 7. Interview expansion | Reliable text quotas, then voice, optional recording | 1–2 weeks text hardening; 2–4 voice; 3–5 recording | Quality, cost, accessibility and privacy gates pass |
| 8. Scale and growth | More permitted channels, employer partnerships, referral/cohort optimization | Ongoing | Retention and contribution justify each expansion |

Phases 0–3 imply roughly 7–11 full-time engineer-weeks for a paid assisted beta, subject to backend condition and payment approval. Reliable multi-portal automation is a several-month project with external dependencies, not another toggle. Mail and interview work can follow demonstrated demand; neither should block document-pack revenue.

### Phase 0 checklist

Locate backend code and production topology; verify migrations, auth, storage and AI billing. Record which UI flows work end-to-end with test accounts. Audit source agreements, expired jobs, duplicate jobs and error states. Interview ten target job seekers and five employers. Validate willingness to pay for packs without automation. Choose one permitted submission pilot and open payment/OAuth prerequisite work.

### Phase 1 checklist

Ship save-and-resume onboarding, profile provenance, extraction review, versioning and secure access. Test with five users on mobile and slow connections. Treat missing CV text and conflicting dates as normal supported states. Provide public privacy/support pages before asking for additional sensitive access.

### Phase 2 checklist

Build the labeled matching/document evaluation set. Compare model candidates. Implement factual checks, revision budget, preview and exports. Run at least 50 document cases including employment gaps, Nepali names, mixed-language content and missing salary. Block release for invented employers, qualifications or eligibility in the test set.

### Phase 3 checklist

Launch a tracker distinguishing manual claims from receipts. Implement sandbox payments, ledger reservations/refunds and duplicate-webhook/concurrent-spend tests. Beta with 20–30 invited users; charge only after explaining exactly what is delivered. Publish support and refund procedures. Confirm willingness to pay before broad acquisition.

### Phases 4–5 checklist

Prove one channel using real applications authorized by their owners. Proposed release gate: at least 50 authorized submissions across at least ten users, zero duplicate sends, zero critical factual misrepresentations, and at least 95% resolved outcomes for eligible attempts. Include failures in reporting and show the excluded/unsupported share. A small pilot is not proof of universal reliability.

Enable bounded auto mode only after the same channel passes consent-revocation, stale-job, unknown-outcome and duplicate-prevention tests. Any duplicate, unauthorized send or critical data exposure pauses the affected channel. Maintain a kill switch and manual support path.

### Phases 6–8 checklist

Ship forwarding before broad mailbox access. Validate email association against at least 100 consented examples, including unrelated messages, phishing and ambiguous company names. Add voice only after measuring interview usage and unit economics. Expand portal coverage according to requested jobs and support burden, not a competitor checklist.

## 14. Nepal-first distribution and differentiation

Win a narrow segment before claiming to be Nepal's best platform. Start with a cohort of 20–30 job seekers from colleges, developer communities and early-career networks. Offer onboarding assistance to observe where they struggle; count that labor in your economics.

Differentiate through verified deadlines, Nepal eligibility, realistic salary handling, bilingual support, local payments, accurate profiles and visible submission proof. Build a small employer network that accepts structured applications directly; it reduces reliance on restricted portals and can improve feedback quality.

Interview users who abandon onboarding, decline payment or request refunds. Track why recommendations fail: location, seniority, salary, stale vacancy or poor documents. Publish honest educational content and permissioned success stories, not invented user counts or testimonials.

Keep public job/content pages indexable when appropriate and private profiles, CVs, dashboards and application history protected. Structured data must match visible facts. SEO and AI-search exposure can support acquisition but cannot guarantee rankings or citations; do not budget revenue on automatic search visibility.

Offer referral credit only after meaningful activation or a verified purchase, with a capped budget. Avoid unlimited signup rewards. Seek campus/employer partnerships with explicit terms; do not resell candidate data or quietly prioritize sponsored jobs as best matches.

### Metrics that matter

| Metric | Why it matters |
| --- | --- |
| Verified profile completion | Measures whether onboarding produces usable facts |
| Time to first useful match/pack | Measures initial value, not page views |
| Match acceptance and dismissal reasons | Measures relevance |
| Critical document correction rate | Measures trust and factual quality |
| Supported share of desired applications | Measures genuine automation coverage |
| Confirmed submissions / all attempted submissions | Measures reliability, including failures |
| Unknown outcomes and duplicate sends | Exposes operational risk |
| Interviews per 100 confirmed applications | Useful outcome, with source and observation window |
| Paid conversion and repeat credit purchase | Measures willingness to pay and retention |
| Contribution per action and support minutes | Measures whether growth earns money |

Interview and offer rates are observational; they cannot prove KamKhoj caused the outcome. Report sample sizes and follow-up windows. A job seeker leaving because they found work can be a success, not ordinary churn.

## 15. Immediate execution order

1. Inspect the separate backend and replace assumptions with a verified inventory.
2. Audit source permissions and current authentication before collecting more sensitive data.
3. Validate the initial customer segment and pack pricing with ten conversations.
4. Implement secure, editable profile onboarding and confirmed CV facts.
5. Build reviewed document packs and explainable matching.
6. Add tracker, atomic credits and one verified payment gateway.
7. Run a small paid assisted beta and measure costs/outcomes.
8. Add one permitted submission channel, then bounded automation.
9. Add optional mail synchronization and voice interviews only when justified.

Detailed engineering tickets and acceptance tests are in [the implementation backlog](./kamkhoj-implementation-backlog.md).

## 16. Research boundaries and unresolved dependencies

Official product/developer sources are linked beside the claims they support. Pricing was checked for this planning exercise and must be rechecked before purchasing or publishing prices. The source sites' terms are not a substitute for local legal advice.

Not established: production backend behavior; real user count or conversion; paid source rights; any Sprout/ATS/portal partnership; JobsNepal or KumariJob automation permission; merchant approval/fees; Google verification outcome; Gmail assessment cost; model quality on KamKhoj data; real delivery cost or reliability.

The attempted JobsNepal and KumariJob terms URLs could not be retrieved in this research. Their status is unknown, not approved. Merojob's terms were accessible and identify restrictions relevant to sourcing and automation. No portal accounts were accessed, applications submitted, inboxes connected, payments initiated or partners contacted while preparing this roadmap.

The recommendation is intentionally commercially staged: earn trust and initial revenue from reliable assistance, then use measured demand and margins to fund broader automation.
