# Step 4: Spotify Integration

Add the Spotify API client for track search and playlist generation.

## What to do

### 1. Create `packages/api/src/lib/spotify.ts`

Copy from `~/coding/todo-list/packages/api/src/lib/spotify.ts`. This file contains:

- **Client credentials token management** — cached access token for search (no user auth needed)
- **User-level token management** — refresh token flow for playlist creation (uses app owner's Spotify account)
- `searchTracks(query, limit)` — search Spotify catalog, returns `SpotifyTrack[]`
- `getTrack(trackId)` — get a single track by ID
- `createPlaylist(name, description, trackIds)` — create a public Spotify playlist and add tracks

The file uses these env vars:
- `SPOTIFY_CLIENT_ID` — Spotify app client ID
- `SPOTIFY_CLIENT_SECRET` — Spotify app client secret
- `SPOTIFY_REFRESH_TOKEN` — long-lived refresh token for the app owner's Spotify account (needed for playlist creation only)

### 2. Add the Spotify export to `packages/api/package.json`

Add a new export path so the Spotify client can be imported directly if needed:

```json
"exports": {
  ".": {
    "types": "./dist/index.d.ts",
    "default": "./src/index.ts"
  },
  "./spotify": {
    "types": "./dist/lib/spotify.d.ts",
    "default": "./src/lib/spotify.ts"
  }
}
```

### 3. Uncomment Spotify calls in the music league router

Go back to `packages/api/src/router/music-league/index.ts` and uncomment/wire up:

- `searchSpotify` procedure → calls `searchTracks` from `../../lib/spotify`
- `generateRoundPlaylist` procedure → calls `createPlaylist` from `../../lib/spotify`

Import at the top:
```ts
import { createPlaylist, searchTracks } from "../../lib/spotify";
```

### 4. Add env var validation (optional but recommended)

Consider adding Spotify env vars to your env validation in `apps/nextjs/src/env.ts`:

```ts
SPOTIFY_CLIENT_ID: z.string().min(1),
SPOTIFY_CLIENT_SECRET: z.string().min(1),
SPOTIFY_REFRESH_TOKEN: z.string().optional(), // Only needed for playlist creation
```

### 5. Verify

```bash
pnpm typecheck
```
