# Step 10: Next.js Profile, Settings, and Standalone Pages

Build the user profile, notification settings, and any remaining Next.js pages.

## Reference Files

- Profile: `~/coding/todo-list/apps/nextjs/src/app/music/profile/page.tsx`
- Settings: `~/coding/todo-list/apps/nextjs/src/app/music/settings/page.tsx`

## What to do

### 1. Profile Page (`apps/nextjs/src/app/profile/page.tsx`)

Call `api.musicLeague.getUserProfile`.

Display user stats:
- User avatar + name
- Leagues joined count
- Total points across all leagues
- Rounds won
- Rounds participated
- Total submissions
- Best submission (track name, artist, album art, points, round theme)

### 2. Settings Page (`apps/nextjs/src/app/settings/page.tsx`)

Notification preferences form. Call `api.musicLeague.getUserProfile` to get current prefs, then `api.musicLeague.updateNotificationPreferences` on save.

Toggle switches for:
- Round start notifications
- Submission reminder notifications
- Voting open notifications
- Results available notifications

Also include:
- Sign out button
- Account info (email, auth provider)

### 3. Error and Loading States

Make sure all pages have proper:
- Loading states (skeletons or spinners while tRPC queries load)
- Error states (network errors, 404s, forbidden access)
- Empty states (no leagues, no rounds, no submissions)

### 4. Responsive Design

Verify all pages work on:
- Desktop (full layout)
- Tablet (responsive grid)
- Mobile (stacked layout, touch-friendly targets)

The web app at `music.calayo.net` needs to work well on mobile browsers too, since not everyone will have the native app.

### 5. Verify

```bash
pnpm dev:next
pnpm build  # Make sure it builds for production
```
