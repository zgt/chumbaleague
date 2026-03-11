In ~/coding/chumbaleague, the LISTENING round phase has been removed from the schema. Update the API layer in packages/api/src/router/music-league/index.ts:

1. Line ~78-82: Where all members submit and it advances to "LISTENING", change to advance to "VOTING" instead. Also trigger the voting notifications (notifyVotingOpen, pushNotifyVotingOpen) at this point.

2. Line ~721: Where it checks `round.status === "LISTENING" || round.status === "VOTING"` for hiding submitter names, just check `round.status === "VOTING"`.

3. Line ~1291: In advanceRoundPhase, update the phaseOrder array to remove "LISTENING". It should be: SUBMISSION, VOTING, RESULTS, COMPLETED.

4. Also update apps/nextjs/src/app/api/cron/advance-rounds/route.ts:
   - The cron that advances SUBMISSION rounds past deadline should now advance to "VOTING" (not "LISTENING")
   - Remove any LISTENING-specific cron logic
   - Make sure voting notifications fire when auto-advancing from SUBMISSION to VOTING

Search for any other references to "LISTENING" in the packages/api directory and update them.
