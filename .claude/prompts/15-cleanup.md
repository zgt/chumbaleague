# Step 15: Cleanup and Final Wiring

Remove scaffold code, set up environment, and prepare for deployment.

## What to do

### 1. Remove scaffold code

- Delete `packages/api/src/router/post.ts`
- Remove `post` router from `packages/api/src/root.ts`
- Delete `apps/nextjs/src/app/_components/posts.tsx`
- Remove any references to the `Post` table from `packages/db/src/schema.ts` (if not already done in step 2)
- Remove `apps/tanstack-start` directory entirely (not needed for this project)
- Clean up the `apps/nextjs/src/app/_components/auth-showcase.tsx` if it's scaffold demo code

### 2. Environment variables

Create a `.env.example` file at the repo root with all required env vars:

```env
# Database (Vercel Postgres / Neon)
DATABASE_URL=
DATABASE_URL_NON_POOLING=

# Better Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
PRODUCTION_URL=https://music.calayo.net

# OAuth
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
APPLE_CLIENT_ID=
APPLE_CLIENT_SECRET=
APPLE_BUNDLE_ID=

# Spotify
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REFRESH_TOKEN=

# Email (Resend)
RESEND_API_KEY=

# Expo
EXPO_PROJECT_ID=
```

### 3. Update auth configuration

In `packages/auth/src/index.ts`:
- Update `trustedOrigins` to use `chumbaleague://` scheme instead of `tokilist://`
- Update `productionUrl` references

In `apps/nextjs/src/env.ts`:
- Add Spotify env vars to validation
- Add Resend env var
- Update any hardcoded URLs

### 4. Update branding throughout

Search for remaining references to "Tokilist", "create-t3-turbo", "acme" (in user-facing text):
- Page titles
- Meta descriptions
- Email templates (should be "Chumbaleague" already from step 5)
- App name in navigation

**Note**: The `@acme/*` package names in `package.json` files are fine to keep — they're internal workspace references, not user-facing. Changing them is a lot of work for no user benefit. Only change them if you want to.

### 5. Database setup

Once you have a database connection configured:

```bash
pnpm db:push  # Push schema to database
pnpm db:studio  # Verify tables in Drizzle Studio
```

### 6. Vercel deployment setup

- Create a new Vercel project for `music.calayo.net`
- Connect the Git repo
- Set root directory to `apps/nextjs`
- Configure all environment variables
- Set up the `music.calayo.net` custom domain

### 7. EAS setup (for Expo)

```bash
cd apps/expo
npx eas init  # Initialize EAS project
```

Create `eas.json` if not present:
```json
{
  "cli": { "version": ">= 14.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

### 8. Final verification

```bash
# Full type check
pnpm typecheck

# Build Next.js
cd apps/nextjs && pnpm build

# Lint
pnpm lint

# Format
pnpm format
```

### 9. Git

```bash
git add -A
git commit -m "feat: complete Chumbaleague music league app"
```

## Summary

At this point you should have:
- ✅ Updated packages matching tokilist versions
- ✅ Full music league schema (League, Round, Submission, Vote, Comment, etc.)
- ✅ Complete tRPC API (music league, Spotify, notifications, moderation)
- ✅ Next.js web app with all pages (leagues, rounds, profile, settings, join)
- ✅ Expo mobile app with all screens (same feature set)
- ✅ Email + push notifications
- ✅ Content moderation (reports, blocks, content filter)
- ✅ Clean environment setup
- ✅ Ready for deployment to `music.calayo.net`
