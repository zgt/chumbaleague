# Step 11: Expo App Layout, Auth, and Navigation

Set up the Expo (React Native) app structure, navigation, and auth for the Chumbaleague mobile app.

## Reference Files

Look at the tokilist Expo music section:
- Layout: `~/coding/todo-list/apps/expo/src/app/music/_layout.tsx`
- Home: `~/coding/todo-list/apps/expo/src/app/music/index.tsx`
- General app layout: `~/coding/todo-list/apps/expo/src/app/_layout.tsx`

## Important Expo/NativeWind Gotchas

These are hard-won lessons from tokilist development. Follow them strictly:

- **ScrollView is broken** for lists — use **FlatList** instead
- **FlatList must be a direct child of SafeAreaView** — wrapping in `<View style={{ flex: 1 }}>` causes zero height
- For form screens, use `FlatList` with `data={[{ key: 'form' }]}`, `renderItem={() => null}`, and put all content in `ListHeaderComponent`
- **Text must use `className` for colors** — inline `style={{ color: '...' }}` gets overridden by NativeWind
- **Never use `contentContainerClassName`** — use `contentContainerStyle` instead
- **Don't add `style={{ flex: 1 }}` or `flexGrow: 1` to FlatList** — bare FlatList works; adding flex props causes zero-height collapse
- **ScrollView/FlatList need `style={{ flex: 1 }}`** — `className="flex-1"` doesn't apply on scroll containers in NativeWind
- Use `Pressable` + `router.push()` instead of `<Link asChild>` (Link swallows children)
- Use `router.back()` for back navigation, never `<Link href="/...">`

## What to do

### 1. Update app config

Update `apps/expo/app.json` (or `app.config.ts`) with:
- App name: "Chumbaleague"
- Slug: "chumbaleague"
- Scheme: "chumbaleague" (for deep linking)
- Bundle identifier: pick an appropriate one (e.g., `net.calayo.chumbaleague`)

### 2. Set up navigation structure

Since this is a standalone music league app, the route structure should be:

```
apps/expo/src/app/
├── _layout.tsx              (root layout — auth provider, tRPC provider)
├── index.tsx                (home — league list)
├── sign-in.tsx              (auth screen)
├── league/
│   ├── create.tsx           (create league)
│   └── [id].tsx             (league detail)
├── round/
│   ├── create.tsx           (create round)
│   ├── [id].tsx             (round detail)
│   └── [id]/
│       ├── submit.tsx       (song submission)
│       └── playlist.tsx     (playlist view)
├── join/
│   └── [inviteCode].tsx     (join via invite)
├── profile.tsx              (user profile)
├── settings.tsx             (notification settings)
└── blocked-users.tsx        (manage blocked users)
```

### 3. Root layout (`apps/expo/src/app/_layout.tsx`)

Set up:
- TRPCProvider wrapping the app
- Auth session provider
- Theme (dark mode)
- Stack navigator with screens
- StatusBar configuration

Reference the existing scaffold layout and the tokilist root layout.

### 4. Auth screen (`apps/expo/src/app/sign-in.tsx`)

- Discord OAuth sign-in button
- Apple Sign-In button (if configured)
- Uses Better-Auth Expo client

Reference how tokilist handles auth on mobile. The auth config needs `enableOAuthProxy: true` for Expo redirects.

### 5. Home screen (`apps/expo/src/app/index.tsx`)

Simple league list:
- FlatList of leagues (direct child of SafeAreaView!)
- Each league card shows: name, member count, current round status
- "Create League" button
- "Join League" button (navigate to join flow)
- Pull-to-refresh

### 6. Add required Expo dependencies

The standalone music league app needs fewer deps than tokilist. The scaffold already has the basics. You may need to add:

```bash
pnpm -F @acme/expo add lucide-react-native expo-haptics expo-av
```

- `lucide-react-native` — icons
- `expo-haptics` — haptic feedback on interactions
- `expo-av` — audio preview playback for tracks

### 7. Verify

```bash
cd apps/expo
pnpm dev
```

The app should launch in Expo Go or dev client, show the auth screen, and after sign-in show an empty league list.
