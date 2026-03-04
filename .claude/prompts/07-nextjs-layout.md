# Step 7: Next.js App Layout, Auth, and Navigation

Set up the Next.js app structure, branding, and navigation for Chumbaleague. The web app will be the primary interface at `music.calayo.net`.

## Reference

Look at the tokilist Next.js music pages for the existing UI patterns:
- Layout: `~/coding/todo-list/apps/nextjs/src/app/music/layout.tsx`
- Home: `~/coding/todo-list/apps/nextjs/src/app/music/page.tsx`
- Breadcrumbs: `~/coding/todo-list/apps/nextjs/src/app/music/music-breadcrumbs.tsx`

## What to do

### 1. Update `apps/nextjs/src/app/layout.tsx`

- Change the app title/metadata from the scaffold default to "Chumbaleague"
- Set description to something like "Music leagues with friends"
- Keep the existing TRPCReactProvider, auth, and theme setup from the scaffold

### 2. Create the main app layout

Since this is a standalone music league app (not nested under `/music`), the routes should be at the root level:

```
apps/nextjs/src/app/
├── layout.tsx              (root layout — already exists)
├── page.tsx                (home/dashboard — league list)
├── leagues/
│   ├── create/page.tsx     (create league form)
│   └── [leagueId]/
│       ├── page.tsx        (league detail)
│       └── rounds/
│           ├── create/page.tsx    (create round)
│           └── [roundId]/
│               ├── page.tsx       (round detail — submission/voting/results)
│               └── playlist/page.tsx (playlist view)
├── join/
│   └── [inviteCode]/page.tsx  (join league via invite)
├── profile/page.tsx        (user profile & stats)
├── settings/page.tsx       (notification settings)
```

### 3. Create a navigation component

Create `apps/nextjs/src/components/nav.tsx` (or similar) with:

- App logo/name "Chumbaleague" linking to home
- Navigation links: Home (leagues list), Profile, Settings
- Auth status (sign in/out with Better-Auth)
- Mobile-responsive nav (hamburger menu or similar)

Reference the tokilist music layout for the navigation pattern but simplify it — this is a standalone app, not a sub-section.

### 4. Create breadcrumb component

Create `apps/nextjs/src/components/breadcrumbs.tsx`:

- Dynamic breadcrumbs based on the current route
- Home → League Name → Round # pattern
- Reference `~/coding/todo-list/apps/nextjs/src/app/music/music-breadcrumbs.tsx`

### 5. Update the root page (`apps/nextjs/src/app/page.tsx`)

Replace the scaffold landing page with:

- If not authenticated: show a landing/hero page with "Sign in to get started" (Discord/Apple OAuth)
- If authenticated: redirect to or render the league list (this will be built in step 8)

For now, create a simple placeholder that shows auth status and a "Your Leagues" heading.

### 6. Auth pages

The scaffold should already have auth wired up via Better-Auth. Verify:
- `apps/nextjs/src/app/api/auth/[...all]/route.ts` exists
- `apps/nextjs/src/auth/client.ts` and `server.ts` exist
- Sign in/out works

If auth config references "tokilist://" in trusted origins, update to "chumbaleague://" for the Expo app.

### 7. Styling

Copy over the DotBackground component and logic from tokilist. I want to reuse that as well as the ripple trigger on mutations.

Keep the existing Tailwind setup from the scaffold. The tokilist music pages use a dark theme with teal/emerald accents — you can follow that pattern or establish a new Chumbaleague design system. At minimum:



- Dark background
- Good contrast for readability
- Music-themed accent colors

### 8. Verify

```bash
pnpm dev:next
```

The app should start, show the navigation, and handle auth sign-in/sign-out. Pages will be placeholder content — the actual league/round UI comes in the next steps.
