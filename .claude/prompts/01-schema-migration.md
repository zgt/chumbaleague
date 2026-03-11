In ~/coding/chumbaleague, I need to merge the LISTENING and VOTING round phases. The LISTENING phase should be removed — rounds go directly from SUBMISSION to VOTING.

Changes needed in packages/db/src/schema.ts:
1. Remove "LISTENING" from the roundStatusEnum (line ~23). The enum should be: PENDING, SUBMISSION, VOTING, RESULTS, COMPLETED

Then create a drizzle migration. You may need to:
- Update any existing LISTENING rounds to VOTING in the migration SQL
- Alter the pg enum to remove the LISTENING value

Run `pnpm db:generate` from the packages/db directory to generate the migration (check package.json for the exact script name). Review the generated SQL and make sure it handles existing LISTENING rows by updating them to VOTING first.
