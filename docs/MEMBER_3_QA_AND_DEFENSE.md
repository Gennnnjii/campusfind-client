# Member 3 QA and Defense Guide

## Contribution summary

Member 3 implemented the full claim lifecycle, SDAO operational workflow, and activity-log trail across React, Axios, Express, Mongoose, and MongoDB. Shared work includes responsive QA, consistent feedback states, seed verification, API documentation, and defense preparation.

## What Why How Data Flow

### What

The module accepts ownership claims for eligible Found items, lets SDAO review them, automatically closes competing claims after approval, prevents unapproved returns, and records every important state change.

### Why

The rules protect privacy and prevent inconsistent data. Public users never need finder contact details, only SDAO can see private proof in the workflow UI, two claims cannot both be approved for one item, and an item cannot be marked Returned before ownership approval.

### How

- React Router exposes Submit Claim, SDAO Management, Claim Review, and Activity History pages.
- A single Axios instance sends requests to the Express API.
- React Hook Form and Zod validate both claim submission and claim review.
- Express routers call focused workflow services.
- Mongoose schemas enforce required fields, enums, lengths, email format, timestamps, references, and a partial unique index.
- MongoDB transactions keep claim decisions, competing-claim closure, item changes, and logs atomic.

### Data flow

`React page -> shared Axios client -> Express router -> workflow service -> Mongoose model -> MongoDB Atlas -> JSON response -> React feedback and reload`

## Verified QA matrix

| Area | Check | Result |
|---|---|---|
| Client | TypeScript production build | Pass |
| Client | ESLint | Pass |
| Server | Automated tests | Pass |
| Seed | In-memory document validation | Pass |
| Seed | 7 categories and 6 locations | Pass |
| Seed | 26 reports and 12 claims | Pass |
| Seed | 63 activity records and valid references | Pass |
| Workflow | Only Found + Available for Claim accepts claims | Pass |
| Workflow | Duplicate Pending claim per email/item blocked | Pass |
| Workflow | Approval rejects competing Pending claims | Pass |
| Workflow | One Approved claim per item enforced by index | Pass |
| Workflow | Returned requires Approved claim | Pass |
| Workflow | Important changes write ActivityLog records | Pass |
| UI | Loading, error, empty, validation, success, and 404 states | Pass |
| UI | All Member 3 routes at 375px with no page overflow | Pass |
| UI | Desktop SDAO layout | Pass |
| Browser | Claim validation and successful submission | Pass |
| Browser | Turnover confirmation and success feedback | Pass |
| Browser | Rejection note validation and confirmation | Pass |
| Browser | Activity filter | Pass |
| Browser | Console errors during QA | None |

Database integration requires the team's `MONGO_URI`. After configuring it, run `npm run seed`, `npm run seed:verify`, and then execute the demo flow below against MongoDB Atlas.

## Member 3 demo flow

1. Run the server and client with the seeded Atlas database.
2. Open `/sdao` and identify the five workflow sections.
3. Confirm one Pending Turnover item and show it becoming Available for Claim.
4. Open that item's claim form.
5. Submit an empty or short form first to demonstrate field-level Zod validation.
6. Submit a valid claim and save the generated reference code.
7. Open the claim from Pending Claims and explain that proof is private to the SDAO view.
8. Reject one claim without a note to demonstrate validation, then approve the intended claim.
9. Show that competing Pending claims for the same item are automatically Rejected.
10. Mark the approved item Returned and explain the approved-claim prerequisite.
11. Open Activity History and filter for approvals or returns.
12. Refresh to prove MongoDB persistence.
13. Open an invalid claim ID or missing route to demonstrate clean error handling.

## Failure cases to explain

- Lost item or non-available Found item: claim rejected with HTTP 400.
- Duplicate Pending claim from the same email for the same item: HTTP 400.
- Invalid MongoDB ID: HTTP 400 through the shared error handler.
- Missing claim or item: HTTP 404.
- Re-review of Approved or Rejected claim: HTTP 400.
- Rejection without a useful note: HTTP 400.
- Return without an Approved claim: HTTP 400.
- Two approvals for one item: blocked by both workflow logic and the database index.
- Network/server failure: visible UI error with retry; no blank screen.
- Malformed JSON: HTTP 400 with `{ "message": "Invalid JSON payload" }`.

## Likely defense questions

### Why is the claim reference generated on the server?

The server is the trusted source of truth. Server generation gives one format, avoids client manipulation, and lets the database enforce uniqueness.

### Why use a partial unique index?

Application checks can race. The partial index is a final database guarantee that only one claim with `status: Approved` can exist for an item while still allowing many Pending and Rejected claims.

### Why use a transaction?

Approving a claim may update the chosen claim, reject competitors, and create several logs. Returning an item updates both the item workflow and its log. A transaction makes each multi-document operation all-or-nothing.

### Why not expose claimant or finder details publicly?

The blueprint requires a privacy-conscious SDAO-mediated recovery. Public pages show only item-identification fields; private proof is reserved for the operational review page.

### Why reload after mutations instead of manually editing every list?

The server owns the workflow and may change several records at once. Reloading the grouped overview prevents duplicated derived state and ensures the UI reflects the committed database result.

### What is genuine data processing in this module?

Eligibility is computed from item type and status; the SDAO overview groups live records into operational queues; approval evaluates and closes competing claims; return eligibility depends on an Approved claim; activity filters and the reference generator derive useful results beyond CRUD.

### What happens if two staff members approve different claims at the same time?

Both requests use transactions, and the partial unique index on Approved claims is the final concurrency guard. One approval can commit; the other receives a duplicate-key error translated to HTTP 400.

## Final pre-demo checklist

- Use a dedicated Atlas development database with transaction support.
- Confirm `.env` contains `MONGO_URI` and is not committed.
- Run `npm run seed` then `npm run seed:verify` in the server.
- Run `npm test` in the server.
- Run `npm run lint` and `npm run build` in the client.
- Keep both terminals visible and start the app before presentation time.
- Complete the demo once without resetting the database.
- Know the exact files personally implemented and ensure commits are made from the correct Member 3 GitHub account.
