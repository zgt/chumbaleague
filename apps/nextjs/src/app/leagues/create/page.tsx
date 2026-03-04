"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { GripVertical, Plus, Trash2, X } from "lucide-react";

import { Button } from "@acme/ui/button";
import { Card, CardContent } from "@acme/ui/card";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import { Switch } from "@acme/ui/switch";
import { Textarea } from "@acme/ui/textarea";

import { AppShell } from "~/components/app-shell";
import { NumberStepper } from "~/components/number-stepper";
import { useTRPC } from "~/trpc/react";

// ─── Constants ──────────────────────────────────────────────────────────────

const SUBMISSION_WINDOW_PRESETS = [
  { label: "1 day", days: 1 },
  { label: "2 days", days: 2 },
  { label: "3 days", days: 3 },
  { label: "5 days", days: 5 },
  { label: "1 week", days: 7 },
];

const VOTING_WINDOW_PRESETS = [
  { label: "1 day", days: 1 },
  { label: "2 days", days: 2 },
  { label: "3 days", days: 3 },
  { label: "5 days", days: 5 },
];

const DEADLINE_BEHAVIORS = [
  {
    value: "STEADY" as const,
    label: "Steady",
    description:
      "Fixed deadlines. Rounds run their full duration regardless of when members finish.",
  },
  {
    value: "ACCELERATED" as const,
    label: "Accelerated",
    description:
      "Auto-advance when all members finish, but the next round still starts on schedule.",
  },
  {
    value: "SPEEDY" as const,
    label: "Speedy",
    description:
      "Auto-advance immediately and start the next round right away when everyone finishes.",
  },
];

// ─── Types ──────────────────────────────────────────────────────────────────

interface RoundDraft {
  id: string;
  themeName: string;
  themeDescription: string;
}

// ─── Page Component ─────────────────────────────────────────────────────────

export default function CreateLeaguePage() {
  const trpc = useTRPC();
  const router = useRouter();

  // Details
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Songs + Votes
  const [songsPerRound, setSongsPerRound] = useState(1);
  const [upvotePointsPerRound, setUpvotePointsPerRound] = useState(5);
  const [allowDownvotes, setAllowDownvotes] = useState(false);
  const [downvotePointsPerRound, setDownvotePointsPerRound] = useState(3);
  const [maxUpvotesPerSong, setMaxUpvotesPerSong] = useState<number | null>(
    null,
  );
  const [maxDownvotesPerSong, setMaxDownvotesPerSong] = useState<number | null>(
    null,
  );
  const [votingPenalty, setVotingPenalty] = useState(false);

  // Timing
  const [deadlineBehavior, setDeadlineBehavior] = useState<
    "STEADY" | "ACCELERATED" | "SPEEDY"
  >("STEADY");
  const [submissionWindowDays, setSubmissionWindowDays] = useState(3);
  const [votingWindowDays, setVotingWindowDays] = useState(2);

  // Members
  const [maxMembers, setMaxMembers] = useState(20);

  // Rounds
  const [rounds, setRounds] = useState<RoundDraft[]>([]);
  const [newRoundName, setNewRoundName] = useState("");
  const [newRoundDescription, setNewRoundDescription] = useState("");

  // Drag state
  const dragIdx = useRef<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const createLeague = useMutation(
    trpc.musicLeague.createLeague.mutationOptions({
      onSuccess: (league) => {
        router.push(`/leagues/${league.id}`);
      },
    }),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createLeague.mutate({
      name,
      description: description || undefined,
      songsPerRound,
      maxMembers,
      allowDownvotes,
      upvotePointsPerRound,
      submissionWindowDays,
      votingWindowDays,
      downvotePointsPerRound,
      deadlineBehavior,
      maxUpvotesPerSong,
      maxDownvotesPerSong,
      votingPenalty,
      rounds:
        rounds.length > 0
          ? rounds.map((r) => ({
              themeName: r.themeName,
              themeDescription: r.themeDescription || undefined,
            }))
          : undefined,
    });
  };

  const addRound = () => {
    if (!newRoundName.trim()) return;
    setRounds((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        themeName: newRoundName.trim(),
        themeDescription: newRoundDescription.trim(),
      },
    ]);
    setNewRoundName("");
    setNewRoundDescription("");
  };

  const removeRound = (id: string) => {
    setRounds((prev) => prev.filter((r) => r.id !== id));
  };

  const handleDragStart = (idx: number) => {
    dragIdx.current = idx;
  };

  const handleDragOver = useCallback(
    (e: React.DragEvent, idx: number) => {
      e.preventDefault();
      if (dragOverIdx !== idx) setDragOverIdx(idx);
    },
    [dragOverIdx],
  );

  const handleDrop = useCallback(
    (idx: number) => {
      if (dragIdx.current === null || dragIdx.current === idx) {
        setDragOverIdx(null);
        return;
      }
      setRounds((prev) => {
        const next = [...prev];
        const [moved] = next.splice(dragIdx.current!, 1);
        if (moved) next.splice(idx, 0, moved);
        return next;
      });
      dragIdx.current = null;
      setDragOverIdx(null);
    },
    [],
  );

  const handleDragEnd = () => {
    dragIdx.current = null;
    setDragOverIdx(null);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl py-4">
        <h1 className="mb-6 text-2xl font-bold">Create a League</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ── Details ─────────────────────────────────────── */}
          <section>
            <SectionHeader title="Details" />
            <Card>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="name">League Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Friday Vibes"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={100}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What's this league about?"
                    rows={3}
                    maxLength={500}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Max Members</Label>
                  <NumberStepper
                    value={maxMembers}
                    onChange={setMaxMembers}
                    min={2}
                    max={50}
                  />
                  <p className="text-muted-foreground text-xs">
                    Maximum number of members allowed (2-50)
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ── Songs + Votes ──────────────────────────────── */}
          <section>
            <SectionHeader title="Songs & Votes" />
            <Card>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="songsPerRound">Songs per Round</Label>
                    <Select
                      value={String(songsPerRound)}
                      onValueChange={(v) => setSongsPerRound(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n} {n === 1 ? "song" : "songs"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label>Upvote Points per Round</Label>
                    <NumberStepper
                      value={upvotePointsPerRound}
                      onChange={setUpvotePointsPerRound}
                      min={1}
                      max={20}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>Max Upvotes per Song</Label>
                  <Select
                    value={
                      maxUpvotesPerSong === null
                        ? "none"
                        : String(maxUpvotesPerSong)
                    }
                    onValueChange={(v) =>
                      setMaxUpvotesPerSong(v === "none" ? null : Number(v))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No limit</SelectItem>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-muted-foreground text-xs">
                    Max upvote points a member can assign to a single song
                  </p>
                </div>

                <div className="border-border/50 space-y-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allow-downvotes">Allow Downvotes</Label>
                      <p className="text-muted-foreground text-xs">
                        Members can spend points to downvote songs
                      </p>
                    </div>
                    <Switch
                      id="allow-downvotes"
                      checked={allowDownvotes}
                      onCheckedChange={(v) => setAllowDownvotes(v)}
                    />
                  </div>

                  {allowDownvotes && (
                    <div className="bg-muted/50 space-y-4 rounded-lg p-4">
                      <div className="flex flex-col gap-1.5">
                        <Label>Downvote Points per Round</Label>
                        <NumberStepper
                          value={downvotePointsPerRound}
                          onChange={setDownvotePointsPerRound}
                          min={1}
                          max={10}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label>Max Downvotes per Song</Label>
                        <Select
                          value={
                            maxDownvotesPerSong === null
                              ? "none"
                              : String(maxDownvotesPerSong)
                          }
                          onValueChange={(v) =>
                            setMaxDownvotesPerSong(
                              v === "none" ? null : Number(v),
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No limit</SelectItem>
                            {Array.from({ length: 5 }, (_, i) => i + 1).map(
                              (n) => (
                                <SelectItem key={n} value={String(n)}>
                                  {n}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-border/50 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="voting-penalty">Voting Penalty</Label>
                      <p className="text-muted-foreground text-xs">
                        Non-voters only receive downvotes assigned to them
                      </p>
                    </div>
                    <Switch
                      id="voting-penalty"
                      checked={votingPenalty}
                      onCheckedChange={(v) => setVotingPenalty(v)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ── Timing ─────────────────────────────────────── */}
          <section>
            <SectionHeader title="Timing" />
            <Card>
              <CardContent className="space-y-5">
                <div className="flex flex-col gap-2">
                  <Label>Deadline Behavior</Label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {DEADLINE_BEHAVIORS.map((db) => (
                      <button
                        key={db.value}
                        type="button"
                        onClick={() => setDeadlineBehavior(db.value)}
                        className={`rounded-lg border p-3 text-left transition-colors ${
                          deadlineBehavior === db.value
                            ? "border-emerald-500/40 bg-emerald-500/10"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        <p className="text-sm font-medium">{db.label}</p>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          {db.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label>Submission Window</Label>
                    <div className="flex flex-wrap gap-2">
                      {SUBMISSION_WINDOW_PRESETS.map((preset) => (
                        <button
                          key={preset.days}
                          type="button"
                          onClick={() =>
                            setSubmissionWindowDays(preset.days)
                          }
                          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                            submissionWindowDays === preset.days
                              ? "bg-emerald-500 text-white"
                              : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label>Voting Window</Label>
                    <div className="flex flex-wrap gap-2">
                      {VOTING_WINDOW_PRESETS.map((preset) => (
                        <button
                          key={preset.days}
                          type="button"
                          onClick={() => setVotingWindowDays(preset.days)}
                          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                            votingWindowDays === preset.days
                              ? "bg-emerald-500 text-white"
                              : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ── Rounds ─────────────────────────────────────── */}
          <section>
            <SectionHeader
              title="Rounds"
              subtitle="Pre-define your rounds. They'll all start as Pending — you can start the first one after creating the league."
            />
            <Card>
              <CardContent className="space-y-4">
                {rounds.length > 0 && (
                  <div className="space-y-2">
                    {rounds.map((round, idx) => (
                      <div
                        key={round.id}
                        draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDrop={() => handleDrop(idx)}
                        onDragEnd={handleDragEnd}
                        className={`border-border/50 flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                          dragOverIdx === idx
                            ? "border-emerald-500/40 bg-emerald-500/5"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <GripVertical className="text-muted-foreground h-4 w-4 shrink-0 cursor-grab" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">
                            <span className="text-muted-foreground">
                              {idx + 1}.{" "}
                            </span>
                            {round.themeName}
                          </p>
                          {round.themeDescription && (
                            <p className="text-muted-foreground mt-0.5 truncate text-xs">
                              {round.themeDescription}
                            </p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive h-7 w-7 shrink-0 p-0"
                          onClick={() => removeRound(round.id)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add round form */}
                <div className="border-border/50 space-y-3 rounded-lg border border-dashed p-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="round-name">Theme Name</Label>
                    <Input
                      id="round-name"
                      placeholder="e.g. Songs that make you feel like a spy"
                      value={newRoundName}
                      onChange={(e) => setNewRoundName(e.target.value)}
                      maxLength={200}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="round-desc">
                      Description{" "}
                      <span className="text-muted-foreground font-normal">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      id="round-desc"
                      placeholder="Any extra context for the theme"
                      value={newRoundDescription}
                      onChange={(e) => setNewRoundDescription(e.target.value)}
                      maxLength={500}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={addRound}
                    disabled={!newRoundName.trim()}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Round
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ── Submit ──────────────────────────────────────── */}
          {createLeague.error && (
            <p className="text-destructive text-sm">
              {createLeague.error.message}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={createLeague.isPending || !name.trim()}
          >
            {createLeague.isPending ? "Creating..." : "Create League"}
          </Button>
        </form>
      </div>
    </AppShell>
  );
}

// ─── Helper Components ──────────────────────────────────────────────────────

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {subtitle && (
        <p className="text-muted-foreground mt-0.5 text-sm">{subtitle}</p>
      )}
    </div>
  );
}
