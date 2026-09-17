# KamKhoj: Commercial-First Product Roadmap

**Updated:** 16 September 2026  
**Status:** commercial-first product plan and implementation roadmap  
**Primary objective:** prove that KamKhoj can create repeatable paid value for job seekers before investing heavily in broad automation.

---

## 1. Product decision

KamKhoj should not be positioned primarily as another Nepal job board or scraper.

The product should become a **job-search operating system for people in Nepal**:

> **Find relevant jobs → understand the match → prepare a stronger application → apply through the official channel → track the outcome → prepare for interviews.**

The existing job aggregation infrastructure is the supply layer underneath the product. The user-facing value is the ability to turn a candidate's real profile and current vacancies into useful actions.

### Immediate commercial principle

KamKhoj must prove revenue before expanding into expensive or operationally risky features.

The first milestones are:

1. Earn the first **NPR 1,000** from real users.
2. Reach **NPR 10,000 cumulative revenue**.
3. Reach **NPR 50,000 monthly gross revenue** with acceptable delivery cost and support burden.
4. Only then expand aggressively into automation, employer products, mail integrations, and more expensive AI features.

These are operating milestones, not revenue guarantees.

---

## 2. What KamKhoj is now

KamKhoj has five product layers.

| Layer    | User value                                                         |
| -------- | ------------------------------------------------------------------ |
| Discover | Current Nepal and Nepal-eligible remote jobs                       |
| Match    | Jobs relevant to the candidate's actual profile                    |
| Apply    | Better CVs, cover letters, emails and application answers          |
| Track    | Saved, prepared, applied, acknowledged, interview, rejected, offer |
| Prepare  | Job-specific interview practice                                    |

Everything else should support these five layers.

### Positioning

Do not market KamKhoj as:

- an AI revolution,
- a guaranteed job finder,
- a universal auto-apply bot,
- a huge scraped job database,
- or an ATS score generator.

A better message is:

> **KamKhoj understands your career profile, finds jobs that fit you, and helps you prepare stronger applications for them.**

Later, after employer-side validation:

> **KamKhoj helps employers receive structured applications from relevant candidates.**

---

## 3. The business model: free discovery, paid action

The free product should build trust and intent. Paid products should charge for meaningful, bounded deliverables.

### Free product

Launch with:

- browse and search jobs,
- CV upload,
- structured editable profile,
- job preferences,
- basic matching,
- clear match explanations,
- possible gaps and unknown requirements,
- saved jobs,
- basic application tracking,
- one limited CV analysis or sample application preview.

Do not lock ordinary job discovery behind payment.

### Paid Product A: Professional CV

**Beta price hypothesis: NPR 599**

Deliver:

- CV structure review,
- grammar and clarity improvement,
- stronger experience bullets grounded in real facts,
- ATS-readable layout,
- skill and section recommendations,
- polished PDF export,
- one bounded revision,
- initial human review by KamKhoj while quality is still being validated.

Do not invent achievements, employers, credentials, dates, salary, projects or skills.

### Paid Product B: Job-Specific Application Pack

**Beta price hypothesis: NPR 249 per job**

Deliver:

- job-specific CV tailoring,
- cover letter where appropriate,
- application email or message,
- screening-answer suggestions based only on confirmed facts,
- match explanation,
- important gaps and unknown requirements,
- official application destination.

The candidate reviews and submits during the initial phase.

### Paid Product C: Job Hunt Pack

**Beta price hypothesis: NPR 1,499**

Suggested delivery:

- one professional CV review,
- up to 10 curated relevant jobs,
- up to 5 job-specific application packs,
- application tracker,
- one text interview practice session,
- bounded human quality review during beta.

Do not sell unlimited generation.

### Pricing rules

These are experiments, not permanent prices.

Before broad launch:

- measure how long each delivery actually takes,
- measure AI/model cost,
- measure support and revision time,
- record refund requests,
- record repeat purchase behavior,
- test willingness to pay with real users.

Avoid a complicated credit economy at launch. Users should understand exactly what they are buying.

Credits can be introduced later if repeated actions make the model simpler rather than more confusing.

---

## 4. Revenue logic

KamKhoj should initially optimize for **revenue per satisfied customer**, not tiny transaction volume.

A low-price micro-credit model requires a large active user base. KamKhoj does not need that dependency during validation.

### Example gross-revenue scenarios for the NPR 1,499 pack

| Paying customers in a month | Approximate gross sales |
| --------------------------: | ----------------------: |
|                          10 |              NPR 14,990 |
|                          20 |              NPR 29,980 |
|                          35 |              NPR 52,465 |
|                          50 |              NPR 74,950 |

These are arithmetic illustrations, not conversion forecasts and not profit estimates.

Track contribution, not just sales:

`contribution = product revenue - model cost - payment cost - support cost - refund allowance - human review cost`

Human review is a real cost even if the founder performs it.

---

## 5. The minimum sellable KamKhoj

The launch flow should be extremely small.

```text
Upload CV
   ↓
Confirm extracted profile
   ↓
See relevant current jobs
   ↓
Understand why each job matches
   ↓
Choose a job
   ↓
Preview paid application help
   ↓
Pay
   ↓
Receive reviewed application pack
   ↓
Apply on the official destination
   ↓
Track the result
```

If this flow cannot produce paying repeat users, Gmail, browser automation and voice interviews will not fix the business.

---

## 6. The most important product screen

After onboarding, the dashboard should immediately combine job inventory, profile quality, matching and the paid action.

Example:

```text
Your profile is 82% complete

23 matching jobs
6 strong matches
4 new today

Backend Developer
XYZ Nepal

Strong match
✓ Node.js
✓ PostgreSQL
✓ 2+ years experience
✓ Kathmandu
△ Docker preferred
? Salary not disclosed

[View Job]   [Prepare Application]
```

This dashboard is more commercially important than a complicated homepage.

### Every match should show

- why the job is relevant,
- important requirements that are satisfied,
- possible gaps,
- unknown requirements,
- location/work-mode compatibility,
- salary status,
- official application method,
- verification/freshness information.

Never represent a relevance score as the probability of being hired.

---

## 7. Candidate profile foundation

A candidate profile should be a reusable career record, not merely extracted CV text.

### Profile sections

- Personal information
- Summary
- Experience
- Education
- Skills
- Certifications
- Projects
- Links
- Languages
- Volunteering
- Achievements
- Documents
- Job preferences
- Application preferences

### Required data rules

Store separately:

- employer,
- role,
- employment dates,
- responsibilities,
- achievements,
- institution,
- qualification,
- skills,
- location,
- desired location,
- remote preference,
- expected salary,
- currency,
- pay period,
- availability.

For Nepal, support:

- Unicode names,
- +977 phone numbers,
- Nepal administrative locations,
- NPR,
- monthly and yearly salary,
- explicit Bikram Sambat handling where supported.

### AI extraction rules

Every extracted fact should have:

- source document/version,
- extraction confidence,
- user confirmation state.

Missing information remains unknown.

AI must not fabricate:

- employment,
- achievements,
- qualifications,
- salaries,
- work authorization,
- projects,
- certifications,
- or eligibility.

---

## 8. Job inventory quality is the product foundation

KamKhoj fails if job data is unreliable.

Prioritize trust over raw job count.

A smaller inventory of accurate current vacancies is more valuable than a huge database containing stale, duplicate or incorrectly parsed listings.

### Minimum job record

Preserve:

- canonical employer,
- title,
- source URL,
- source identifier where available,
- source type,
- original publication date,
- deadline/expiry,
- last verified timestamp,
- job location,
- work mode,
- salary when published,
- employment type,
- experience requirement,
- required/preferred skills,
- qualification requirements,
- application destination,
- application method,
- source and collection provenance.

### Scraper quality gates

A scraped page should not automatically become a job.

High-priority signals:

1. valid role/job title,
2. meaningful job description,
3. identifiable employer,
4. publication date or deadline where provided,
5. application destination or application instructions,
6. location where available.

Reject or quarantine:

- generic vacancy index pages,
- company homepages,
- board/executive pages,
- news articles,
- stale openings,
- pages whose actual job must still be discovered through another link,
- duplicated openings,
- pages where the description extractor captured navigation or unrelated site text.

The scraper should follow the actual vacancy link and extract the individual job page before publishing when required.

---

## 9. Matching strategy

Do not make matching unnecessarily complex during beta.

### Step 1: hard constraints

Use explicit rules for:

- user-excluded employers,
- location,
- work mode,
- job type,
- explicit work authorization,
- mandatory education,
- mandatory experience,
- clearly required skills where absence is disqualifying.

Unknown information is not a positive match.

### Step 2: relevance ranking

For jobs that pass hard constraints, rank using explainable factors such as:

- role fit,
- skill fit,
- experience fit,
- location/work-mode fit,
- compensation preference where known.

The exact weights should be treated as an experiment.

### Step 3: user feedback

Capture:

- save,
- dismiss,
- apply,
- not relevant,
- wrong location,
- wrong seniority,
- wrong domain,
- salary mismatch,
- expired job,
- incorrect requirement.

This feedback is more useful than endlessly adjusting a hidden AI prompt.

---

## 10. Paid document pipeline

The document system should behave as a controlled transformation pipeline.

```text
Confirmed candidate profile
        +
Normalized job requirements
        ↓
Structured draft
        ↓
Factual validation
        ↓
Deterministic document rendering
        ↓
Difference/preview
        ↓
Human review during beta
        ↓
User delivery
```

### Resume tailoring

Allowed:

- reorder real information,
- emphasize relevant experience,
- improve wording,
- make achievements clearer where the underlying fact is known,
- remove irrelevant detail,
- improve formatting.

Not allowed:

- add unknown skills,
- inflate seniority,
- invent metrics,
- alter employment dates,
- fabricate projects,
- claim experience the user does not have.

### Rendering

Start with:

- clean ATS-readable PDF,
- selectable text,
- predictable headings,
- simple date formatting,
- no important text inside graphics.

Add DOCX only when rendering is stable.

---

## 11. Manual review is a feature during beta

Do not automate away learning too early.

For the first paying customers:

1. AI generates the document.
2. KamKhoj performs a quick human quality review.
3. Errors are corrected before delivery.
4. Every correction is categorized.
5. Frequent corrections become automated validation rules.

Track correction categories such as:

- invented information,
- weak bullet writing,
- irrelevant emphasis,
- missing requirement,
- formatting problem,
- language problem,
- duplicate information,
- inaccurate job interpretation.

The goal is to remove human review gradually through measured reliability, not assumption.

---

## 12. Application behavior at launch

KamKhoj should prepare high-quality applications before attempting universal submission.

### Launch mode: Assist

For each supported job:

1. verify that the vacancy is still active,
2. identify the official destination,
3. prepare the candidate-specific application,
4. show documents and answers,
5. let the candidate review,
6. open the official application destination,
7. let the candidate mark the application as submitted,
8. distinguish user-reported status from verified delivery evidence.

A click on an external link is not an application.

A generated document is not a submission.

### Later: Review and send

Only for destinations where KamKhoj has a permitted and reliable sending mechanism.

The user approves:

- employer,
- vacancy,
- profile version,
- documents,
- answers,
- destination,
- price.

### Much later: bounded automatic submission

Only after destination-specific reliability and permission have been proven.

Pause for:

- CAPTCHA,
- MFA,
- signatures,
- legal declarations,
- assessments,
- unknown screening questions,
- missing candidate facts.

Never fabricate answers or bypass these controls.

---

## 13. Application tracker

The tracker should represent reality rather than optimistic guesses.

Suggested preparation/submission states:

`draft → needs_information → ready_for_review → prepared → applied_user_reported`

Later supported channels may add:

`approved → queued → submitting → submitted_verified`

Other outcomes:

- needs_user_action,
- failed,
- submission_unknown,
- cancelled.

Recruitment outcomes should remain a separate timeline:

- acknowledged,
- interview,
- rejected,
- offer,
- withdrawn.

Do not automatically mark an application as read because an automated acknowledgment arrived.

---

## 14. First-customer strategy

Do not depend on paid advertising for validation.

Start with a narrow group that has a clear problem.

Suggested first audiences:

- BCA / BSc CSIT / BIT graduates,
- junior developers,
- QA applicants,
- designers,
- digital marketers,
- accountants,
- administrative candidates,
- internship seekers,
- people who have sent many applications without receiving interviews.

### Initial sales message

Focus on the outcome:

> Upload your CV, see current jobs that fit your actual profile, and get your CV/application tailored for the jobs you want to apply to.

Avoid vague AI/startup language.

### First 10 paying customers

For each customer, record:

- acquisition source,
- product purchased,
- price,
- delivery time,
- model cost,
- human-review minutes,
- number of corrections,
- refund/revision request,
- whether they applied,
- whether they would buy again,
- whether an interview occurred later.

Talk to the customer after delivery.

---

## 15. Validation gates

Do not interpret signups as product-market fit.

### Gate A: usefulness

Before major expansion:

- users should regularly find relevant jobs,
- high-severity hard-constraint mistakes should be rare,
- paid documents should need few critical factual corrections.

### Gate B: willingness to pay

Evidence should include:

- real purchases,
- repeat purchases,
- low refund rates,
- users choosing paid application help without being pushed.

### Gate C: unit economics

Measure:

- contribution per CV,
- contribution per application pack,
- support minutes,
- AI cost,
- payment cost,
- revision cost.

### Gate D: retention

A job seeker eventually leaving after finding work can be success.

Therefore monitor:

- return visits while actively job seeking,
- repeat application purchases,
- number of useful matches,
- application completion,
- interview outcomes.

---

## 16. B2B experiment: start earlier, build later

Candidate products can generate initial revenue, but candidate lifetime is naturally limited: successful users eventually get jobs.

Employer-side revenue may become more durable.

Do not build a full employer ATS immediately.

### Early employer experiment

Once KamKhoj has a useful candidate pool:

1. allow selected employers to submit a vacancy,
2. normalize its requirements,
3. match consenting candidates,
4. let candidates approve applications,
5. send employers structured candidate applications,
6. measure employer satisfaction.

Initially this can be manually operated.

### Potential paid employer products later

- paid job listing,
- promoted listing clearly labeled as sponsored,
- candidate matching,
- shortlist preparation,
- structured applicant inbox,
- application management,
- recruiter workflow tools.

Never sell candidate data without appropriate consent.

Do not secretly rank paid employers as better matches.

---

## 17. Features intentionally deferred

These are not bad ideas. They are simply not required to validate revenue.

### Defer until demonstrated demand

- Gmail read synchronization,
- Gmail automatic sending,
- live voice interviews,
- video interview recording,
- universal browser agents,
- LinkedIn automation,
- multi-ATS automatic submission,
- large credit economy,
- complex subscriptions,
- mobile portal-session automation,
- microservice decomposition,
- vector databases without measured need,
- dedicated GPU infrastructure.

### Why

Each adds some combination of:

- external approvals,
- legal/terms risk,
- operational support,
- engineering complexity,
- privacy risk,
- provider cost,
- failure modes that do not directly prove willingness to pay.

---

## 18. Minimal technical architecture

Reuse the current frontend and inspect the real backend before rewriting infrastructure.

The commercial beta needs:

- authentication,
- secure sessions,
- user/profile module,
- private CV/document storage,
- job inventory,
- matching service,
- document-generation service,
- application tracker,
- payment integration,
- basic admin/support tooling,
- audit trail.

### Suggested module boundaries

- identity,
- profile,
- documents,
- inventory,
- matching,
- applications,
- billing,
- interviews later,
- employer tools later.

A modular monolith is sufficient unless real scale demonstrates another requirement.

---

## 19. Core entities

These are target concepts, not claims about the current backend schema.

| Entity              | Purpose                                    |
| ------------------- | ------------------------------------------ |
| User                | Identity and account state                 |
| ProfileVersion      | Confirmed structured career facts          |
| CandidatePreference | Role/location/work/salary preferences      |
| Document            | CV/source/rendered artifact and version    |
| Job                 | Canonical normalized vacancy               |
| JobSource           | Provenance and source-specific identifiers |
| Match               | Explainable candidate-job relevance result |
| ProductOrder        | Purchased CV/application/job-hunt product  |
| ApplicationPack     | Job-specific documents and answers         |
| Application         | Candidate-job lifecycle                    |
| ApplicationEvent    | Status changes with source/confidence      |
| Payment             | Payment provider/order/result              |
| Refund              | Reversal history                           |
| ReviewEvent         | Human or automated quality corrections     |
| Employer            | Canonical employer identity                |

---

## 20. Security requirements before monetization

At minimum:

- secure, HttpOnly server-issued sessions where architecture permits,
- CSRF protection appropriate to deployment,
- ownership checks on every profile/document/order/application,
- private CV storage,
- MIME/type/size validation,
- no public permanent CV URLs,
- secrets only on the server,
- no CV content in ordinary analytics/error logs,
- payment verification server-side,
- idempotent payment callbacks,
- audit history for manual financial adjustments,
- rate limits for free AI actions,
- export and deletion controls.

Treat job descriptions and uploaded documents as untrusted input. Their text cannot authorize purchases, tools or external actions.

---

## 21. Payment launch

Use one payment method first.

For Nepal, KamKhoj uses **eSewa** as the single primary payment gateway.

> [!NOTE]
> **Gateway Status:**
>
> - **Active Gateway:** eSewa sandbox (`EPAYTEST`) with signed HMAC-SHA256 checkout and server-to-server transaction status verification.
> - **Test Credentials:**
>   - eSewa ID: `9841000000` (or `9841000001` through `9841000005`)
>   - MPIN / Password: `1122`
>   - OTP / Token: `123456`
> - **Khalti Exclusion:** Khalti is **not** integrated into payment processing. The word "Khalti" only exists in Nepal company directory fixtures (companies hiring tech workers) and one CV fixture bullet.

Before each paid action show:

- exact product,
- exact price,
- what is delivered,
- revision allowance,
- refund policy,
- expected user action after delivery.

Do not mark payment successful from browser state alone.

A failed generation is not a delivered product. Orders persist server-side and link directly to fulfillment workflows in Documents and Matches.

---

## 22. First commercial implementation phases

### Phase 0 — Reality check

**Goal:** verify what already works.

- inspect production/backend behavior,
- inspect authentication,
- inspect CV storage/parsing,
- inspect matching implementation,
- inspect job freshness and duplicates,
- inspect current job scrapers,
- verify application URLs,
- verify payment-readiness requirements.

**Gate:** accurate list of production-ready and missing capabilities.

### Phase 1 — Sellable profile and matching

Build/fix:

- CV upload,
- extraction review,
- editable structured profile,
- job preferences,
- explainable matching,
- trustworthy job-detail page,
- dashboard money screen.

**Gate:** test users repeatedly find relevant current jobs.

### Phase 2 — Paid CV product

Build:

- product/order model,
- payment flow,
- document generation,
- deterministic rendering,
- human-review queue,
- download/delivery,
- one revision flow.

**Gate:** first real paid CV orders.

### Phase 3 — Paid application pack

Build:

- job-specific tailoring,
- cover letter/application email,
- screening-answer suggestions,
- application destination validation,
- review/delivery flow.

**Gate:** real users purchase packs and use them to apply.

### Phase 4 — Job Hunt Pack and tracker

Build:

- bundle ordering,
- curated job set,
- application tracker,
- repeat-purchase flow,
- simple text interview.

**Gate:** repeat purchase and acceptable contribution margin.

### Phase 5 — Employer pilot

Build only what a pilot needs:

- employer identity,
- vacancy intake,
- job normalization,
- candidate matching,
- candidate approval,
- structured shortlist delivery.

**Gate:** employers confirm that KamKhoj sends useful candidates and at least some demonstrate willingness to pay.

### Phase 6 — Controlled automation

Only after the previous gates:

- one permitted send channel,
- delivery receipts,
- idempotent queue,
- clear failure states,
- optional bounded automation.

### Phase 7 — Optional integrations

Only if justified by measured usage:

- Gmail,
- more payment products,
- voice interview,
- more ATS adapters,
- employer workflow tools.

---

## 23. 30-day founder execution plan

### Days 1–5: make the current product trustworthy

- audit scraper output,
- remove/flag stale and invalid jobs,
- improve individual job-page extraction,
- audit matching errors,
- confirm CV parsing/editing flow,
- create the commercial dashboard.

### Days 6–10: build the first paid deliverable

- implement Professional CV order,
- implement payment or controlled manual beta payment,
- build generation + review + PDF delivery,
- create refund/revision rules.

### Days 11–15: sell to the first users

- recruit 10–20 active job seekers,
- onboard them directly,
- deliver manually where necessary,
- ask for payment instead of giving everything free,
- record objections.

### Days 16–20: application pack

- add per-job tailoring,
- add application email/cover-letter generation,
- improve match explanations,
- record delivery time and corrections.

### Days 21–25: repeat and improve

- contact previous customers,
- test Job Hunt Pack,
- measure repeat purchase,
- fix the most frequent quality failures,
- remove features nobody uses.

### Days 26–30: decision point

Review:

- number of paying customers,
- gross revenue,
- repeat customers,
- refund/revision rate,
- contribution per product,
- match complaints,
- document correction rate,
- interviews reported,
- acquisition channels.

Then decide what deserves the next month of development.

---

## 24. Commercial dashboard metrics

Do not optimize for page views alone.

### Acquisition

- new visitors,
- CV uploads,
- completed profiles,
- source of user.

### Product value

- time to first useful match,
- match save rate,
- match dismissal reasons,
- jobs opened,
- official application clicks.

### Monetization

- checkout views,
- paid conversion,
- revenue by product,
- repeat purchase rate,
- average revenue per paying user,
- refund rate.

### Quality

- document correction rate,
- critical factual error rate,
- stale-job reports,
- duplicate-job reports,
- unsupported application destinations,
- average human-review minutes.

### Outcome

- applications reported,
- acknowledged applications,
- interviews,
- offers,
- outcome source and observation window.

Do not claim that KamKhoj caused an interview or offer without evidence supporting that conclusion.

---

## 25. Kill / change criteria

Avoid continuing merely because a lot of code has already been written.

After a meaningful beta sample, reconsider the offer if:

- users like free matching but consistently refuse to pay for application help,
- human review remains too expensive at the tested prices,
- generated documents require frequent factual correction,
- job quality remains too unreliable to earn trust,
- paid customers do not use the delivered applications,
- repeat purchase is near zero despite active job seeking.

Possible responses:

- change pricing,
- narrow the audience,
- improve the paid deliverable,
- focus on B2B sooner,
- remove expensive AI actions,
- specialize in one job category,
- provide more human-assisted service at a higher price.

Do not answer weak demand by simply adding more features.

---

## 26. Long-term direction

If the candidate product works, KamKhoj can evolve into a two-sided employment platform.

```text
Job inventory
      ↓
Candidate profile + preferences
      ↓
Explainable matching
      ↓
Application assistance
      ↓
Candidate-approved application
      ↓
Employer receives structured applicant
      ↓
Interview / outcome tracking
```

Candidate revenue can come from:

- professional CV products,
- tailored applications,
- job-hunt bundles,
- interview preparation,
- premium career tools.

Employer revenue can later come from:

- vacancy posting,
- candidate matching,
- shortlist services,
- applicant-management tools,
- recruiting workflows.

This reduces dependence on third-party portal automation and creates a more defensible product than scraping alone.

---

## 27. Immediate execution order

1. Audit the real backend and job data quality.
2. Fix stale/invalid/poorly extracted vacancies.
3. Ship a structured editable candidate profile.
4. Ship explainable matching and the dashboard money screen.
5. Launch the Professional CV beta product.
6. Get the first paying users and review every delivery.
7. Launch the Job-Specific Application Pack.
8. Test the Job Hunt Pack.
9. Measure repeat purchase, contribution and user outcomes.
10. Run a lightweight employer matching pilot.
11. Add supported submission automation only after demand and reliability justify it.
12. Add Gmail, voice and broader automation only when they solve measured user problems.

---

## 28. Final product principle

KamKhoj should not try to win by having the most features or the largest scraped database.

It should win by being trusted for three things:

1. **The jobs are real and current.**
2. **The matches make sense for the candidate.**
3. **The paid application help is good enough that people willingly buy it again.**

The short-term objective is not to prove that KamKhoj can automate the entire job-search industry.

The short-term objective is to prove:

> **A real job seeker will pay KamKhoj because it materially improves an application they were already motivated to make.**

Once that is true repeatedly, automation and scale become engineering problems rather than guesses about what the market wants.

---

## 29. Features retained from the original long-term roadmap

The following original principles remain valid and should be preserved as KamKhoj grows:

- Google identity and Gmail permissions must remain separate.
- CV/profile facts require user confirmation and provenance.
- External application clicks must not be labeled submitted automatically.
- Automatic application should be destination-specific and permission-aware.
- CAPTCHA, MFA, assessments, signatures and legal declarations require user handoff.
- Application attempts require idempotency and duplicate protection when automation is introduced.
- Financial events should be server-authoritative and idempotent.
- Sensitive candidate data should not enter ordinary logs.
- Gmail access, if introduced, should be optional and minimal.
- Interview AI should not be marketed as an employer certification.
- Job-source permissions should be reviewed rather than assumed from public availability.
- Employer partnerships should be explicit rather than implied.
- Candidate data should never be quietly resold.

These are long-term guardrails. They no longer block the simpler commercial beta described above.
