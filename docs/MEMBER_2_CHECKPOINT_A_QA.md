# Member 2 Checkpoint A QA

Date: 2026-10-11
Branch: `feat/item-management`

## Results

| Check | Result | Evidence |
|---|---|---|
| Report page and reference data | Pass | Category API returned 7 active categories and Location API returned 6 active locations; both dropdowns displayed their options. |
| Required-field and length validation | Pass | Empty submission displayed field errors. A 2-character title and 5-character description were rejected in the form. An empty API request returned HTTP 400 with validation details. |
| Future-date validation | Pass | A future date was rejected in the form. Server tests also cover future and malformed dates. |
| Lost report create flow | Pass | A labeled Lost test report was submitted through the UI, saved with status `open`, appeared in Browse after reload, and had a `report_created` activity entry. |
| Found report create flow | Pass | A labeled Found test report was submitted through the UI, saved with status `pending_turnover`, appeared in Browse after reload, and had a `report_created` activity entry. |
| Form reset after success | Pass after fix | QA initially found that successful submission did not clear the form. The form's reset values were made explicit; a subsequent successful submission cleared the fields. |
| Automated checks | Pass | Server tests: 10/10. Client production build and lint pass. |

## Development database test records

Five clearly labeled Member 2 QA reports were created in the shared development database during API and UI checks: three Lost reports and two Found reports. They were left in place; no cleanup or deletion was performed.

## Notes

- The first API Lost-report attempt lost its server connection and was not persisted; a follow-up query confirmed it was absent before retrying.
- These checks do not cover Checkpoints B-D (edit/delete, status-transition endpoints, or Category/Location management).
