In ~/coding/chumbaleague/apps/expo, the LISTENING round phase has been removed. Rounds now go SUBMISSION → VOTING → RESULTS → COMPLETED.

Update apps/expo/src/app/round/[id].tsx:
1. Remove the LISTENING entry from the status colors map (line ~46)
2. Remove "LISTENING" from PHASE_STEPS (line ~52). It should be: SUBMISSION, VOTING, RESULTS
3. Remove "LISTENING" from PHASE_LABELS (line ~55)
4. Line ~300: Where it checks for ["LISTENING", "VOTING", "RESULTS", "COMPLETED"], remove "LISTENING"
5. Line ~306: Remove the showTrackCount={round.status === "LISTENING"} prop or adjust it for VOTING
6. Line ~1623: Where LISTENING maps to "Voting" for the advance button, remove it

During the VOTING phase, add a "Listen on Spotify" button that opens the round's playlistUrl using Linking.openURL(). Place it prominently at the top of the voting section. Use a Spotify-green colored button with a music/external-link icon. Only show if playlistUrl exists.

Search for any other "LISTENING" references in the expo app and remove/update them.
