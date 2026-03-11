# Step 3: Core tRPC API Router

Create the main music league tRPC router. This is the heart of the app — all league, round, submission, and voting logic.

## What to do

### 1. Create `packages/api/src/router/music-league/index.ts`

Copy the music league router from `~/coding/todo-list/packages/api/src/router/music-league/index.ts` and adapt it.

The router contains these procedures (keep ALL of them):

**League procedures:**
- `getLeagueByInviteCode` (public) — lookup league by invite code for join flow
- `getUserProfile` (protected) — aggregate stats (leagues joined, total points, rounds won, best submission, notification prefs)
- `updateNotificationPreferences` (protected) — update user's notification prefs jsonb
- `createLeague` (protected) — create league + auto-add creator as OWNER member
- `getAllLeagues` (protected) — get all leagues user is a member of, with current round
- `getLeagueById` (protected) — full league detail with members, rounds, submissions, votes
- `joinLeague` (protected) — join via invite code with capacity check
- `leaveLeague` (protected) — leave league (owner cannot leave)
- `deleteLeague` (protected) — owner-only delete
- `regenerateLeagueInviteCode` (protected) — owner/admin regenerate invite code
- `updateLeagueSettings` (protected) — owner-only update league settings

**Spotify:**
- `searchSpotify` (protected) — proxy search to Spotify API

**Round procedures:**
- `createRound` (protected) — owner/admin create round, auto-calculates dates, supports PENDING queueing
- `getRoundById` (protected) — full round detail with submissions, votes, comments, member status board; respects phase visibility (hides submitters during listening/voting, hides votes until results)
- `getLatestRound` (protected) — get the most recent round for a league
- `advanceRoundPhase` (protected) — owner/admin advance phase (SUBMISSION → LISTENING → VOTING → RESULTS → COMPLETED); triggers notifications on phase changes; activates PENDING rounds when current completes
- `setRoundPlaylistUrl` (protected) — owner/admin set playlist URL manually
- `generateRoundPlaylist` (protected) — owner/admin auto-generate Spotify playlist from submissions

**Submission procedures:**
- `createSubmission` (protected) — submit a track to a round (enforces phase, song limit, duplicate check)
- `deleteSubmission` (protected) — delete own submission (only during SUBMISSION phase)

**Voting procedures:**
- `submitVotes` (protected) — submit votes + comments for a round (validates point budget for upvotes and downvotes separately; replaces existing votes)

**Playlist/Track procedures:**
- `getPlaylistTracks` (protected) — get all track metadata for a round

**Standings:**
- `getLeagueStandings` (protected) — calculate standings across all completed/results rounds with total points, rounds won, avg points per round

### 2. Key changes from tokilist version

- All imports should reference `@acme/db`, `@acme/db/schema` — these are the same workspace package names
- Remove any tokilist-specific imports (no task, category, etc.)
- Content moderation calls (`flagContentIfNeeded`) will be wired in step 6 — for now, comment out those lines or add a TODO
- Notification calls (`notifyRoundStarted`, etc.) will be wired in step 5 — for now, comment out those lines or add a TODO
- Spotify integration (`searchTracks`, `createPlaylist`) will be wired in step 4 — for now, comment out those lines or add a TODO

### 3. Update `packages/api/src/root.ts`

Replace the scaffold root router:

```ts
import { authRouter } from "./router/auth";
import { musicLeagueRouter } from "./router/music-league";
import { postRouter } from "./router/post";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  musicLeague: musicLeagueRouter,
  post: postRouter, // Keep for now, remove in cleanup step
});

export type AppRouter = typeof appRouter;
```

### 4. Verify `packages/api/src/trpc.ts`

Ensure the `protectedProcedure` and `publicProcedure` are working. These should already exist from the scaffold. Check that they provide `ctx.db` and `ctx.session`.

### 5. Verify

```bash
pnpm typecheck
```

Fix any import issues. It's OK if Spotify/notification/moderation calls are commented out — those come next.
