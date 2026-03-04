import { authRouter } from "./router/auth";
import { musicLeagueRouter } from "./router/music-league";
import { notificationRouter } from "./router/notification";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  musicLeague: musicLeagueRouter,
  notification: notificationRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
