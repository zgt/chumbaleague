# Step 12: Expo League Screens

Build the league management screens for the Expo app.

## Reference Files

Copy and adapt from tokilist Expo:
- League list (home): `~/coding/todo-list/apps/expo/src/app/music/index.tsx`
- Create league: `~/coding/todo-list/apps/expo/src/app/music/league/create.tsx`
- League detail: `~/coding/todo-list/apps/expo/src/app/music/league/[id].tsx`
- Join: `~/coding/todo-list/apps/expo/src/app/music/join/[inviteCode].tsx`
- Components:
  - `~/coding/todo-list/apps/expo/src/components/music/CreateLeagueSheet.tsx`
  - `~/coding/todo-list/apps/expo/src/components/music/LeagueSettingsSheet.tsx`
  - `~/coding/todo-list/apps/expo/src/components/music/LeagueStandingsTable.tsx`

## Expo/NativeWind Reminders

- FlatList as direct child of SafeAreaView (no flex-1 wrapper View!)
- `contentContainerStyle` not `contentContainerClassName`
- `Pressable` + `router.push()` not `<Link asChild>`
- Text colors via `className` not inline style

## What to do

### 1. Create League Screen (`apps/expo/src/app/league/create.tsx`)

Form screen using FlatList with ListHeaderComponent pattern:
- League name input
- Description input
- Songs per round picker (1-5)
- Max members picker
- Allow downvotes toggle
- Upvote points per round
- Submission window days
- Voting window days

On submit → `api.musicLeague.createLeague` → navigate to league detail.

**OR** use a bottom sheet approach (reference `CreateLeagueSheet.tsx` from tokilist) — a bottom sheet triggered from the home screen. Either approach works; pick what feels better for mobile.

### 2. League Detail Screen (`apps/expo/src/app/league/[id].tsx`)

Call `api.musicLeague.getLeagueById`.

Display:
- League name + description
- Member avatars row
- Invite code with share button (use `Share` API from React Native)
  - Share link format: `https://music.calayo.net/join/{inviteCode}`
- Rounds list (FlatList) — each shows: round number, theme, status badge
  - Tap round → navigate to round detail
- "Create Round" button (owner/admin)
- League settings (owner) — bottom sheet with `LeagueSettingsSheet`
- Standings table (reference `LeagueStandingsTable.tsx`)
- Leave/delete league options

### 3. League Standings Component (`apps/expo/src/components/music/LeagueStandingsTable.tsx`)

Copy and adapt from tokilist. Mobile-friendly table/list showing:
- Rank, user avatar + name, total points, rounds won

### 4. League Settings Sheet (`apps/expo/src/components/music/LeagueSettingsSheet.tsx`)

Bottom sheet with league settings form (owner only):
- Same fields as create, but pre-populated
- Save button → `api.musicLeague.updateLeagueSettings`
- Regenerate invite code button
- Delete league button (with confirmation alert)

### 5. Join Screen (`apps/expo/src/app/join/[inviteCode].tsx`)

- Show league preview (name, description, member count)
- "Join" button → `api.musicLeague.joinLeague`
- Error handling (invalid code, full, already member)
- Redirect to league detail on success

This screen also needs to handle deep links: `chumbaleague://join/{inviteCode}` and `https://music.calayo.net/join/{inviteCode}`.

### 6. Verify

```bash
cd apps/expo && pnpm dev
```

Test: create a league, view detail, share invite code.
