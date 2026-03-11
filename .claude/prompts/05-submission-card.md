In ~/coding/chumbaleague, during the SUBMISSION phase of a round, I want to show the user their submitted song(s) before the "Submit a Song" section.

For both apps/nextjs and apps/expo:

1. Check if the user has already submitted song(s) to the current round (this data should already be available from the round query — look at how submissions are fetched and filtered by `sub.userId === ctx.session.user.id` or similar).

2. If they have, show a card/section titled "Your Submission" (or "Your Submissions" if songsPerRound > 1) that displays:
   - Album art thumbnail
   - Song title
   - Artist name
   - A way to remove/delete the submission (if you want to resubmit a different song)

3. Place this card BELOW the submission phase header/info but ABOVE the "Submit a Song" search/input section.

4. If the user has already submitted the max number of songs (submissions.length >= songsPerRound), hide or disable the "Submit a Song" section and show a message like "You've submitted your song for this round" instead.

For Next.js: apps/nextjs/src/app/leagues/[leagueId]/rounds/[roundId]/page.tsx
For Expo: apps/expo/src/app/round/[id].tsx

Look at how existing submission data flows from the API to understand what fields are available (spotifyTrackId, trackName, artistName, albumArt, etc). Style it consistently with the existing UI.
