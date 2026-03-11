import { NextResponse } from "next/server";

import {
  notifyResultsAvailable,
  notifyRoundStarted,
  notifyVotingOpen,
} from "@acme/api/notifications";
import {
  pushNotifyResultsAvailable,
  pushNotifyRoundStarted,
  pushNotifyVotingOpen,
} from "@acme/api/push-notifications";
import { and, eq } from "@acme/db";
import { db } from "@acme/db/client";
import { League, Round } from "@acme/db/schema";

import { env } from "~/env";

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

async function activatePendingRound(leagueId: string) {
  const pendingRound = await db.query.Round.findFirst({
    where: and(eq(Round.leagueId, leagueId), eq(Round.status, "PENDING")),
    orderBy: (r, { asc }) => [asc(r.roundNumber)],
  });

  if (!pendingRound) return;

  const league = await db.query.League.findFirst({
    where: eq(League.id, leagueId),
  });

  if (!league) return;

  const now = new Date();
  const newSubmissionDeadline = addDays(now, league.submissionWindowDays);
  const newVotingDeadline = addDays(
    newSubmissionDeadline,
    league.votingWindowDays,
  );

  await db
    .update(Round)
    .set({
      status: "SUBMISSION",
      startDate: now,
      submissionDeadline: newSubmissionDeadline,
      votingDeadline: newVotingDeadline,
    })
    .where(eq(Round.id, pendingRound.id));

  void notifyRoundStarted(pendingRound.id);
  void pushNotifyRoundStarted(pendingRound.id);
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const now = new Date();
  let advanced = 0;

  // Find SUBMISSION rounds past their deadline → advance to VOTING
  const submissionRounds = await db.query.Round.findMany({
    where: eq(Round.status, "SUBMISSION"),
  });

  for (const round of submissionRounds) {
    if (round.submissionDeadline > now) continue;

    await db
      .update(Round)
      .set({ status: "VOTING" })
      .where(eq(Round.id, round.id));

    void notifyVotingOpen(round.id);
    void pushNotifyVotingOpen(round.id);
    advanced++;
  }

  // Find VOTING rounds past their deadline → advance to RESULTS
  const votingRounds = await db.query.Round.findMany({
    where: eq(Round.status, "VOTING"),
  });

  for (const round of votingRounds) {
    if (round.votingDeadline > now) continue;

    await db
      .update(Round)
      .set({ status: "RESULTS" })
      .where(eq(Round.id, round.id));

    void notifyResultsAvailable(round.id);
    void pushNotifyResultsAvailable(round.id);

    // Check for PENDING rounds to activate in this league
    await activatePendingRound(round.leagueId);
    advanced++;
  }

  return NextResponse.json({ ok: true, advanced });
}
