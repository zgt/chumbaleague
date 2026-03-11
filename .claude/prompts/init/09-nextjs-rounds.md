# Step 9: Next.js Round Pages

Build the round detail pages — the core gameplay loop: submission, listening, voting, and results.

## Reference Files

Copy and adapt from tokilist:
- Round detail: `~/coding/todo-list/apps/nextjs/src/app/music/leagues/[leagueId]/rounds/[roundId]/page.tsx`
- Create round: `~/coding/todo-list/apps/nextjs/src/app/music/leagues/[leagueId]/rounds/create/page.tsx`
- Status board: `~/coding/todo-list/apps/nextjs/src/app/music/leagues/[leagueId]/rounds/[roundId]/_components/round-status-board.tsx`
- Submit song: `~/coding/todo-list/apps/nextjs/src/components/music/submission/submit-song.tsx`
- Track list: `~/coding/todo-list/apps/nextjs/src/components/music/submission/track-list.tsx`
- Vote interface: `~/coding/todo-list/apps/nextjs/src/components/music/voting/vote-interface.tsx`
- Round results: `~/coding/todo-list/apps/nextjs/src/components/music/results/round-results.tsx`
- Playlist view: `~/coding/todo-list/apps/nextjs/src/app/music/leagues/[leagueId]/rounds/[roundId]/playlist/page.tsx`

## What to do

### 1. Create Round (`apps/nextjs/src/app/leagues/[leagueId]/rounds/create/page.tsx`)

Form with:
- Theme name (required, max 200 chars)
- Theme description (optional, max 500 chars)

Show a theme template picker if ThemeTemplate table has data. Otherwise just the free-form inputs.

On submit: call `api.musicLeague.createRound`, redirect to round detail.

### 2. Round Detail (`apps/nextjs/src/app/leagues/[leagueId]/rounds/[roundId]/page.tsx`)

This is the most complex page. It renders differently based on round status.

Call `api.musicLeague.getRoundById`.

**Common header (all phases):**
- Round number and theme name
- Theme description
- Status badge (SUBMISSION / LISTENING / VOTING / RESULTS / COMPLETED)
- Deadline countdown (submission or voting deadline depending on phase)
- Admin controls: "Advance Phase" button (owner/admin only)
- Playlist link (if set)

**SUBMISSION phase:**
- Song submission form (search + select)
  - Spotify search input → calls `api.musicLeague.searchSpotify`
  - Search results shown as track cards (album art, name, artist, duration)
  - Click to submit → calls `api.musicLeague.createSubmission`
  - Show user's current submissions with delete button
- Member status board showing who has/hasn't submitted
- Generate Playlist button (admin, after submissions close or any time)

**LISTENING phase:**
- Track list showing all submissions (submitters hidden)
- Playlist link if available
- Spotify embeds or track cards with preview playback
- Status board

**VOTING phase:**
- All tracks displayed
- Vote interface:
  - Point allocation UI (distribute upvote points across tracks)
  - If downvotes enabled: separate downvote point allocation
  - Cannot vote on own submissions
  - Comment field per track (max 280 chars)
  - Submit votes button → calls `api.musicLeague.submitVotes`
- Show remaining points budget
- Status board showing who has/hasn't voted

**RESULTS / COMPLETED phase:**
- Results table: tracks ranked by total points
- Show submitter names revealed
- Show vote breakdowns per track (who gave how many points)
- Show comments
- Winner highlighted

### 3. Components to create

#### `apps/nextjs/src/components/music/submission/submit-song.tsx`
- Spotify search with debounce
- Track result cards
- Submit button per track

#### `apps/nextjs/src/components/music/submission/track-list.tsx`
- Display submitted tracks with album art, name, artist
- Delete button (own submissions, during SUBMISSION phase only)

#### `apps/nextjs/src/components/music/voting/vote-interface.tsx`
- Point allocation interface
- Track cards with +/- buttons for points
- Comment input per track
- Remaining points counter
- Submit button with validation

#### `apps/nextjs/src/components/music/results/round-results.tsx`
- Ranked results table
- Vote breakdown per submission
- Comments display
- Winner highlight

#### `apps/nextjs/src/app/leagues/[leagueId]/rounds/[roundId]/_components/round-status-board.tsx`
- Grid/list of league members
- Checkmarks for submitted/voted status
- Only show relevant status for current phase

### 4. Playlist Page (`apps/nextjs/src/app/leagues/[leagueId]/rounds/[roundId]/playlist/page.tsx`)

Simple page showing:
- Round theme info
- Track list with full metadata
- Link to Spotify playlist
- Spotify embed (iframe) if playlist URL is available

### 5. Verify

```bash
pnpm dev:next
```

Test the full round lifecycle:
1. Create a round in a league
2. Submit a song (search Spotify, select track)
3. Advance to LISTENING → verify submitters hidden
4. Advance to VOTING → allocate points, add comments
5. Advance to RESULTS → verify results display correctly
