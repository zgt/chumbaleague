# Step 1: Upgrade Package Versions

Chumbaleague was scaffolded from an older version of `create-t3-turbo`. The sibling project `~/coding/todo-list` has already been upgraded. Align all package versions to match.

## What to do

### 1. Root `package.json`

Update engine requirements and devDependencies to match tokilist:

```
engines.node: ^25.2.1
engines.pnpm: ^10.27.0
packageManager: pnpm@10.28.2
devDependencies:
  @turbo/gen: ^2.7.6
  dotenv-cli: ^11.0.0
  turbo: ^2.7.6
```

### 2. `pnpm-workspace.yaml` catalog versions

Replace the entire catalog section with these versions (from tokilist):

```yaml
catalog:
  '@better-auth/cli': 1.4.10
  '@better-auth/expo': 1.4.10
  '@eslint/js': ^9.39.2
  '@tailwindcss/postcss': ^4.1.18
  '@tailwindcss/vite': ^4.1.18
  '@tanstack/react-form': ^1.27.7
  '@tanstack/react-query': ^5.90.20
  '@trpc/client': ^11.8.1
  '@trpc/server': ^11.8.1
  '@trpc/tanstack-react-query': ^11.8.1
  '@types/node': ^25.0.3
  '@vitejs/plugin-react': 5.1.2
  better-auth: 1.4.10
  eslint: ^9.39.2
  prettier: ^3.8.1
  tailwindcss: ^4.1.18
  typescript: ^5.9.3
  vite: 7.3.1
  zod: ^4.3.5

catalogs:
  react19:
    '@types/react': ^19.2.9
    '@types/react-dom': ^19.2.3
    react: ^19.2.4
    react-dom: ^19.2.4
```

Also update the `overrides` section — keep `vite: 7.1.12` override for now (matches tokilist).

### 3. `apps/nextjs/package.json`

Update these dependencies:
- `@t3-oss/env-nextjs`: `^0.13.10`
- `next`: `16.1.1`
- `superjson`: `2.2.6`
- `jiti`: `^2.5.1`

Add a build script guard like tokilist:
```json
"build": "[ -f ../../.env ] && pnpm with-env next build || next build"
```

### 4. `apps/expo/package.json`

Update these dependencies:
- `expo`: `~54.0.33`
- `expo-constants`: `~18.0.13`
- `expo-dev-client`: `~6.0.20`
- `expo-linking`: `~8.0.11`
- `expo-router`: `~6.0.23`
- `expo-secure-store`: `~15.0.8`
- `expo-splash-screen`: `~31.0.13`
- `expo-status-bar`: `~3.0.9`
- `expo-system-ui`: `~6.0.9`
- `expo-web-browser`: `~15.0.10`
- `react-native-reanimated`: `~4.1.6`
- `react-native-safe-area-context`: `~5.6.2`
- `superjson`: `2.2.6`

Add the `expo.autolinking` config for hoisted modules:
```json
"expo": {
  "autolinking": {
    "searchPaths": ["../../node_modules", "./node_modules"]
  }
}
```

Add EAS build scripts:
```json
"build:dev": "eas build --profile development",
"build:preview": "eas build --profile preview",
"build:prod": "eas build --profile production",
"build:dev:ios": "eas build --profile development --platform ios",
"build:dev:android": "eas build --profile development --platform android",
"build:preview:ios": "eas build --profile preview --platform ios",
"build:preview:android": "eas build --profile preview --platform android",
"build:prod:ios": "eas build --profile production --platform ios",
"build:prod:android": "eas build --profile production --platform android",
"submit:ios": "eas submit --platform ios",
"submit:android": "eas submit --platform android"
```

Add devDependency:
- `@tailwindcss/postcss`: `catalog:`

### 5. `packages/db/package.json`

Update devDependency:
- `drizzle-kit`: `^0.31.8`

### 6. `packages/auth/package.json`

Update dependency:
- `@t3-oss/env-core`: `^0.13.10`

### 7. `packages/api/package.json`

Update dependency:
- `superjson`: `2.2.6`

### 8. After all edits

Run:
```bash
rm -rf node_modules apps/*/node_modules packages/*/node_modules tooling/*/node_modules
pnpm install
```

Then verify:
```bash
pnpm typecheck
```

Fix any type errors that arise from the upgrades before moving on.
