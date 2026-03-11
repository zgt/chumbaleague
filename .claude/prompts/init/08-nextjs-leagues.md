# Step 8: Next.js League Pages

Build the league management pages for the Next.js app.

## Reference Files

Copy and adapt from the tokilist Next.js music pages:
- League list (home): `~/coding/todo-list/apps/nextjs/src/app/music/page.tsx`
- Create league: `~/coding/todo-list/apps/nextjs/src/app/music/leagues/create/page.tsx`
- League detail: `~/coding/todo-list/apps/nextjs/src/app/music/leagues/[leagueId]/page.tsx`
- Join: `~/coding/todo-list/apps/nextjs/src/app/music/join/[inviteCode]/page.tsx`
- Standings component: `~/coding/todo-list/apps/nextjs/src/components/music/results/league-standings.tsx`

## What to do

### 1. Home / League List (`apps/nextjs/src/app/page.tsx`)

For authenticated users, render the league list:
- Call `api.musicLeague.getAllLeagues` via tRPC
- Show each league as a card with: name, member count, current round status
- "Create League" button
- "Join League" button/input for entering invite codes
- Empty state when no leagues joined yet

### 2. Create League (`apps/nextjs/src/app/leagues/create/page.tsx`)

Form with fields:
- League name (required, max 100 chars)
- Description (optional, max 500 chars)
- Songs per round (1-5, default 1)
- Max members (2-50, default 20)
- Allow downvotes (boolean toggle, default false)
- Upvote points per round (1-20, default 5)
- Submission window days (1-14, default 3)
- Voting window days (1-14, default 2)
- Downvote points per round (1-10, default 3, only shown if downvotes enabled)

Use `@tanstack/react-form` (already in dependencies) or simple controlled inputs.

On submit: call `api.musicLeague.createLeague`, then redirect to the new league page.

### 3. League Detail (`apps/nextjs/src/app/leagues/[leagueId]/page.tsx`)

Call `api.musicLeague.getLeagueById` with the league ID from params.

Display:
- League name, description
- Member list with avatars/names
- Invite code with copy button + share link (`music.calayo.net/join/{inviteCode}`)
- Button to regenerate invite code (owner/admin only)
- Rounds list — each round shows: number, theme, status badge, dates
- Button to create new round (owner/admin only)
- League settings button (owner only) — opens settings form/modal with `updateLeagueSettings`
- Leave league button (non-owners)
- Delete league button (owner only, with confirmation)
- League standings table (using the standings component)

### 4. League Standings Component (`apps/nextjs/src/components/music/results/league-standings.tsx`)

Copy and adapt from tokilist. Shows:
- Ranked table of all members
- Columns: Rank, User (avatar + name), Total Points, Rounds Won, Rounds Played, Avg Points/Round
- Sorted by total points descending

Calls `api.musicLeague.getLeagueStandings`.

### 5. Join League (`apps/nextjs/src/app/join/[inviteCode]/page.tsx`)

- Call `api.musicLeague.getLeagueByInviteCode` to show league preview
- Display: league name, description, member count, max members
- "Join League" button → calls `api.musicLeague.joinLeague`
- Handle errors: invalid code, already a member, league full
- On success: redirect to the league detail page
- If not authenticated: show sign-in prompt, then redirect back after auth

### 6. Verify

```bash
pnpm dev:next
```

Test the full flow:
1. Sign in
2. Create a league
3. View league detail
4. Copy invite link
5. Open invite link (as same user — will show "already a member" error, which is correct)
