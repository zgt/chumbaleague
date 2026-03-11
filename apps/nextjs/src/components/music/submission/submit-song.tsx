"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Clock, Loader2, Music2, Search, X } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@acme/ui/alert-dialog";
import { Button } from "@acme/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";
import { Input } from "@acme/ui/input";

import { useTRPC } from "~/trpc/react";

interface ExistingSubmission {
  id: string;
  trackName: string;
  artistName: string;
  albumArtUrl: string;
}

interface SubmitSongProps {
  roundId: string;
  songsPerRound: number;
  existingSubmissions?: ExistingSubmission[];
}

interface SpotifyTrack {
  spotifyTrackId: string;
  trackName: string;
  artistName: string;
  albumName: string;
  albumArtUrl: string | null;
  previewUrl: string | null;
  trackDurationMs: number;
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function SubmitSong({
  roundId,
  songsPerRound,
  existingSubmissions = [],
}: SubmitSongProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const hasMaxSubmissions = existingSubmissions.length >= songsPerRound;

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setShowResults(true);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (!value.trim()) {
      setDebouncedQuery("");
      return;
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(value.trim());
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const { data: searchResults, isFetching: isSearching } = useQuery(
    trpc.musicLeague.searchSpotify.queryOptions(
      { query: debouncedQuery, limit: 8 },
      { enabled: debouncedQuery.length > 0 },
    ),
  );

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target as Node)
    ) {
      setShowResults(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  const invalidateRound = () =>
    queryClient.invalidateQueries(
      trpc.musicLeague.getRoundById.queryOptions({ roundId }),
    );

  const createSubmission = useMutation(
    trpc.musicLeague.createSubmission.mutationOptions({
      onSuccess: () => {
        void invalidateRound();
        resetForm();
      },
    }),
  );

  const deleteSubmission = useMutation(
    trpc.musicLeague.deleteSubmission.mutationOptions(),
  );

  const resetForm = () => {
    setSelectedTrack(null);
    setSearchQuery("");
    setDebouncedQuery("");
  };

  const handleSelectTrack = (track: SpotifyTrack) => {
    setSelectedTrack(track);
    setShowResults(false);
    setSearchQuery("");
    setDebouncedQuery("");
  };

  const submitTrack = (track: SpotifyTrack) => {
    createSubmission.mutate({
      roundId,
      spotifyTrackId: track.spotifyTrackId,
      trackName: track.trackName,
      artistName: track.artistName,
      albumName: track.albumName,
      albumArtUrl: track.albumArtUrl ?? "",
      previewUrl: track.previewUrl,
      trackDurationMs: track.trackDurationMs,
    });
  };

  const handleSubmit = () => {
    if (!selectedTrack) return;

    if (hasMaxSubmissions) {
      setShowReplaceDialog(true);
    } else {
      submitTrack(selectedTrack);
    }
  };

  const handleConfirmReplace = async () => {
    if (!selectedTrack) return;
    setIsReplacing(true);

    try {
      // Delete all existing submissions first
      for (const sub of existingSubmissions) {
        await deleteSubmission.mutateAsync({ submissionId: sub.id });
      }
      // Then create the new one
      submitTrack(selectedTrack);
    } catch {
      // Error handled by mutation
    } finally {
      setIsReplacing(false);
      setShowReplaceDialog(false);
    }
  };

  const isPending = createSubmission.isPending || isReplacing;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music2 className="h-5 w-5" />
            {hasMaxSubmissions ? "Change Your Song" : "Submit a Song"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedTrack ? (
            <div className="space-y-4">
              <div className="border-border/50 flex gap-4 rounded-lg border p-4">
                {selectedTrack.albumArtUrl ? (
                  <Image
                    src={selectedTrack.albumArtUrl}
                    alt={selectedTrack.albumName}
                    width={80}
                    height={80}
                    className="h-20 w-20 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div className="bg-muted flex h-20 w-20 shrink-0 items-center justify-center rounded-md">
                    <Music2 className="text-muted-foreground h-8 w-8" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    {selectedTrack.trackName}
                  </p>
                  <p className="text-muted-foreground truncate text-sm">
                    {selectedTrack.artistName}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {selectedTrack.albumName}
                  </p>
                  <div className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                    <Clock className="h-3 w-3" />
                    {formatDuration(selectedTrack.trackDurationMs)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTrack(null);
                    setTimeout(() => inputRef.current?.focus(), 0);
                  }}
                  className="text-muted-foreground hover:text-foreground self-start transition-colors"
                  aria-label="Remove selection"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {createSubmission.error && (
                <p className="text-destructive text-sm" role="alert">
                  {createSubmission.error.message}
                </p>
              )}

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedTrack(null);
                    setTimeout(() => inputRef.current?.focus(), 0);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isPending}
                  className="flex-1"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isReplacing ? "Replacing..." : "Submitting..."}
                    </>
                  ) : hasMaxSubmissions ? (
                    "Replace Song"
                  ) : (
                    "Submit Song"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  ref={inputRef}
                  placeholder="Search for a song on Spotify..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => {
                    if (debouncedQuery) setShowResults(true);
                  }}
                  className="pl-9"
                />
                {isSearching && (
                  <Loader2 className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin" />
                )}
              </div>

              {showResults && debouncedQuery && (
                <div className="absolute right-0 left-0 z-50 mt-1 max-h-[360px] overflow-y-auto rounded-lg border border-emerald-500/[0.08] bg-[#102A2A]/95 shadow-lg backdrop-blur-md">
                  {searchResults && searchResults.length > 0 ? (
                    <ul role="listbox" className="py-1">
                      {searchResults.map((track) => (
                        <li key={track.spotifyTrackId}>
                          <button
                            type="button"
                            className="hover:bg-accent flex w-full items-center gap-3 px-3 py-2 text-left transition-colors"
                            onClick={() => handleSelectTrack(track)}
                          >
                            {track.albumArtUrl ? (
                              <Image
                                src={track.albumArtUrl}
                                alt={track.albumName}
                                width={40}
                                height={40}
                                className="h-10 w-10 shrink-0 rounded object-cover"
                              />
                            ) : (
                              <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded">
                                <Music2 className="text-muted-foreground h-4 w-4" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {track.trackName}
                              </p>
                              <p className="text-muted-foreground truncate text-xs">
                                {track.artistName} &middot; {track.albumName}
                              </p>
                            </div>
                            <span className="text-muted-foreground shrink-0 text-xs">
                              {formatDuration(track.trackDurationMs)}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : !isSearching ? (
                    <div className="text-muted-foreground py-8 text-center text-sm">
                      No tracks found
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showReplaceDialog} onOpenChange={setShowReplaceDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Replace your submission?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  This will replace your current{" "}
                  {existingSubmissions.length > 1 ? "submissions" : "submission"}{" "}
                  with the new song.
                </p>

                {existingSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center gap-3 rounded-lg bg-red-500/10 p-3"
                  >
                    <span className="text-muted-foreground text-xs font-medium uppercase">
                      Removing
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {sub.trackName} — {sub.artistName}
                    </span>
                  </div>
                ))}

                {selectedTrack && (
                  <div className="flex items-center gap-3 rounded-lg bg-green-500/10 p-3">
                    <span className="text-xs font-medium uppercase text-green-500">
                      Adding
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {selectedTrack.trackName} — {selectedTrack.artistName}
                    </span>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isReplacing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmReplace}
              disabled={isReplacing}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {isReplacing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Replacing...
                </>
              ) : (
                "Replace Song"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
