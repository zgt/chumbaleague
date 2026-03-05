"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

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

import type { RoundDraft } from "~/components/music/round-editor";
import { AppShell } from "~/components/app-shell";
import { RoundEditor } from "~/components/music/round-editor";
import { NumberStepper } from "~/components/number-stepper";
import { useTRPC } from "~/trpc/react";

// ─── Constants ──────────────────────────────────────────────────────────────

const STEPS = ["Details", "Songs & Votes", "Timing", "Rounds"] as const;

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

// ─── Page Component ─────────────────────────────────────────────────────────

export default function CreateLeaguePage() {
  const trpc = useTRPC();
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Details
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [maxMembers, setMaxMembers] = useState(20);

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

  // Rounds
  const [rounds, setRounds] = useState<RoundDraft[]>([]);

  const createLeague = useMutation(
    trpc.musicLeague.createLeague.mutationOptions({
      onSuccess: (league) => {
        router.push(`/leagues/${league.id}`);
      },
    }),
  );

  const handleSubmit = () => {
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

  const canAdvance = step === 0 ? name.trim().length > 0 : true;
  const isLastStep = step === STEPS.length - 1;

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl py-4">
        <h1 className="mb-6 text-2xl font-bold">Create a League</h1>

        {/* Step indicator */}
        <div className="mb-8 flex items-center gap-1">
          {STEPS.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                if (i < step || (i > step && canAdvance)) setStep(i);
              }}
              className="flex flex-1 flex-col items-center gap-1.5"
            >
              <div className="flex w-full items-center gap-1">
                {i > 0 && (
                  <div
                    className={`h-0.5 flex-1 rounded-full transition-colors ${
                      i <= step ? "bg-emerald-500" : "bg-muted"
                    }`}
                  />
                )}
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    i < step
                      ? "bg-emerald-500 text-white"
                      : i === step
                        ? "bg-emerald-500 text-white ring-4 ring-emerald-500/20"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 rounded-full transition-colors ${
                      i < step ? "bg-emerald-500" : "bg-muted"
                    }`}
                  />
                )}
              </div>
              <span
                className={`text-xs font-medium transition-colors ${
                  i === step ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </button>
          ))}
        </div>

        {/* Step content */}
        <Card>
          <CardContent>
            {step === 0 && (
              <DetailsStep
                name={name}
                setName={setName}
                description={description}
                setDescription={setDescription}
                maxMembers={maxMembers}
                setMaxMembers={setMaxMembers}
              />
            )}
            {step === 1 && (
              <SongsVotesStep
                songsPerRound={songsPerRound}
                setSongsPerRound={setSongsPerRound}
                upvotePointsPerRound={upvotePointsPerRound}
                setUpvotePointsPerRound={setUpvotePointsPerRound}
                maxUpvotesPerSong={maxUpvotesPerSong}
                setMaxUpvotesPerSong={setMaxUpvotesPerSong}
                allowDownvotes={allowDownvotes}
                setAllowDownvotes={setAllowDownvotes}
                downvotePointsPerRound={downvotePointsPerRound}
                setDownvotePointsPerRound={setDownvotePointsPerRound}
                maxDownvotesPerSong={maxDownvotesPerSong}
                setMaxDownvotesPerSong={setMaxDownvotesPerSong}
                votingPenalty={votingPenalty}
                setVotingPenalty={setVotingPenalty}
              />
            )}
            {step === 2 && (
              <TimingStep
                deadlineBehavior={deadlineBehavior}
                setDeadlineBehavior={setDeadlineBehavior}
                submissionWindowDays={submissionWindowDays}
                setSubmissionWindowDays={setSubmissionWindowDays}
                votingWindowDays={votingWindowDays}
                setVotingWindowDays={setVotingWindowDays}
              />
            )}
            {step === 3 && (
              <RoundEditor
                rounds={rounds}
                setRounds={setRounds}
                description="Pre-define your rounds. They'll all start as Pending — you can start the first one after creating the league. This step is optional."
              />
            )}
          </CardContent>
        </Card>

        {/* Error */}
        {createLeague.error && (
          <p className="text-destructive mt-4 text-sm">
            {createLeague.error.message}
          </p>
        )}

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {isLastStep ? (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={createLeague.isPending || !name.trim()}
            >
              {createLeague.isPending ? "Creating..." : "Create League"}
              <Check className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canAdvance}
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  );
}

// ─── Step Components ────────────────────────────────────────────────────────

function DetailsStep({
  name,
  setName,
  description,
  setDescription,
  maxMembers,
  setMaxMembers,
}: {
  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  maxMembers: number;
  setMaxMembers: (v: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">League Name</Label>
        <Input
          id="name"
          placeholder="e.g. Friday Vibes"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          autoFocus
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
    </div>
  );
}

function SongsVotesStep({
  songsPerRound,
  setSongsPerRound,
  upvotePointsPerRound,
  setUpvotePointsPerRound,
  maxUpvotesPerSong,
  setMaxUpvotesPerSong,
  allowDownvotes,
  setAllowDownvotes,
  downvotePointsPerRound,
  setDownvotePointsPerRound,
  maxDownvotesPerSong,
  setMaxDownvotesPerSong,
  votingPenalty,
  setVotingPenalty,
}: {
  songsPerRound: number;
  setSongsPerRound: (v: number) => void;
  upvotePointsPerRound: number;
  setUpvotePointsPerRound: (v: number) => void;
  maxUpvotesPerSong: number | null;
  setMaxUpvotesPerSong: (v: number | null) => void;
  allowDownvotes: boolean;
  setAllowDownvotes: (v: boolean) => void;
  downvotePointsPerRound: number;
  setDownvotePointsPerRound: (v: number) => void;
  maxDownvotesPerSong: number | null;
  setMaxDownvotesPerSong: (v: number | null) => void;
  votingPenalty: boolean;
  setVotingPenalty: (v: boolean) => void;
}) {
  return (
    <div className="space-y-5">
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
            maxUpvotesPerSong === null ? "none" : String(maxUpvotesPerSong)
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
                  setMaxDownvotesPerSong(v === "none" ? null : Number(v))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No limit</SelectItem>
                  {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
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
    </div>
  );
}

function TimingStep({
  deadlineBehavior,
  setDeadlineBehavior,
  submissionWindowDays,
  setSubmissionWindowDays,
  votingWindowDays,
  setVotingWindowDays,
}: {
  deadlineBehavior: "STEADY" | "ACCELERATED" | "SPEEDY";
  setDeadlineBehavior: (v: "STEADY" | "ACCELERATED" | "SPEEDY") => void;
  submissionWindowDays: number;
  setSubmissionWindowDays: (v: number) => void;
  votingWindowDays: number;
  setVotingWindowDays: (v: number) => void;
}) {
  return (
    <div className="space-y-5">
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
                onClick={() => setSubmissionWindowDays(preset.days)}
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
    </div>
  );
}
