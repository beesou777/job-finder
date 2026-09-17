# Manual application tracker

Implemented 16 September 2026. Code-only status; verification deferred.

The tracker is the next phase after document preparation. A user can add a reviewed document pack, open the saved official destination, submit on that destination, and select a status. The system intentionally calls the status `applied_user_reported`; it does not imply that the employer received, read or accepted the application. Outcome stages are separate enough for future email receipts.

API routes:

| Method | Route | Behavior |
| --- | --- | --- |
| GET | `/api/me/applications` | Latest 100 owned applications |
| POST | `/api/me/applications` | Create or return the user's existing tracker record for a job |
| PUT | `/api/me/applications/:id` | Update status/note with `expectedUpdatedAt` |
| DELETE | `/api/me/applications/:id` | Idempotently remove the owned record |

A document pack must belong to the current user and its version must match when it is attached. A repeated POST for the same user/job returns the existing record. The backend never accepts a client-supplied `userId`, receipt, verified status, credit amount or employer outcome.

The page is `/dashboard/applications`. The reviewed document editor adds the pack to the tracker, then links to the official destination and tracker. Job Matches still has its existing **Prepare documents** path. Opening an external link does not add a tracker record and does not mark an application.

## Deferred verification

The migration, API, cross-account access, duplicate creation, stale update, deletion, document-pack ownership and mobile/browser flows have not been executed. Before enabling it, apply the migration in a reviewed development database and test concurrent updates, closed/deleted jobs, missing document packs, account switching and unexpected provider responses. No real application should be sent as a test.

## Next boundary

The next slice is a paid catalog and quote preview, followed by an atomic job-seeker credit ledger. The tracker remains free. A credit is not deducted for opening a portal, preparing a no-charge draft, or recording a user-reported status.
