-- Migration: Remove LISTENING phase from round_status enum
-- Rounds now go directly from SUBMISSION to VOTING

-- Step 1: Update any existing rounds with LISTENING status to VOTING
UPDATE "round" SET "status" = 'VOTING' WHERE "status" = 'LISTENING';

-- Step 2: Remove the LISTENING value from the enum
-- PostgreSQL doesn't support ALTER TYPE ... REMOVE VALUE, so we need to recreate the enum
ALTER TYPE "round_status" RENAME TO "round_status_old";

CREATE TYPE "round_status" AS ENUM ('PENDING', 'SUBMISSION', 'VOTING', 'RESULTS', 'COMPLETED');

-- Step 3: Drop the default before casting, then re-add it
ALTER TABLE "round" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "round" ALTER COLUMN "status" TYPE "round_status" USING "status"::text::"round_status";
ALTER TABLE "round" ALTER COLUMN "status" SET DEFAULT 'SUBMISSION';

DROP TYPE "round_status_old";
