# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chumbaleague is a Turborepo monorepo for a Music League app — a Spotify-integrated social game where friends join leagues, submit songs to themed rounds, vote with point budgets, and compete on leaderboards. The app has web (Next.js) and mobile (Expo/React Native) frontends sharing a common tRPC API backend.

### Tech Stack

- **Turborepo** with **pnpm 10** for monorepo management
- **Next.js 16** with React 19 for web
- **Expo SDK 54** with React Native 0.81 for mobile
- **tRPC v11** for type-safe API layer
- **Drizzle ORM** with PostgreSQL (Supabase) via `@neondatabase/serverless`
- **Better Auth** for authentication (Discord OAuth, session management)
- **Tailwind CSS v4** + **NativeWind v5** for styling
- **shadcn/ui** for web UI components
- **Spotify Web API** for track search and playlist generation
- **Zod v4** (`zod/v4`) for validation

### Reference Implementation

The Music League feature set is already implemented in `~/coding/todo-list` (tokilist). Refer to that project's `packages/api/src/router/music-league/` for the complete tRPC router, `packages/db/src/schema.ts` for the database schema, and `apps/nextjs/src/app/music/` for the web UI. The goal is to replicate and refine that architecture here.

## Development Commands

### Initial Setup

```bash
pnpm i
pnpm auth:generate    # Generate Better Auth schema (REQUIRED before first run)
pnpm db:push          # Push database schema to Supabase
```

### Development

```bash
pnpm dev              # Run all apps in watch mode (turbo watch)
pnpm dev:next         # Run only Next.js app and its dependencies
pnpm db:studio        # Open Drizzle Studio
```

### Code Quality

```bash
pnpm lint             # ESLint across all packages
pnpm lint:fix         # ESLint with auto-fix
pnpm format           # Prettier check
pnpm format:fix       # Prettier write
pnpm typecheck        # TypeScript check all packages
pnpm lint:ws          # Workspace dependency validation (sherif)
```

### UI Components

```bash
pnpm ui-add           # Add shadcn/ui component (runs shadcn CLI in packages/ui)
```

After adding components via shadcn, fix imports:
- `lucide-react` → `@radix-ui/react-icons`
- `src/lib/utils` → `@acme/ui`

### Database

```bash
pnpm db:push          # Push Drizzle schema to database
pnpm db:studio        # Open Drizzle Studio
# If db:push fails with interactive error:
cd packages/db && pnpm push
```

### Mobile

```bash
pnpm ios              # expo run:ios
pnpm android          # expo run:android
```

## Architecture

### Monorepo Structure

```
apps/
  ├── nextjs/          # Next.js 16 web app (primary)
  └── expo/            # Expo/React Native mobile app
packages/
  ├── api/             # Shared tRPC router definitions
  ├── auth/            # Better Auth configuration
  ├── db/              # Drizzle schema and client
  ├── ui/              # Shared shadcn/ui components (web only)
  └── validators/      # Shared Zod schemas (placeholder)
tooling/
  ├── eslint/          # ESLint flat config (ESLint 9)
  ├── prettier/        # Prettier config with import sorting
  ├── tailwind/        # Shared Tailwind theme (theme.css)
  └── typescript/      # Shared tsconfig (strict, ES2022)
```

Internal packages use `@acme/*` namespace. Always use package names for cross-package imports, never relative paths.

### Package Dependencies

- **Next.js app** → `@acme/api`, `@acme/auth`, `@acme/db`, `@acme/ui`
- **Expo app** → `@acme/api` (dev only, for types), `@acme/auth`
- **API package** → `@acme/auth`, `@acme/db`
- **Auth package** → `@acme/db`

### Database

- Schema: `packages/db/src/schema.ts` (application tables)
- Auth schema: `packages/db/src/auth-schema.ts` (auto-generated — never edit manually)
- Uses `snake_case` column naming (configured in `drizzle.config.ts`)
- Connection uses pooler URL (port 6543) at runtime; Drizzle Kit uses direct URL (port 5432)

To modify auth tables: edit `packages/auth/script/auth-cli.ts` → `pnpm auth:generate` → `pnpm db:push`.

### tRPC API Pattern

1. Create router file in `packages/api/src/router/`
2. Define procedures using `publicProcedure` or `protectedProcedure`
3. Register in `packages/api/src/root.ts`

Protected queries must always filter by `ctx.session.user.id`. Authorization checks fetch the member record first and verify role before admin operations.

### Authentication

Better Auth config is split:
- **Runtime**: `packages/auth/src/index.ts` (used by apps)
- **CLI**: `packages/auth/script/auth-cli.ts` (schema generation only, isolated in `script/`)

Uses Discord OAuth. Expo uses `@better-auth/expo` adapter with OAuth proxy.

### Cross-Platform

- **Web**: Uses `@acme/ui` (shadcn/ui + Radix). Client components marked `"use client"`.
- **Mobile**: Cannot use `@acme/ui`. Uses React Native components + NativeWind v5.
- **Shared**: Both use TanStack Query for state management. tRPC client setup differs per platform.

## Music League Domain

### Core Concepts

Leagues → Rounds → Submissions → Votes. Friends join leagues via invite codes, submit Spotify tracks to themed rounds, listen anonymously, vote with point budgets, and compete on leaderboards.

### Round Lifecycle (State Machine)

`PENDING` → `SUBMISSION` → `LISTENING` → `VOTING` → `RESULTS` → `COMPLETED`

- Only OWNER/ADMIN can create rounds or advance phases
- One PENDING round per league max — auto-activates when current round completes
- Deadlines computed from league settings (`submissionWindowDays`, `votingWindowDays`)

### Phase-Gated Data Visibility

This is critical — the API returns different data based on round status:
- **SUBMISSION**: Only submitter sees their own submission
- **LISTENING/VOTING**: Submitter identity hidden (anonymous). Own submission marked `isOwn`
- **RESULTS/COMPLETED**: Full reveal — all votes, comments, submitter names, points

### Key Domain Rules

- **Leagues**: Configurable `songsPerRound` (1-5), `maxMembers` (2-50), `allowDownvotes`, point budgets. 8-char alphanumeric invite codes. Roles: OWNER, ADMIN, MEMBER. OWNER cannot leave without transferring ownership.
- **Submissions**: Spotify track search (debounced 300ms). Duplicates within same round rejected. Deletable only during SUBMISSION phase by submitter.
- **Voting**: Separate upvote/downvote budgets. Cannot vote on own submission. Re-voting replaces all previous votes+comments in a transaction.
- **Spotify**: Client Credentials flow for search (cached token). Refresh Token flow for playlist creation (batches of 100 tracks).
- **Notifications**: Fire-and-forget (`void` the promise, never `await`) on phase transitions.
- **Content moderation**: Soft-only — content never blocked, flagged entries stored for review.

### Adding a New Feature

1. **Schema**: Add table to `packages/db/src/schema.ts`
2. **API**: Create/update router in `packages/api/src/router/`, register in `root.ts`
3. **Web UI**: Create components in `apps/nextjs/src/app/`
4. **Push**: `pnpm db:push`

### Database Table Conventions

- UUID primary keys with `$defaultFn(() => crypto.randomUUID())`
- `text` type for IDs
- Timestamps: `createdAt`, `updatedAt` (with `$onUpdateFn`), `withTimezone: true, mode: "date"`
- Foreign keys cascade on delete
- Indexes on all FK columns and common query patterns

## Code Style

- **TypeScript**: Strict mode, `noUncheckedIndexedAccess` enabled
- **Imports**: `@acme/*` package names across packages
- **Components**: Functional, TypeScript, PascalCase
- **Database**: snake_case (auto-converted by Drizzle casing config)
- **Env validation**: `@t3-oss/env-nextjs` in Next.js app

## Environment Variables

Required in `.env` at repo root:

```bash
POSTGRES_URL=              # Supabase PostgreSQL connection string (pooler, port 6543)
AUTH_SECRET=               # openssl rand -base64 32
AUTH_DISCORD_ID=           # Discord OAuth client ID
AUTH_DISCORD_SECRET=       # Discord OAuth client secret
SPOTIFY_CLIENT_ID=         # Spotify app client ID
SPOTIFY_CLIENT_SECRET=     # Spotify app client secret
SPOTIFY_REFRESH_TOKEN=     # Spotify user refresh token (for playlist creation)
```

## CI/CD

GitHub Actions runs three parallel jobs on PRs/pushes to `main`: `lint`, `format`, `typecheck`. Supports Turbo Remote Caching. Deployment target: Vercel.
