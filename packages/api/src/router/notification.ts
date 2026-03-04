import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { and, eq } from "@acme/db";
import { PushToken } from "@acme/db/schema";

import { protectedProcedure } from "../trpc";

export const notificationRouter = {
  registerPushToken: protectedProcedure
    .input(
      z.object({
        token: z.string().min(1),
        platform: z.enum(["ios", "android"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const existing = await ctx.db.query.PushToken.findFirst({
        where: eq(PushToken.token, input.token),
      });

      if (existing) {
        if (existing.userId === userId) {
          await ctx.db
            .update(PushToken)
            .set({ updatedAt: new Date() })
            .where(eq(PushToken.id, existing.id));
        } else {
          await ctx.db
            .update(PushToken)
            .set({ userId, updatedAt: new Date() })
            .where(eq(PushToken.id, existing.id));
        }
      } else {
        await ctx.db.insert(PushToken).values({
          userId,
          token: input.token,
          platform: input.platform,
        });
      }

      return { success: true };
    }),

  unregisterPushToken: protectedProcedure
    .input(z.object({ token: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(PushToken)
        .where(
          and(
            eq(PushToken.token, input.token),
            eq(PushToken.userId, ctx.session.user.id),
          ),
        );

      return { success: true };
    }),
} satisfies TRPCRouterRecord;
