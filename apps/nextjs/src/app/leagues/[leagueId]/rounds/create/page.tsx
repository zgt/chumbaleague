"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, GripVertical, Info } from "lucide-react";

import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import { Card, CardContent } from "@acme/ui/card";

import { AppShell } from "~/components/app-shell";
import { RoundInputForm } from "~/components/music/round-editor";
import { useTRPC } from "~/trpc/react";

export default function CreateRoundPage() {
  const params = useParams<{ leagueId: string }>();
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [themeName, setThemeName] = useState("");
  const [themeDescription, setThemeDescription] = useState("");

  const { data: league } = useQuery(
    trpc.musicLeague.getLeagueById.queryOptions({
      id: params.leagueId,
    }),
  );

  const hasUnfinishedRound = league?.rounds.some(
    (r: { status: string }) =>
      r.status !== "COMPLETED" && r.status !== "PENDING",
  );

  const createRound = useMutation(
    trpc.musicLeague.createRound.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(
          trpc.musicLeague.getLeagueById.queryFilter({
            id: params.leagueId,
          }),
        );
        setThemeName("");
        setThemeDescription("");
      },
    }),
  );

  const reorderRounds = useMutation(
    trpc.musicLeague.reorderRounds.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(
          trpc.musicLeague.getLeagueById.queryFilter({
            id: params.leagueId,
          }),
        );
      },
    }),
  );

  const handleAdd = () => {
    if (!themeName.trim()) return;
    createRound.mutate({
      leagueId: params.leagueId,
      themeName,
      themeDescription: themeDescription || undefined,
    });
  };

  // Separate reorderable (PENDING only) from locked rounds
  const reorderableRounds =
    league?.rounds.filter((r) => r.status === "PENDING") ?? [];

  const lockedRounds =
    league?.rounds.filter((r) => r.status !== "PENDING") ?? [];

  // Drag state for reorderable rounds
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const handleDragEnd = () => {
    const from = dragFrom;
    const to = dragOver;
    setDragFrom(null);
    setDragOver(null);

    if (from === null || to === null || from === to) return;

    // Build reordered list
    const reordered = [...reorderableRounds];
    const [moved] = reordered.splice(from, 1);
    if (moved) reordered.splice(to, 0, moved);

    reorderRounds.mutate({
      leagueId: params.leagueId,
      rounds: reordered.map((r, i) => ({ roundId: r.id, sortOrder: i })),
    });
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-xl py-4">
        <h1 className="mb-6 text-2xl font-bold">Create a New Round</h1>

        <Card>
          <CardContent className="space-y-5">
            <RoundInputForm
              themeName={themeName}
              setThemeName={setThemeName}
              themeDescription={themeDescription}
              setThemeDescription={setThemeDescription}
              onAdd={handleAdd}
              addLabel={
                createRound.isPending
                  ? "Creating..."
                  : hasUnfinishedRound
                    ? "Queue Round"
                    : "Create Round"
              }
            />

            <div className="bg-muted/50 border-border/50 rounded-lg border p-4">
              <p className="mb-3 text-sm font-medium">Round Schedule</p>
              {league ? (
                <div className="space-y-2">
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {league.submissionWindowDays} day
                      {league.submissionWindowDays !== 1 ? "s" : ""} for
                      submissions
                    </span>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {league.votingWindowDays} day
                      {league.votingWindowDays !== 1 ? "s" : ""} for voting
                    </span>
                  </div>
                  {hasUnfinishedRound && (
                    <div className="mt-2 flex items-start gap-2 rounded-md bg-orange-500/10 p-2.5">
                      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-500" />
                      <p className="text-xs text-orange-500">
                        This round will start after the current round ends
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">Loading...</div>
              )}
            </div>

            {createRound.error && (
              <p className="text-destructive text-sm">
                {createRound.error.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Existing rounds with reorder */}
        {league && league.rounds.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 text-lg font-semibold">Existing Rounds</h2>
            <Card>
              <CardContent className="space-y-2">
                {/* Locked rounds (not reorderable) */}
                {lockedRounds.map((round) => (
                  <div
                    key={round.id}
                    className="border-border/50 flex items-center gap-3 rounded-lg border p-3 opacity-60"
                  >
                    <div className="w-4" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        <span className="text-muted-foreground">
                          {round.roundNumber}.{" "}
                        </span>
                        {round.themeName}
                      </p>
                    </div>
                    <Badge variant="secondary">{round.status}</Badge>
                  </div>
                ))}

                {/* Reorderable rounds */}
                {reorderableRounds.map((round, idx) => (
                  <div
                    key={round.id}
                    draggable
                    onDragStart={() => setDragFrom(idx)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(idx);
                    }}
                    onDrop={(e) => e.preventDefault()}
                    onDragEnd={handleDragEnd}
                    className={`border-border/50 flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                      dragOver === idx
                        ? "border-emerald-500/40 bg-emerald-500/5"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <GripVertical className="text-muted-foreground h-4 w-4 shrink-0 cursor-grab" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        <span className="text-muted-foreground">
                          {round.roundNumber}.{" "}
                        </span>
                        {round.themeName}
                      </p>
                      {round.themeDescription && (
                        <p className="text-muted-foreground mt-0.5 truncate text-xs">
                          {round.themeDescription}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline">
                      {round.status === "PENDING" ? "Pending" : round.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-6">
          <Button variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
