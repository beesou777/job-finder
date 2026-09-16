# KamKhoj application intelligence strategy

Updated 16 September 2026. This is the product direction for future work.

## Current implementation

The current document generator is `template-v1`. It does not use Gemini, OpenAI, or another external AI provider. It uses a confirmed profile and stored job description to produce a grounded résumé and cover-letter draft, prioritizes matching skills and projects, records evidence and questions, and supports editing, review and export. It does not submit applications, create employer accounts, solve CAPTCHAs, answer assessments or spend credits.

## Intended product flow

For every vacancy, KamKhoj should first inspect the actual employer application destination, then tailor documents, then decide how to assist or submit:

`job record → destination inspection → capability decision → confirmed profile snapshot → grounded tailoring → factual checks → exact preview and price → user approval → assisted/permitted dispatch → receipt reconciliation`

A scraped listing is only an opportunity record. The linked destination may be an employer form, email address, Greenhouse, Lever, Workable, another ATS or a custom portal. The listing source does not prove that KamKhoj has permission or technical ability to submit there.

## Destination inspection

Create a bounded capability record containing the employer and vacancy URL, source identifiers, destination domain/ATS, inspection timestamp, vacancy status, required fields, file types and limits, login/MFA/CAPTCHA/assessment/signature/payment requirements, sensitive declarations, receipt signals, permission evidence, supported mode, expiry and failure notes.

Inspection is read-only. Use terms, robots rules, provider documentation, employer agreements and rate limits as separate evidence. Never send fake applications to inspect a flow, crawl behind login without user handoff, store portal passwords, or treat a public job page as permission for commercial scraping or automation. Bound redirects, pages, bytes and time; sanitize HTML; treat job and form text as untrusted input.

Classify each destination as `manual_handoff`, `assisted_review`, `permitted_native_submit` or `unsupported`. Login, MFA, CAPTCHA, assessments, signatures, changed forms, unclear permissions and unsupported sensitive declarations pause the flow for the user.

## AI and document rules

Gemini or another provider may be evaluated later for rewriting and ranking. The provider receives only the minimum confirmed profile and job content. The application layer validates structured output, blocks invented employers/dates/qualifications, records model/prompt/version/cost, and never gives the model authority to submit, change credits or alter consent. Missing requirements become questions. The model cannot decide that an application was submitted.

Tailoring should emphasize true relevant experience and reorder skills/projects. It must not add keywords merely because they appear in the vacancy. Show a diff against the profile revision used. During the initial launch, every generated document remains a user-reviewed draft.

## Paid modes

`assist`: create the documents, explain the destination, open the official page and provide suggested answers; the user submits.

`review_and_send`: supported adapter, exact approval of employer/job/profile/documents/answers/price, durable queue, cancellation before dispatch, idempotency and a receipt definition.

`bounded_auto_apply`: later opt-in with job criteria, exclusions, approved profile version, supported channels, daily/monthly caps, expiry and pause. Novel questions, changed forms, legal declarations, MFA, CAPTCHA and assessments return to review. Start with a small cap such as three applications per day after a destination pilot.

Charge for a defined reviewed pack, supported send or measured assistance. Show price before work; reserve, capture and refund credits transactionally. Do not charge for opening a portal or for a failed generation.

## Build order

1. Add a source/capability registry and destination inspection records. **Started:** `application_capabilities` now records destination mode, required fields, files, risk gates, evidence and receipt signals; the API exposes it in document context.
2. Build a read-only inspector for employer URLs and one approved test destination.
3. Add destination fields and review questions to document packs.
4. Evaluate one AI provider with malicious instructions, missing facts, conflicting dates and long descriptions; add cost instrumentation.
5. Ship assist mode with an application tracker and user-reported status.
6. Select one permitted email/native/employer channel and implement receipt reconciliation.
7. Add transactional credits and exact action quotes.
8. Pilot one destination with authorized users before considering bounded auto mode.

The first product-facing capability response is intentionally conservative. Guru Infosys is `assisted_review`: the service may prepare grounded documents and point the user to the official form, but CAPTCHA, CSRF session handling, confirmation and final submission remain user-controlled. This is the boundary for the paid service: preparation can be priced later, while unattended submission is disabled until permission, adapter reliability, duplicate prevention and a receipt definition are demonstrated.

No universal browser bot is planned. Automation is destination-specific, permissioned and measured. Before enabling it, require permission evidence, at least 50 authorized attempts across ten users, no duplicates or unauthorized sends, no critical factual errors, 95% resolved eligible outcomes, a kill switch, support procedure, audit trail and visible refund/unknown-outcome policy.

## First inspected destination: Guru Infosys

Inspected 16 September 2026:

- Vacancy: [Guru Infosys — Full Stack Developer](https://guruinfosys.com/careers/full-stack-developer/).
- Application page linked by the vacancy: `https://guruinfosys.com/jobs/full-stack-developer/apply/`.
- The vacancy page is a company-owned career page; no Greenhouse, Lever or other ATS identifier was found.
- The application page is a server-rendered form with `POST` and `multipart/form-data`. It includes a per-page Django CSRF token, so a client must retain the session cookie and token if it ever submits through an approved integration.
- Required fields observed: full name, email, phone, résumé upload, experience summary, CAPTCHA input and the accuracy confirmation checkbox.
- Optional fields observed: cover-letter upload and portfolio URL.
- Accepted résumé/letter formats shown: PDF, DOC and DOCX, with a 5 MB limit shown by the page.
- A visible CAPTCHA is present. KamKhoj must stop and hand the user control; it must never solve or bypass this CAPTCHA.
- The page does not expose a documented applicant API or a machine-readable submission receipt in the inspected HTML. Submission capability is therefore `assisted_review`/`manual_handoff`, not `permitted_native_submit`.
- The page source includes a single vacancy form and no evidence of a Greenhouse Job Board API. A public HTML form is not permission to automate commercial submissions.

For this destination, KamKhoj can prepare a tailored résumé, cover letter and experience summary, open the official application page, prefill only where the user explicitly takes over, and ask the user to solve the CAPTCHA and submit. The application tracker should record `user_action_required` until the user reports submission or a reliable receipt is supplied. Do not send a test application while researching this flow. Reinspect before use because fields, token behavior, CAPTCHA and vacancy status can change.
