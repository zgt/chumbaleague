# Step 5: Email + Push Notification System

Add the notification infrastructure for email (Resend) and push (Expo) notifications.

## What to do

### 1. Add dependencies to `packages/api/package.json`

```json
"dependencies": {
  ...existing,
  "expo-server-sdk": "^5.0.0",
  "resend": "^6.9.2"
}
```

Run `pnpm install` after.

### 2. Create email system

#### `packages/api/src/lib/email/client.ts`

Simple Resend client wrapper. Copy from `~/coding/todo-list/packages/api/src/lib/email/client.ts`.

**IMPORTANT**: Change the `from` address from `"Tokilist <onboarding@resend.dev>"` to `"Chumbaleague <onboarding@resend.dev>"`. When a custom domain is configured later, this will change to something like `noreply@calayo.net`.

Uses env var: `RESEND_API_KEY`

#### `packages/api/src/lib/email/templates/base.ts`

Copy from tokilist. Change all "Tokilist Music Leagues" branding to "Chumbaleague". The template is a simple HTML email wrapper with dark theme styling.

#### `packages/api/src/lib/email/templates/round-started.ts`

Copy from `~/coding/todo-list/packages/api/src/lib/email/templates/round-started.ts`.

#### `packages/api/src/lib/email/templates/voting-open.ts`

Copy from `~/coding/todo-list/packages/api/src/lib/email/templates/voting-open.ts`.

#### `packages/api/src/lib/email/templates/results-available.ts`

Copy from `~/coding/todo-list/packages/api/src/lib/email/templates/results-available.ts`.

#### `packages/api/src/lib/email/templates/submission-reminder.ts`

Copy from `~/coding/todo-list/packages/api/src/lib/email/templates/submission-reminder.ts`.

#### `packages/api/src/lib/email/notifications.ts`

Copy from `~/coding/todo-list/packages/api/src/lib/email/notifications.ts`. This contains:
- `notifyRoundStarted(roundId)` — email all league members when a round starts
- `notifyVotingOpen(roundId)` — email when voting phase opens
- `notifyResultsAvailable(roundId)` — email when results are available
- `sendSubmissionReminders(roundId)` — email members who haven't submitted yet

All functions respect user notification preferences (`notificationPreferences` jsonb on user table).

### 3. Create push notification system

#### `packages/api/src/lib/push.ts`

Copy from `~/coding/todo-list/packages/api/src/lib/push.ts`. This contains:
- `sendPushToUsers(userIds, message)` — send push via Expo Push Service to multiple users
- `sendPushToUser(userId, message)` — single user convenience wrapper

Uses the `PushToken` table to look up Expo push tokens.

#### `packages/api/src/lib/push/notifications.ts`

Copy from `~/coding/todo-list/packages/api/src/lib/push/notifications.ts`. This contains:
- `pushNotifyRoundStarted(roundId)`
- `pushNotifyVotingOpen(roundId)`
- `pushNotifyResultsAvailable(roundId)`
- `pushNotifySubmissionReminder(roundId)`
- `pushNotifyVotingReminder(roundId)`

All respect notification preferences.

### 4. Create notification router

#### `packages/api/src/router/notification.ts`

Create a simple notification router for push token management. You'll need at minimum:

```ts
registerPushToken: protectedProcedure
  .input(z.object({ token: z.string(), platform: z.enum(["ios", "android"]) }))
  .mutation(...)  // Upsert push token for the current user

unregisterPushToken: protectedProcedure
  .input(z.object({ token: z.string() }))
  .mutation(...)  // Delete push token
```

Reference the tokilist notification router at `~/coding/todo-list/packages/api/src/router/notification.ts` if it exists for the exact implementation.

### 5. Add notification + push exports to `packages/api/package.json`

```json
"exports": {
  ...existing,
  "./notifications": {
    "types": "./dist/lib/email/notifications.d.ts",
    "default": "./src/lib/email/notifications.ts"
  },
  "./push-notifications": {
    "types": "./dist/lib/push/notifications.d.ts",
    "default": "./src/lib/push/notifications.ts"
  }
}
```

### 6. Wire up notifications in the music league router

Go back to `packages/api/src/router/music-league/index.ts` and uncomment/wire up all notification calls:

```ts
import { notifyResultsAvailable, notifyRoundStarted, notifyVotingOpen } from "../../lib/email/notifications";
import { pushNotifyResultsAvailable, pushNotifyRoundStarted, pushNotifyVotingOpen } from "../../lib/push/notifications";
```

These are called with `void` (fire-and-forget) in:
- `createRound` — when status is SUBMISSION (starting immediately)
- `advanceRoundPhase` — when transitioning to VOTING, RESULTS, or activating a PENDING round

### 7. Add notification router to root

Update `packages/api/src/root.ts`:

```ts
import { notificationRouter } from "./router/notification";

export const appRouter = createTRPCRouter({
  ...existing,
  notification: notificationRouter,
});
```

### 8. Verify

```bash
pnpm typecheck
```
