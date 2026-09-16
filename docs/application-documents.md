# Application documents: implementation handoff

Date: 16 September 2026. Status: code written; all execution and release verification deferred at the user's request. This is the first document-generation slice (D01/D02 and part of D03/D04), not completion of the entire roadmap phase.

## User flow

1. Save and confirm the latest career profile.
2. Open Matches and choose **Prepare documents** on a job row, mobile card or job-detail modal.
3. The Documents page loads the job and confirmed profile version. It shows which profile settings affect the draft and that no credits are charged.
4. Create a document pack. A deterministic template preserves profile facts, prioritizes skill mentions and relevant projects, and optionally prepares a cover letter.
5. Edit the résumé or cover letter, preview the text, and save a new immutable revision. Edits change the pack only, not the career profile.
6. Review both documents and explicitly mark that saved version as reviewed. This is document review only, not application or spending authorization.
7. Download saved text or a self-contained printable HTML file. Open the HTML file and use the browser's Print > Save as PDF. This is not a server-generated or verified PDF export.

The Documents navigation works on desktop and mobile. The library lists up to 100 owned packs. Each pack has a saved revision list, recovery text download, and explicit deletion of the pack plus its revisions. Open a historical revision to read either document or copy both into the editor; saving restores it as a new revision without changing history. Compare changes shows the differing block between common opening/closing lines, against the current saved version or the historical version selected. It is a bounded linear text comparison rather than a semantic or minimal line diff.

## Generation rules and settings

- `tailorResume`: places exact skill mentions first and sorts projects by those skills; preserves employment chronology and original facts. Off preserves profile ordering.
- `coverLetter`: includes or omits the initial cover letter. The editor still allows manually writing a letter.
- `gapQuestions`: shows review questions for missing profile sections and requirements. It does not invent answers or automatically update facts.
- `language`: English or Nepali headings and cover-letter connective text. Auto uses Devanagari in the vacancy title to choose Nepali; otherwise English. Profile facts retain their original language. This is a simple script heuristic, not a translation service or general language detector.
- `reviewBeforeSubmit` and `autoApply` do not enable sending. No employer message or submission adapter exists in this module.
- Generator `template-v1` uses no external model. Names, qualifications, employers, dates and achievements come from the confirmed profile. Job text only affects ranking and vacancy details in the letter.
- The paid product direction is broader application assistance: inspect the employer destination first, classify it as manual, assisted, permitted native submission or unsupported, then tailor documents and collect explicit approval. See [application intelligence strategy](./application-intelligence-strategy.md).
- Evidence contains original profile section paths, skill mentions, limitations and review questions. After manual edits, the UI explains that these notes describe the original draft and do not verify new user claims.

Supported jobs are existing platform UUID records and `linkedin-<external job_id>` references emitted by Matches. Closed/inactive platform vacancies are rejected. LinkedIn availability is explicitly unknown because the current entity does not expose a reliable expiry/status field. Remote-only records outside these identifiers are not supported by this slice. Job URLs are stored for reference only and never fetched by generation.

## Persistence and request behavior

Backend: `C:/Users/bishwa shah/Desktop/job-finder-backend/src/modules/application-documents`.

Tables: `application_document_packs` and `application_document_revisions`. A pack pins an owning account, exact profile revision, bounded vacancy snapshot and hash. Each edit appends a document revision. Account/profile deletion cascades to owned packs; pack deletion cascades to revisions. Up to 100 packs per user and 100 revisions per pack bound storage. Resume text is limited to 600,000 characters to accommodate a fully populated valid profile, and cover letters to 30,000; this API also has a scoped 2 MB JSON-body limit for multilingual documents. The byte limit can be reached before the character limit for heavily escaped or multibyte text. Production storage quotas and retention still require evaluation.

Creation is serialized by the owning user row, checks an expected confirmed-profile version, and accepts a unique per-user request UUID. Retries with the same UUID return the existing pack; a changed payload cannot reuse it. The client keeps the request UUID and original input across a timeout while the creation screen remains mounted. Reloading the entire browser loses this in-memory key, so users should inspect the library before starting another draft after an unknown outcome.

Edits/review check `expectedVersion`; stale writes return 409. A changed document clears review. A changed or unconfirmed profile or changed/closed/missing vacancy makes review invalid when the pack is read; previously recorded review timestamps remain historical metadata. A new pack is required to use a newer source snapshot. Job changes are compared against fields actually included in the bounded snapshot.

Downloads check the displayed saved document version and only return owned content. Draft downloads are allowed and clearly labeled in the workspace. HTML export escapes all document content, contains no scripts or remote assets, and carries restrictive CSP. The account email is snapshotted into generated text at creation; an email-only account change is not a profile revision and does not currently invalidate document review.

## API

All routes are authenticated under `/api/me/document-packs` and use owner-scoped queries. Request bodies are strict schemas; clients cannot choose ownership, job content, generated claims, provider charges, or review timestamps.

| Method/path | Purpose |
| --- | --- |
| `GET /context?jobRef=…` | Current job and profile confirmation/settings |
| `GET /` | Owned library summaries |
| `POST /` | Create from `jobRef`, `expectedProfileVersion`, `requestId` |
| `GET /:id` | Current content, evidence and review validity |
| `PUT /:id` | Append edited `content` with `expectedVersion` |
| `PUT /:id/review` | Review `expectedVersion` with `confirmAccurate: true` |
| `GET /:id/history` | Revision numbers, origins and timestamps |
| `GET /:id/revisions/:version` | Owned historical content for inspection and restoration |
| `GET /:id/export/:kind?format=txt|html&version=N` | Download saved résumé or cover letter |
| `DELETE /:id` | Delete owned pack and revisions; idempotent |

Generation logs only generator name, duration and zero provider calls/credits. This is basic instrumentation for a local template; actual provider token usage, retries and cost accounting remain D05 work. Existing application authentication/session behavior is unchanged.

## Rollout and continuation

New migration: `1789600000000-application-document-packs.ts`. Requires the existing career-profile-revisions migration and a reviewed migration history. New entities are registered in `ALL_ENTITIES`. No schema synchronization or application database mutation was performed.

`APPLICATION_DOCUMENTS_ENABLED` defaults off. After reviewing/applying migrations in development, set it to `true` and restart the backend. Setting it back to `false` disables the document API while retaining data. The disabled API returns a clear 503; its dashboard links still appear. Reverting the migration destroys document packs/revisions and must not be used merely to disable the feature.

No typecheck, build, lint, formatter, tests, browser session, migration or deployment was run for this slice, as requested. Earlier passing checks in the progress log do not validate these new files. A later profile-save payload hardening fix validates the client payload before sending and makes missing request bodies explicit; it also was not executed through a check command.

Before release, verify the actual confirmed-profile → job → pack → edit/review → download flow; cross-account access; create retries; concurrent edits; profile/vacancy invalidation; rollback and migration history; deletion; large Unicode payloads; malicious markup in job/profile text; HTML/PDF page breaks and Nepali fonts; keyboard/mobile use and session changes. Clicked links and document exits warn about unsaved text; browser history/programmatic navigation does not yet have full blocking coverage.

Still to implement: stronger semantic tailoring and factual evaluation, full translation, field-level provenance after edits, verified server-side PDF rendering, paid action quotes/ledger, provider cost accounting and application submission/tracking. Matching's pending evaluation and the earlier profile browser/migration checks remain pending too.
