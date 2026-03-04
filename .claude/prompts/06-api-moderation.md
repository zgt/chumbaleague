# Step 6: Content Moderation System

Add the UGC moderation layer — required for App Store compliance. This includes content filtering, user reporting, and user blocking.

## What to do

### 1. Create `packages/api/src/lib/content-filter.ts`

Copy from `~/coding/todo-list/packages/api/src/lib/content-filter.ts`. This contains:
- `checkContent(text)` — check text against a blocklist, returns `{ flagged, matchedWords }`
- `flagContentIfNeeded(contentType, contentId, text)` — check and insert a `ContentFlag` record if flagged (fire-and-forget, never blocks the user's action)

This is intentionally lightweight soft moderation — Apple needs to see the mechanism exists. Content is NOT blocked, just flagged for review.

**Note**: Update the `contentTypeEnum` usage — remove "TASK" since it's tokilist-specific. The valid types for Chumbaleague are: LEAGUE, SUBMISSION, USER, COMMENT, ROUND.

### 2. Create `packages/api/src/router/moderation.ts`

Copy from `~/coding/todo-list/packages/api/src/router/moderation.ts`. This contains:

- `reportContent` (protected) — create a report (with self-report prevention)
- `blockUser` (protected) — block a user (upsert, prevents duplicate blocks)
- `unblockUser` (protected) — unblock a user
- `getBlockedUsers` (protected) — list blocked users with their profiles
- `getBlockedUserIds` (protected) — list just the IDs (for filtering in UI)
- `getReports` (protected) — list reports (future admin panel; TODO: add admin role check)

### 3. Wire up content filter in music league router

Go back to `packages/api/src/router/music-league/index.ts` and uncomment/wire up all `flagContentIfNeeded` calls:

```ts
import { flagContentIfNeeded } from "../../lib/content-filter";
```

This is called (fire-and-forget with `void`) in:
- `createLeague` — flags league name + description
- `createRound` — flags theme name + description
- `updateLeagueSettings` — flags updated name + description

### 4. Add moderation router to root

Update `packages/api/src/root.ts`:

```ts
import { moderationRouter } from "./router/moderation";

export const appRouter = createTRPCRouter({
  ...existing,
  moderation: moderationRouter,
});
```

### 5. Verify

```bash
pnpm typecheck
```

At this point, the entire API layer should be complete and type-checking cleanly. The routers should be:
- `auth` (from scaffold)
- `musicLeague` (core music league logic)
- `notification` (push token management)
- `moderation` (reports, blocks, content filter)
- `post` (scaffold, will be removed in cleanup)
