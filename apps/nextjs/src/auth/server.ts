import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { nextCookies } from "better-auth/next-js";

import { initAuth } from "@acme/auth";

import { env } from "~/env";

const baseUrl =
  env.VERCEL_ENV === "production"
    ? "https://music.calayo.net"
    : env.VERCEL_ENV === "preview"
      ? `https://${env.VERCEL_URL}`
      : (env.AUTH_REDIRECT_PROXY_URL ?? "http://localhost:3000");

console.log("[AUTH DEBUG]", {
  VERCEL_ENV: env.VERCEL_ENV,
  VERCEL_URL: env.VERCEL_URL,
  AUTH_REDIRECT_PROXY_URL: env.AUTH_REDIRECT_PROXY_URL,
  resolvedBaseUrl: baseUrl,
  resolvedProductionUrl: env.AUTH_REDIRECT_PROXY_URL ?? "https://music.calayo.net",
});

export const auth = initAuth({
  baseUrl,
  productionUrl:
    env.AUTH_REDIRECT_PROXY_URL ?? "https://music.calayo.net",
  secret: env.AUTH_SECRET,
  discordClientId: env.AUTH_DISCORD_ID,
  discordClientSecret: env.AUTH_DISCORD_SECRET,
  extraPlugins: [nextCookies()],
});

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);
