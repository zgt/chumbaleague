# Step 13: Expo Round Screens

Build the round detail screens — the core gameplay on mobile: submission, voting, and results.

## Reference Files

Copy and adapt from tokilist Expo:
- Round detail: `~/coding/todo-list/apps/expo/src/app/music/round/[id].tsx`
- Submit song: `~/coding/todo-list/apps/expo/src/app/music/round/[id]/submit.tsx`
- Playlist: `~/coding/todo-list/apps/expo/src/app/music/round/[id]/playlist.tsx`
- Create round: `~/coding/todo-list/apps/expo/src/app/music/round/create.tsx`
- Components:
  - `~/coding/todo-list/apps/expo/src/components/music/SpotifyTrackCard.tsx`
  - `~/coding/todo-list/apps/expo/src/components/music/AudioPreviewPlayer.tsx`
  - `~/coding/todo-list/apps/expo/src/components/music/CreateRoundSheet.tsx`
  - `~/coding/todo-list/apps/expo/src/components/music/ThemeTemplatePicker.tsx`
  - `~/coding/todo-list/apps/expo/src/components/music/ReportSheet.tsx`

## Expo/NativeWind Reminders

- FlatList as direct child of SafeAreaView
- `contentContainerStyle` not `contentContainerClassName`
- For complex screens with mixed content + lists, use FlatList with `ListHeaderComponent` for the header content and the actual list data in `data`/`renderItem`

## What to do

### 1. Create Round (`apps/expo/src/app/round/create.tsx`)

Form screen (or bottom sheet `CreateRoundSheet`):
- Theme name input
- Theme description input (optional)
- Theme template picker (optional — shows predefined themes from ThemeTemplate table)
- LeagueId passed via route params

On submit → `api.musicLeague.createRound` → navigate to round detail.

### 2. Round Detail (`apps/expo/src/app/round/[id].tsx`)

The main gameplay screen. Call `api.musicLeague.getRoundById`.

**Common header:**
- Round number + theme name + description
- Status badge with color coding
- Deadline info (submission or voting deadline)
- Admin: "Advance Phase" button
- Playlist link button (opens Spotify)

**Phase-specific content (render conditionally):**

#### SUBMISSION phase:
- "Submit a Song" button → navigates to submit screen
- List of user's current submissions (with delete button)
- Member status board (who submitted)
- Song count: "X of Y members submitted"

#### LISTENING phase:
- Track list (all submissions, submitters hidden)
- Audio preview player for each track (using `expo-av`)
- Playlist link

#### VOTING phase:
- Track list with voting controls
- Per-track: +/- point buttons, comment input
- Points budget display: "X of Y points remaining"
- If downvotes enabled: separate downvote allocation
- Cannot vote on own submissions (grey them out)
- "Submit Votes" button → `api.musicLeague.submitVotes`
- Use haptic feedback on vote interactions (`expo-haptics`)

#### RESULTS / COMPLETED:
- Results list ranked by total points
- Winner highlight (gold/trophy treatment)
- Each submission shows: track info, submitter revealed, total points, vote breakdown, comments

### 3. Submit Song Screen (`apps/expo/src/app/round/[id]/submit.tsx`)

- Search bar with real-time Spotify search (`api.musicLeague.searchSpotify`)
- Debounced search (300ms)
- Search results as `SpotifyTrackCard` components in a FlatList
- Each card shows: album art, track name, artist, duration
- Tap card → confirm submission → `api.musicLeague.createSubmission`
- Audio preview on long press (optional)
- Back navigation after successful submission

### 4. Playlist Screen (`apps/expo/src/app/round/[id]/playlist.tsx`)

- Track list with full metadata
- Audio preview per track
- "Open in Spotify" button (opens playlist URL)

### 5. Components

#### `apps/expo/src/components/music/SpotifyTrackCard.tsx`
- Album art thumbnail (60x60 or similar)
- Track name (bold), artist name, album name
- Duration formatted (m:ss)
- Pressable with onPress callback
- Optional: preview play button

#### `apps/expo/src/components/music/AudioPreviewPlayer.tsx`
- Uses `expo-av` Audio API
- Play/pause button
- Progress bar
- Auto-stops when component unmounts or another track starts
- Handles tracks with no preview URL gracefully

#### `apps/expo/src/components/music/CreateRoundSheet.tsx`
- Bottom sheet alternative for round creation
- Theme name + description inputs
- Template picker

#### `apps/expo/src/components/music/ThemeTemplatePicker.tsx`
- Horizontal scrollable list of theme templates
- Each template: name, description, category
- Tap to select → fills in theme name and description

#### `apps/expo/src/components/music/ReportSheet.tsx`
- Bottom sheet for reporting content
- Reason picker (SPAM, OFFENSIVE, HARASSMENT, OTHER)
- Details text input
- Submit → `api.moderation.reportContent`

### 6. Verify

```bash
cd apps/expo && pnpm dev
```

Test the full round lifecycle on mobile:
1. Create round with theme
2. Submit a song (search + select)
3. Advance phases and verify UI changes
4. Vote on submissions
5. View results
