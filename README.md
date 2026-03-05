# Chumbaleague

A Spotify-integrated social music league app where friends join leagues, submit songs to themed rounds, vote with point budgets, and compete on leaderboards.

## Tech Stack

- **Turborepo** with **pnpm** for monorepo management
- **Next.js 16** with React 19 for web
- **Expo SDK 54** with React Native for mobile
- **tRPC v11** for type-safe API
- **Drizzle ORM** with PostgreSQL (Supabase)
- **Better Auth** for authentication (Discord OAuth)
- **Tailwind CSS v4** + **NativeWind v5** for styling
- **shadcn/ui** for web UI components
- **Spotify Web API** for track search and playlist generation

## Setup

```bash
# Install dependencies
pnpm i

# Configure environment variables
cp .env.example .env
# Fill in your .env values

# Generate Better Auth schema
pnpm auth:generate

# Push database schema
pnpm db:push

# Start development
pnpm dev
```

## Development

```bash
pnpm dev              # Run all apps
pnpm dev:next         # Run only Next.js
pnpm db:studio        # Open Drizzle Studio
pnpm typecheck        # TypeScript check
pnpm lint             # ESLint
pnpm format           # Prettier check
```

## Deployment

### Web (Vercel)

1. Create a Vercel project with `apps/nextjs` as root directory
2. Add environment variables
3. Deploy

### Mobile (Expo/EAS)

```bash
cd apps/expo
eas build --platform ios --profile production
eas submit --platform ios --latest
```

## Architecture

Based on [create-t3-turbo](https://github.com/t3-oss/create-t3-turbo). See [CLAUDE.md](./CLAUDE.md) for detailed architecture documentation.
