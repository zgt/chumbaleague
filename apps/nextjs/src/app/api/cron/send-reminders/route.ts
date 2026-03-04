import { NextResponse } from "next/server";

import { eq } from "@acme/db";
import { db } from "@acme/db/client";
import { Round } from "@acme/db/schema";

import { sendSubmissionReminders } from "@acme/api/notifications";
import {
  pushNotifySubmissionReminder,
  pushNotifyVotingReminder,
} from "@acme/api/push-notifications";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const now = new Date();
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  let reminded = 0;

  // Find SUBMISSION rounds with deadline within the next 24 hours
  const submissionRounds = await db.query.Round.findMany({
    where: eq(Round.status, "SUBMISSION"),
  });

  for (const round of submissionRounds) {
    if (round.submissionDeadline > now && round.submissionDeadline <= in24Hours) {
      void sendSubmissionReminders(round.id);
      void pushNotifySubmissionReminder(round.id);
      reminded++;
    }
  }

  // Find VOTING rounds with deadline within the next 24 hours
  const votingRounds = await db.query.Round.findMany({
    where: eq(Round.status, "VOTING"),
  });

  for (const round of votingRounds) {
    if (round.votingDeadline > now && round.votingDeadline <= in24Hours) {
      void pushNotifyVotingReminder(round.id);
      reminded++;
    }
  }

  return NextResponse.json({ ok: true, reminded });
}
