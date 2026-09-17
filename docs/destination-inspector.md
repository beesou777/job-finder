# Bounded destination inspector

Implemented 16 September 2026. **Code only; execution and release checks are deferred.**

## What this phase adds

An administrator can explicitly inspect the application URL already stored on a vacancy. The service performs HTTPS GET requests only. It never submits forms, executes scripts, solves challenges, sends cookies/authorization, follows form actions, or receives applicant CVs. It persists a bounded capability record, not the HTML.

Endpoint: `POST /api/me/application-capabilities/inspect`, authenticated admin only.

Body: `{ "jobRef": "the-existing-job-uuid" }` or a supported `linkedin-<external-id>` reference. Arbitrary URLs, extra properties and missing references are rejected. Existing document-context queries read the resulting capability; redirects remain associated with the original stored URL. Inspection is an operator workflow, not a job-seeker action or a paid service.

## Disabled-by-default configuration

Backend settings introduced by this phase:

- `APPLICATION_INSPECTION_ENABLED`: must explicitly equal `true`.
- `APPLICATION_INSPECTION_APPROVALS`: JSON array, default `[]`.

Each approval must contain `host`, `paths`, `permissionReference`, and ISO `reviewedAt`. Example shape only, not permission to access this example domain:

```json
[
  {
    "host": "careers.company.com",
    "paths": ["/jobs/"],
    "permissionReference": "Internal reference to actual read-access permission review",
    "reviewedAt": "2026-09-16T00:00:00.000Z"
  }
]
```

A path ending in `/` permits that prefix; other paths match exactly. Hosts match exactly, without wildcard subdomains. Approvals expire after seven days and future-dated approvals are rejected. Configuration is an operator assertion requiring real supporting evidence; neither a public form nor an allowlist entry creates legal permission. Check destination terms and obtain permission appropriate to the intended use before enabling.

No production configuration, migration or permission record was changed during implementation. The existing `application_capabilities` migration must already be applied before persistence. No additional schema migration is required.

## Network boundary

- HTTPS only, port 443, no URL credentials, query strings, IP-literal destinations or encoded paths.
- Resolve A records and reject all results if any address is private/reserved. This initial implementation deliberately does not support IPv6-only hosts.
- Pin the chosen IP for the TCP connection; keep original TLS server name and Host, with certificate verification enabled. No second DNS lookup for the request.
- Fetch `/robots.txt` first, without following robots redirects. Accept plain text 200 or missing 404; otherwise stop. Honor every Disallow conservatively across user-agent groups; ignore Allow exceptions. This may block permitted pages and is not a complete robots standard implementation.
- Fetch one HTML page with at most two redirects, each within the original approved origin/path set and rechecked against robots. At most four network requests total, including robots.
- Ten-second network deadline, 64 KiB robots body, 1 MiB HTML body, 16 KiB response headers. Reject compressed responses; request identity encoding. No subresource downloads or scripts.
- One in-flight inspection and one attempt/minute per backend process. Multiple replicas need a shared limiter before wider rollout. Admin-only access and the default-off gate remain necessary.
- Saving uses an advisory transaction lock with bounded DB lock/statement timeouts. Existing manually managed records and records associated with another job are not overwritten.

Deploy behind an outbound firewall as an additional control. Runtime network, DNS-rebinding, redirect, TLS, timeout and concurrency tests remain mandatory before enabling outside an isolated development environment.

## Extraction and classification

Inspect only one recognizable candidate form. Multiple forms, login, cross-origin form actions, unresolved base tags, excessive fields or meta-refresh result in manual handoff. No recognized form also means manual handoff. A readable form can produce assisted review, never native submission.

Collect bounded field names, labels, types and required flags; identify CAPTCHA, CSRF, declarations and sensitive field names as user-action gates. Ignore hidden values, existing applicant values and text-area answers. File formats are reported only where explicitly declared through known HTML accept values, using the intersection across uploads. Do not infer file-size limits from marketing text or guess missing requirements.

Store inspection time, expiry (at most 24 hours), HTML hash, byte count, redirect path, operator ID and permission reference. Do not store HTML, tokens or cookies. Form action evidence omits its query/fragment. Successful HTML access does not establish that a vacancy is open, that an employer is verified, or that a receipt exists. Dynamic forms and some custom challenges will be missed; the result always carries an HTML-only limitation.

## Verification deferred

Added non-network regression cases for IP/approval policies, robots patterns, form extraction, token/value exclusion, multiple forms, external actions and upload formats. They have not run. Tests of real HTTP/TLS/DNS behavior, persistence, role guards, redirects and failure handling still need an isolated fixture server/test environment. Do not count this as verified SSRF protection until those tests pass.

## Next implementation slice

Destination-aware answer drafts, followed by an owner-scoped application tracker. Distinguish prepared documents, user action required and user-reported submission from independently confirmed receipt. Keep submission adapters and charging off until their separate approval, ledger and receipt prerequisites are complete.
