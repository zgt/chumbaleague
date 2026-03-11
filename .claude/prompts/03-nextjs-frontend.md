In ~/coding/chumbaleague/apps/nextjs, the LISTENING round phase has been removed. Rounds now go SUBMISSION → VOTING → RESULTS → COMPLETED.

Update apps/nextjs/src/app/leagues/[leagueId]/rounds/[roundId]/page.tsx:
1. Remove "LISTENING" from the PHASES array (line ~42). It should be: SUBMISSION, VOTING, RESULTS
2. Remove the "LISTENING" label from PHASE_LABELS (line ~45)
3. Line ~191: Remove the LISTENING check, just check for VOTING
4. Line ~311: Remove the LISTENING-specific UI branch
5. Line ~503: Remove the `if (round.status === "LISTENING")` block entirely

During the VOTING phase, add a prominent "Listen on Spotify" button that links to round.playlistUrl (the Spotify playlist). Show it at the top of the voting UI so users can listen before voting. Use an external link icon. Only show the button if playlistUrl exists.

Also update apps/nextjs/src/app/leagues/[leagueId]/page.tsx line ~373 — remove "LISTENING" from any status checks there.

Search for any other "LISTENING" references in the nextjs app and remove/update them.
