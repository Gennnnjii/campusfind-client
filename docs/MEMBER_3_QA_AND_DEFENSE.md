# Member 3 QA Matrix and Defense Notes

Prepared October 6, 2026 from the checked-out `feat/claims-sdao` client and server repositories. This records source review and local checks; it does not claim a live database or full browser run.

## QA matrix

| ID | Area / scenario | Expected HTTP result and message | Expected UI / privacy result | Evidence / status |
|---|---|---|---|---|
| C01 | Eligible Found item (`Available for Claim`) eligibility lookup | `GET /api/items/:id/claim-eligibility` returns 200, `eligible: true`, `reason: null` | Claim form displays item/category/location/date and `claimLocation`; no Claim data | `server/routes/itemClaims.js`; code reviewed, no DB-backed request run |
| C02 | Lost or unavailable Found item eligibility lookup | 200 with `eligible: false` and reason `Only Found items with Available for Claim status can receive claims.` | Form is closed with the eligibility reason | `server/routes/itemClaims.js`; code reviewed |
| C03 | Submit invalid or undersized claim fields | Client blocks; direct API request returns 400 validation details | Field-level validation; no claim/private payload in public item view | `client/src/schemas/claimSchema.ts`, `server/models/Claim.js`, `middleware/errorHandler.js`; schema unit coverage for invalid values |
| C04 | Submit valid eligible claim | 201, `Claim submitted successfully. Keep your reference code for follow-up.` | Success state shows reference and Pending status; proof remains in the Claim record | `server/routes/claims.js`, `services/claimWorkflow.js`, `client/src/pages/SubmitClaimPage.tsx`; code reviewed, no DB-backed request run |
| C05 | Repeat Pending claim for same normalized email and item | 400, `You already have a pending claim for this item` | Error feedback; no duplicate pending entry | `services/claimWorkflow.js`, partial unique index in `models/Claim.js`; code reviewed |
| C06 | Submit for missing item or malformed ObjectId | 404 `Found item not found` for absent item; 400 `Invalid _id` for malformed id | Error state; no crash | `services/claimWorkflow.js`, `middleware/errorHandler.js`; generic error handling tested, endpoint cases not DB-backed |
| C07 | SDAO overview with pending/approved/returned work | 200 grouped into five queues and counts | SDAO review view needs claimant identity/proof; keep it restricted to designated staff | `routes/sdao.js`; code reviewed, endpoint is currently unauthenticated (see blocker P01) |
| C08 | Reject without a useful note | 400, `A short review note is required when rejecting a claim` | Client requires a note; form remains actionable | `services/claimWorkflow.js`, `client/src/schemas/claimSchema.ts`; code reviewed |
| C09 | Approve a Pending claim | 200, `Claim approved successfully.` | Status updates; competing Pending claims become Rejected; review details stay in SDAO workflow | `routes/claims.js`, `services/claimWorkflow.js`; code reviewed, no DB transaction run |
| C10 | Review an already finalized claim | 400, `Only Pending claims can be reviewed` | Error feedback; final status is unchanged | `services/claimWorkflow.js`; code reviewed |
| C11 | Competing approval / uniqueness race | At most one Approved Claim per item; duplicate-key errors currently map to 400 `A record with that unique value already exists` | Refresh shows committed result | Partial unique index in `models/Claim.js`; concurrency not exercised |
| C12 | Turnover an item not in Pending Turnover or not Found | 400, `Only Found items awaiting turnover can be confirmed` | SDAO action fails with readable feedback | `services/sdaoWorkflow.js`; code reviewed |
| C13 | Return without an Approved Claim | 400, `An approved claim is required before this item can be returned` | Item remains available; SDAO gets error feedback | `services/sdaoWorkflow.js`; code reviewed |
| C14 | Return with an Approved Claim | 200, `Item marked Returned successfully.` | Returned queue reflects the transition | `services/sdaoWorkflow.js`; code reviewed, no DB transaction run |
| C15 | Activity history and filters | 200 newest first; invalid action/date filter returns 400 | Show event label/message and related public-safe item fields | `routes/activityLogs.js`; code reviewed, endpoint not run against data |
| C16 | Invalid MongoDB id / absent Claim, Item, or route | 400 for CastError; 404 with `Claim not found`, `Item not found`, or `Route not found` as applicable | Error state; no stack trace | `middleware/errorHandler.js`, route handlers, `app.js`; malformed JSON and unknown-route tests passed |
| C17 | Public Claim privacy boundary | Public retrieval must not return claimant email, proof, review notes, student number, or full Claim objects | Public Item retrieval contains only reviewed public fields; SDAO details require access control | **Fail / coordination required:** `GET /api/items/:id/claims` returns full Claim documents; `GET /api/claims`, `GET /api/claims/:id`, and `/api/sdao/overview` also return private fields without auth middleware. See P01. |
| C18 | Item API handoff | `GET /api/items` and `GET /api/items/:id` return the Member 1 public Item contract | Public fields only; preserve `claimLocation`; category/location population must not change eligibility | **Not present in checked server snapshot:** `app.js` mounts only `itemClaimsRouter` at `/api/items`, which defines only `/:id/claim-eligibility` and `/:id/claims`. See P02. |
| C19 | Responsive/browser end-to-end flow at 375px and desktop | Complete flow and persisted state | No horizontal overflow; verify loading, error, empty, validation, success | **Pending:** no browser or live Atlas workflow executed in this review. Screenshots in `docs/screenshots` are existing artifacts, not fresh evidence for this pass. |

### Local checks executed

| Check | Result |
|---|---|
| Server `npm test` | Pass, 8/8. Covers health, generic 404, malformed JSON, activity filter validation, claim reference/schema validation, Item type-specific status, and pure eligibility predicate. It does not exercise MongoDB workflow transactions or endpoint privacy. |
| Server `npm run seed:check` | Pass: 7 categories, 6 locations, 26 items, 12 claims, 63 activities; in-memory blueprint validation only. |
| Client `npm run build` | Pass: TypeScript project build and Vite production build. |
| Client `npm run lint` | Pass with no reported lint errors. |
| Atlas integration / browser / viewport QA | Not run; requires approved development data and interactive browser workflow. |

## Contract review

- **Eligibility:** the server and client use `type: 'Found'` plus `status: 'Available for Claim'`. The service rechecks this at submission and review time; this is a sound server-side guard. Schema tests cover allowed type-specific statuses and the pure eligibility predicate.
- **Category/location:** the eligibility endpoint populates only each related resource's `name`. Neither is used in the eligibility predicate.
- **Claim location:** the eligibility response selects `claimLocation`; Claim response population and SDAO item population preserve it. Client types and the submit page consume it.
- **Public/private boundary:** eligibility itself does not join Claim records, but the public-by-default API has other routes that return full Claim records. No authentication or role middleware is mounted in `app.js`. Privacy is therefore **not verified and currently fails** at P01.
- **Item handoff:** Item list and Item detail handlers described as merged in the workplan are absent from this checked server snapshot (P02). The Item-to-Claim contract cannot be fully validated end to end here.
- **Route ownership:** `/api/items/:id/claim-eligibility` and `/api/items/:id/claims` are mounted through `routes/itemClaims.js`; general Item CRUD/retrieval is not implemented in the checked server source. Claim and SDAO routes are mounted separately by `app.js`.

### Findings requiring coordination

**P01 — Private Claim data is returned by unauthenticated routes (high priority).** `routes/itemClaims.js` queries and returns full Claim documents at `GET /api/items/:id/claims`. `routes/claims.js` also returns full Claim documents from list/detail routes, and `routes/sdao.js` returns full claims with proof and claimant data. `app.js` has no authentication/authorization middleware. The README explicitly identifies production SDAO role enforcement as out of MVP scope, but that means these routes cannot be described as a verified privacy boundary. The safe resolution needs an agreed policy for route access and response shapes; that changes shared API/access contracts, so coordinate with the project owner before changing it. Do not expose real claimant content in screenshots or reports.

**P02 — Public Item list/detail API is missing from the checked server snapshot.** `app.js` mounts the Member 3 Item subrouter, whose only routes are the two claim subpaths. There is no handler for `GET /api/items` or `GET /api/items/:id`; unknown paths fall through to 404. This conflicts with the workplan's merged Member 1 server status. Confirm the intended integration branch/repository and ask the Item owner to restore or identify those handlers. Member 3 should not recreate or edit Member 1 routes.

## Defense notes

### What

The module accepts claims for Found items that are in `Available for Claim`, gives each submission a server-generated reference, routes review through SDAO workflow pages, enforces one-way claim decisions, and records workflow activity.

### Why

The status gate avoids claims on lost, unreceived, or already returned items. Review notes and proof support a decision. Transactions keep related writes together, and database uniqueness constraints protect against races. A reference code lets staff find a claim without putting proof on a public Item page.

### How and data flow

`SubmitClaimPage -> shared Axios client -> Express route -> claimWorkflow/sdaoWorkflow -> Mongoose models -> MongoDB transaction -> JSON response -> UI feedback/reload`

Claim submission validates the payload, loads and checks the Item, checks for an existing Pending claim for that email and Item, generates a reference, saves the Claim, and writes `claim_submitted`. Review changes only Pending claims. Approval rejects competing Pending claims and writes corresponding logs in the same transaction. Turnover moves a Found item from Pending Turnover to Available for Claim. Return requires an Approved claim and moves the item to Returned. Activity History reads the event log newest first.

### Failure cases

Invalid payloads and state transitions return 400; malformed IDs return 400; absent records return 404; competing pending submissions are rejected; duplicate Approved claims are constrained by a partial unique index; a rejected claim requires a note; a return requires an Approved claim. Transactions require MongoDB Atlas or another replica set. Unexpected server errors return a generic 500 response.

### Questions to be ready for

- **Why generate the reference on the server?** The server controls format and uniqueness; a browser cannot choose another user's reference.
- **Why use both workflow checks and a partial unique index?** The service gives a useful decision path; the index is the database's concurrency backstop for one Approved Claim per Item.
- **Why transactions?** Approval, competing-claim updates, Item transitions, and ActivityLog writes must commit or roll back together.
- **Can we claim privacy is enforced today?** No. Private fields are returned by unauthenticated Claim/SDAO routes in this snapshot. State this limitation and coordinate an access/response contract fix before using real claimant data.
- **What is needed for complete end-to-end QA?** The missing Item list/detail API integration, approved non-sensitive seed data on a transaction-capable test database, then browser tests for submission, competing claims, review, return, persistence, and mobile/desktop layout.

## Scope and execution gate

No code route, shared contract, dependency, environment file, seed, migration, index, or database was changed. P01 and P02 require cross-owner/shared-contract coordination under the authorized workplan. Execute the deferred browser/data workflow only when the Item API and approved shared seed are ready.
