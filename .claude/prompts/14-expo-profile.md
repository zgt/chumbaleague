# Step 14: Expo Profile, Settings, and Remaining Screens

Build the profile, settings, blocked users screens, and wire up push notifications.

## Reference Files

- Profile: `~/coding/todo-list/apps/expo/src/app/music/profile.tsx`
- Settings: `~/coding/todo-list/apps/expo/src/app/music/settings.tsx`
- Blocked users: `~/coding/todo-list/apps/expo/src/app/music/blocked-users.tsx`

## What to do

### 1. Profile Screen (`apps/expo/src/app/profile.tsx`)

Call `api.musicLeague.getUserProfile`.

Display as a scrollable card layout:
- User avatar (large) + name
- Stats grid:
  - Leagues joined
  - Total points
  - Rounds won
  - Rounds participated
  - Total submissions
- Best submission card (if exists):
  - Album art, track name, artist
  - Points earned, round theme

### 2. Settings Screen (`apps/expo/src/app/settings.tsx`)

Notification preferences with toggle switches:
- Round start notifications
- Submission reminders
- Voting open notifications
- Results available notifications

Each toggle calls `api.musicLeague.updateNotificationPreferences` on change (debounced or with a save button).

Also include:
- Push notification permission request (using `expo-notifications`)
- Link to blocked users screen
- Sign out button
- App version info

### 3. Blocked Users Screen (`apps/expo/src/app/blocked-users.tsx`)

- FlatList of blocked users (call `api.moderation.getBlockedUsers`)
- Each row: user avatar, name, "Unblock" button
- Empty state: "You haven't blocked anyone"
- Unblock → `api.moderation.unblockUser` → refetch list

### 4. Push Notification Registration

In the root layout or a dedicated hook, set up push notification registration:

```ts
// On app start (after auth):
// 1. Request push notification permission
// 2. Get Expo push token
// 3. Register with server: api.notification.registerPushToken
```

Use `expo-notifications`:
- `getExpoPushTokenAsync()` to get the token
- `getPermissionsAsync()` / `requestPermissionsAsync()` for permission
- Register the token with the server on every app start (upsert)

Set up notification listeners for handling taps:
- When user taps a push notification, extract the `data` payload
- If `data.type === "league"`, navigate to the league/round detail screen

### 5. Deep Linking

Configure deep linking for:
- `chumbaleague://join/{inviteCode}` → Join screen
- `https://music.calayo.net/join/{inviteCode}` → Join screen (universal links)

Update the Expo linking configuration in `app.json` or the root layout.

### 6. Tab Navigation (Optional)

Consider whether the app should use tab navigation at the bottom:
- **Home** (league list) — 🏠
- **Profile** — 👤
- **Settings** — ⚙️

If using tabs, update the root layout to use Expo Router's tab navigator. If not, stick with stack navigation and put profile/settings accessible from a menu or header buttons.

### 7. Verify

```bash
cd apps/expo && pnpm dev
```

Test:
1. Profile screen shows stats
2. Settings toggles work
3. Push notification registration succeeds
4. Deep links work
5. Block/unblock flow works
