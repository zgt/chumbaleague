import { authRouter } from "./router/auth";
import { musicLeagueRouter } from "./router/music-league";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  musicLeague: musicLeagueRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
