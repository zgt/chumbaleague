# Chumbaleague Migration Plan

This folder contains step-by-step prompts for migrating the music league feature from `~/coding/todo-list` (Tokilist) into this standalone Chumbaleague app.

## Execution Order

Run these prompts in order. Each builds on the previous.

1. **01-upgrade-packages.md** — Align package versions with tokilist
2. **02-schema.md** — Add music league database schema
3. **03-api-core.md** — Core tRPC router (leagues, rounds, submissions, votes)
4. **04-api-spotify.md** — Spotify integration (search, playlist generation)
5. **05-api-notifications.md** — Email + push notification system
6. **06-api-moderation.md** — Content moderation (reports, blocks, content filter)
7. **07-nextjs-layout.md** — Next.js app layout, auth, and navigation
8. **08-nextjs-leagues.md** — Next.js league pages (list, create, detail, join)
9. **09-nextjs-rounds.md** — Next.js round pages (detail, submit, vote, results)
10. **10-nextjs-profile.md** — Next.js profile, settings, and standings
11. **11-expo-layout.md** — Expo app layout, auth, and navigation
12. **12-expo-leagues.md** — Expo league screens (list, create, detail, join)
13. **13-expo-rounds.md** — Expo round screens (detail, submit, vote, results)
14. **14-expo-profile.md** — Expo profile, settings, and component library
15. **15-cleanup.md** — Remove scaffold code, final wiring, env setup

## Source Reference

All music league code lives in `~/coding/todo-list` (the Tokilist monorepo). Key locations:

- Schema: `packages/db/src/schema.ts` (League, LeagueMember, Round, Submission, Vote, Comment, Report, BlockedUser, ContentFlag, ThemeTemplate, PushToken tables)
- API router: `packages/api/src/router/music-league/index.ts`
- Spotify lib: `packages/api/src/lib/spotify.ts`
- Email notifications: `packages/api/src/lib/email/`
- Push notifications: `packages/api/src/lib/push/`
- Content filter: `packages/api/src/lib/content-filter.ts`
- Moderation router: `packages/api/src/router/moderation.ts`
- Next.js pages: `apps/nextjs/src/app/music/`
- Next.js components: `apps/nextjs/src/components/music/`
- Expo screens: `apps/expo/src/app/music/`
- Expo components: `apps/expo/src/components/music/`

## Important Notes

- This app will be hosted at `music.calayo.net`
- Auth uses Better-Auth with Discord + Apple OAuth (same as tokilist)
- The `user` table needs `notificationPreferences` jsonb column added
- Remove all tokilist-specific code (tasks, categories, lists, sync, etc.)
- Rename "Tokilist" references to "Chumbaleague" throughout
