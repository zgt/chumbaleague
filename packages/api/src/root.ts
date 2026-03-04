import { authRouter } from "./router/auth";
import { moderationRouter } from "./router/moderation";
import { musicLeagueRouter } from "./router/music-league";
import { notificationRouter } from "./router/notification";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  moderation: moderationRouter,
  musicLeague: musicLeagueRouter,
  notification: notificationRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
