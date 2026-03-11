"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Copy,
  Flag,
  LogOut,
  MoreVertical,
  Music2,
  Play,
  Plus,
  Settings,
  ShieldAlert,
  Trash2,
  Trophy,
  Users,
} from "lucide-react";

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
import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";
import { Checkbox } from "@acme/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import { Separator } from "@acme/ui/separator";
import { Switch } from "@acme/ui/switch";
import { Textarea } from "@acme/ui/textarea";

import { authClient } from "~/auth/client";
import { AppShell } from "~/components/app-shell";
import { LeagueStandings } from "~/components/music/results/league-standings";
import { NumberStepper } from "~/components/number-stepper";
import { useTRPC } from "~/trpc/react";

const roleLabels: Record<string, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
};

function getRoundWinner(
  submissions: {
    user: { name: string };
    trackName: string;
    votes: { points: number }[];
  }[],
): { userName: string; trackName: string } | null {
  if (submissions.length === 0) return null;

  const first = submissions[0];
  if (!first) return null;
  let winner = first;
  let maxPoints = winner.votes.reduce((sum, v) => sum + v.points, 0);

  for (const sub of submissions.slice(1)) {
    const pts = sub.votes.reduce((sum, v) => sum + v.points, 0);
    if (pts > maxPoints) {
      maxPoints = pts;
      winner = sub;
    }
  }

  return { userName: winner.user.name, trackName: winner.trackName };
}

export default function LeagueDetailPage() {
  const params = useParams<{ leagueId: string }>();
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{
    contentType: "LEAGUE" | "USER";
    contentId: string;
    contentLabel: string;
    reportedUserId?: string;
  } | null>(null);

  const { data: session } = authClient.useSession();

  const { data: league, isLoading } = useQuery(
    trpc.musicLeague.getLeagueById.queryOptions({ id: params.leagueId }),
  );

  const leaveLeague = useMutation(
    trpc.musicLeague.leaveLeague.mutationOptions({
      onSuccess: () => router.push("/"),
    }),
  );

  const deleteLeague = useMutation(
    trpc.musicLeague.deleteLeague.mutationOptions({
      onSuccess: () => router.push("/"),
    }),
  );

  const regenerateCode = useMutation(
    trpc.musicLeague.regenerateLeagueInviteCode.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(
          trpc.musicLeague.getLeagueById.queryFilter({ id: params.leagueId }),
        );
      },
    }),
  );

  const { data: blockedUserIds = [] } = useQuery(
    trpc.moderation.getBlockedUserIds.queryOptions(),
  );

  const blockUser = useMutation(
    trpc.moderation.blockUser.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(
          trpc.moderation.getBlockedUserIds.queryFilter(),
        );
      },
    }),
  );

  const startLeague = useMutation(
    trpc.musicLeague.startLeague.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(
          trpc.musicLeague.getLeagueById.queryFilter({ id: params.leagueId }),
        );
      },
    }),
  );

  if (isLoading) {
    return (
      <AppShell>
        <div className="py-4">
          <div className="animate-pulse space-y-4">
            <div className="bg-muted h-8 w-48 rounded" />
            <div className="bg-muted h-4 w-72 rounded" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (!league) {
    return (
      <AppShell>
        <div className="py-4">
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
              <Users className="text-muted-foreground h-6 w-6" />
            </div>
            <div>
              <p className="text-muted-foreground font-medium">
                League not found
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                This league doesn&apos;t exist or you&apos;re not a member.
              </p>
            </div>
            <Link
              href="/"
              className="text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const isOwner =
    league.members.find((m) => m.userId === session?.user.id)?.role === "OWNER";

  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/join/${league.inviteCode}`
      : `/join/${league.inviteCode}`;

  const handleCopyInvite = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell>
      <div className="py-4">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{league.name}</h1>
            {league.description && (
              <p className="text-muted-foreground mt-1">{league.description}</p>
            )}
            <p className="text-muted-foreground mt-2 flex items-center gap-1.5 text-sm">
              <Users className="h-4 w-4" />
              {league.members.length} member
              {league.members.length !== 1 && "s"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setReportTarget({
                      contentType: "LEAGUE",
                      contentId: league.id,
                      contentLabel: league.name,
                      reportedUserId: league.creatorId,
                    });
                    setReportOpen(true);
                  }}
                >
                  <Flag className="h-4 w-4" />
                  Report League
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Invite Link */}
        <Card className="mb-6">
          <CardContent>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-foreground text-sm font-medium">
                  Invite Link
                </p>
                <p className="text-muted-foreground mt-0.5 text-sm break-all">
                  {inviteUrl}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyInvite}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => regenerateCode.mutate({ leagueId: league.id })}
                  disabled={!isOwner || regenerateCode.isPending}
                >
                  Regenerate
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Left column: Standings + Rounds */}
          <div className="space-y-6 md:col-span-2">
            {/* Standings */}
            <LeagueStandings leagueId={league.id} />

            {/* Start League Banner */}
            {isOwner &&
              league.rounds.length > 0 &&
              league.rounds.every((r) => r.status === "PENDING") && (
                <Card className="border-emerald-500/30 bg-emerald-500/5">
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium">Ready to start?</p>
                      <p className="text-muted-foreground text-sm">
                        {league.rounds.length} round
                        {league.rounds.length !== 1 ? "s" : ""} queued &middot;{" "}
                        {league.members.length} member
                        {league.members.length !== 1 ? "s" : ""} joined
                      </p>
                    </div>
                    <Button
                      onClick={() =>
                        startLeague.mutate({ leagueId: league.id })
                      }
                      disabled={startLeague.isPending}
                    >
                      {startLeague.isPending ? (
                        "Starting..."
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Start League
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}

            {/* Rounds */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Rounds</CardTitle>
                  {isOwner && (
                    <Link href={`/leagues/${league.id}/rounds/create`}>
                      <Button size="sm">
                        <Plus className="h-3.5 w-3.5" />
                        Create Round
                      </Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {league.rounds.length > 0 ? (
                  <div className="space-y-2">
                    {(() => {
                      const activeStatuses = [
                        "SUBMISSION",
                        "VOTING",
                        "RESULTS",
                      ];
                      const activeRound = league.rounds.find((r) =>
                        activeStatuses.includes(r.status),
                      );
                      const pendingRounds = league.rounds
                        .filter((r) => r.status === "PENDING")
                        .sort((a, b) => a.sortOrder - b.sortOrder);
                      const currentRound = activeRound ?? pendingRounds[0];
                      const upcomingRounds = activeRound
                        ? pendingRounds
                        : pendingRounds.slice(1);
                      const completedRounds = league.rounds
                        .filter((r) => r.status === "COMPLETED")
                        .sort((a, b) => b.roundNumber - a.roundNumber);

                      return (
                        <>
                          {/* Current / active round */}
                          {currentRound && (
                            <Link
                              href={`/leagues/${league.id}/rounds/${currentRound.id}`}
                              className="border-border/50 hover:bg-muted flex items-center justify-between rounded-lg border border-l-2 border-l-emerald-500 p-3 transition-colors"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="font-medium">
                                  Round {currentRound.roundNumber}:{" "}
                                  {currentRound.themeName}
                                </p>
                                {currentRound.themeDescription && (
                                  <p className="text-muted-foreground mt-0.5 text-sm">
                                    {currentRound.themeDescription}
                                  </p>
                                )}
                              </div>
                              <Badge variant="secondary">
                                {currentRound.status === "PENDING"
                                  ? "Up Next"
                                  : currentRound.status}
                              </Badge>
                            </Link>
                          )}

                          {/* Upcoming pending rounds */}
                          {upcomingRounds.map((round) => (
                            <Link
                              key={round.id}
                              href={`/leagues/${league.id}/rounds/${round.id}`}
                              className="border-border/50 hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 opacity-60 transition-colors"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-muted-foreground font-medium">
                                  Round {round.roundNumber}: {round.themeName}
                                </p>
                              </div>
                              <Badge variant="outline">Pending</Badge>
                            </Link>
                          ))}

                          {/* Completed rounds */}
                          {completedRounds.map((round) => {
                            const winner = getRoundWinner(round.submissions);
                            return (
                              <Link
                                key={round.id}
                                href={`/leagues/${league.id}/rounds/${round.id}`}
                                className="border-border/50 hover:bg-muted flex items-center justify-between rounded-lg border p-3 transition-colors"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium">
                                    Round {round.roundNumber}: {round.themeName}
                                  </p>
                                  {winner && (
                                    <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-sm">
                                      <Trophy className="h-3 w-3 text-yellow-500" />
                                      {winner.userName} &middot;{" "}
                                      {winner.trackName}
                                    </p>
                                  )}
                                </div>
                                <Badge variant="secondary">Completed</Badge>
                              </Link>
                            );
                          })}
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
                      <Music2 className="text-muted-foreground h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">
                        No rounds yet
                      </p>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        Create the first round to get the competition started.
                      </p>
                    </div>
                    {isOwner && (
                      <Link href={`/leagues/${league.id}/rounds/create`}>
                        <Button size="sm">
                          <Plus className="h-3.5 w-3.5" />
                          Create First Round
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column: Members */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Members ({league.members.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {league.members
                    .filter((member) => !blockedUserIds.includes(member.userId))
                    .map((member) => (
                      <div
                        key={member.id}
                        className="group flex items-center gap-3"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.user.image ?? undefined} />
                          <AvatarFallback className="bg-emerald-500/20 text-sm font-bold text-emerald-400">
                            {member.user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {member.user.name}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {roleLabels[member.role]}
                          </p>
                        </div>
                        {member.userId !== session?.user.id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                              >
                                <MoreVertical className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setReportTarget({
                                    contentType: "USER",
                                    contentId: member.userId,
                                    contentLabel: member.user.name,
                                    reportedUserId: member.userId,
                                  });
                                  setReportOpen(true);
                                }}
                              >
                                <Flag className="h-4 w-4" />
                                Report User
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() =>
                                  blockUser.mutate({
                                    blockedUserId: member.userId,
                                  })
                                }
                              >
                                <ShieldAlert className="h-4 w-4" />
                                Block User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Settings Modal */}
        <SettingsModal
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          league={league}
          isOwner={isOwner}
          onLeave={() => leaveLeague.mutate({ leagueId: league.id })}
          onDelete={() => deleteLeague.mutate({ leagueId: league.id })}
          isLeaving={leaveLeague.isPending}
          isDeleting={deleteLeague.isPending}
        />

        {/* Report Dialog */}
        {reportTarget && (
          <ReportDialog
            open={reportOpen}
            onClose={() => {
              setReportOpen(false);
              setReportTarget(null);
            }}
            contentType={reportTarget.contentType}
            contentId={reportTarget.contentId}
            contentLabel={reportTarget.contentLabel}
            reportedUserId={reportTarget.reportedUserId}
          />
        )}
      </div>
    </AppShell>
  );
}

const SUBMISSION_WINDOW_OPTIONS = [
  { label: "1 day", value: 1 },
  { label: "2 days", value: 2 },
  { label: "3 days", value: 3 },
  { label: "5 days", value: 5 },
  { label: "1 week", value: 7 },
];

const VOTING_WINDOW_OPTIONS = [
  { label: "1 day", value: 1 },
  { label: "2 days", value: 2 },
  { label: "3 days", value: 3 },
  { label: "5 days", value: 5 },
];

function SettingsModal({
  open,
  onClose,
  league,
  onLeave,
  onDelete,
  isLeaving,
  isDeleting,
  isOwner,
}: {
  open: boolean;
  onClose: () => void;
  league: {
    id: string;
    name: string;
    description: string | null;
    songsPerRound: number;
    allowDownvotes: boolean;
    upvotePointsPerRound: number;
    submissionWindowDays: number;
    votingWindowDays: number;
    downvotePointsPerRound: number;
    deadlineBehavior: "STEADY" | "ACCELERATED" | "SPEEDY";
    maxUpvotesPerSong: number | null;
    maxDownvotesPerSong: number | null;
    votingPenalty: boolean;
    maxMembers: number;
    members: { role: string; userId: string }[];
  };
  onLeave: () => void;
  onDelete: () => void;
  isLeaving: boolean;
  isDeleting: boolean;
  isOwner: boolean;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [name, setName] = useState(league.name);
  const [description, setDescription] = useState(league.description ?? "");
  const [songsPerRound, setSongsPerRound] = useState(league.songsPerRound);
  const [allowDownvotes, setAllowDownvotes] = useState(league.allowDownvotes);
  const [upvotePoints, setUpvotePoints] = useState(league.upvotePointsPerRound);
  const [submissionWindowDays, setSubmissionWindowDays] = useState(
    league.submissionWindowDays,
  );
  const [votingWindowDays, setVotingWindowDays] = useState(
    league.votingWindowDays,
  );
  const [downvotePoints, setDownvotePoints] = useState(
    league.downvotePointsPerRound,
  );
  const [deadlineBehavior, setDeadlineBehavior] = useState(
    league.deadlineBehavior,
  );
  const [maxUpvotesPerSong, setMaxUpvotesPerSong] = useState(
    league.maxUpvotesPerSong,
  );
  const [maxDownvotesPerSong, setMaxDownvotesPerSong] = useState(
    league.maxDownvotesPerSong,
  );
  const [votingPenalty, setVotingPenalty] = useState(league.votingPenalty);
  const [maxMembers, setMaxMembers] = useState(league.maxMembers);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const updateSettings = useMutation(
    trpc.musicLeague.updateLeagueSettings.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(
          trpc.musicLeague.getLeagueById.queryFilter({ id: league.id }),
        );
        onClose();
      },
    }),
  );

  const handleSave = () => {
    updateSettings.mutate({
      leagueId: league.id,
      name,
      description: description || undefined,
      songsPerRound,
      allowDownvotes,
      upvotePointsPerRound: upvotePoints,
      submissionWindowDays,
      votingWindowDays,
      downvotePointsPerRound: downvotePoints,
      deadlineBehavior,
      maxUpvotesPerSong,
      maxDownvotesPerSong,
      votingPenalty,
      maxMembers,
    });
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) onClose();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>League Settings</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {isOwner ? (
              <>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="settings-name">League Name</Label>
                  <Input
                    id="settings-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="settings-desc">Description</Label>
                  <Textarea
                    id="settings-desc"
                    rows={2}
                    maxLength={500}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>Submission Window</Label>
                  <Select
                    value={String(submissionWindowDays)}
                    onValueChange={(v) => setSubmissionWindowDays(Number(v))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBMISSION_WINDOW_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={String(opt.value)}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>Voting Window</Label>
                  <Select
                    value={String(votingWindowDays)}
                    onValueChange={(v) => setVotingWindowDays(Number(v))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VOTING_WINDOW_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={String(opt.value)}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="settings-songs">Songs per Round</Label>
                  <Select
                    value={String(songsPerRound)}
                    onValueChange={(value) => setSongsPerRound(Number(value))}
                  >
                    <SelectTrigger id="settings-songs" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>Upvote Points per Round</Label>
                  <NumberStepper
                    value={upvotePoints}
                    onChange={setUpvotePoints}
                    min={1}
                    max={20}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox
                    id="settings-downvotes"
                    checked={allowDownvotes}
                    onCheckedChange={(checked) =>
                      setAllowDownvotes(checked === true)
                    }
                  />
                  <Label htmlFor="settings-downvotes">Allow downvotes</Label>
                </div>

                {allowDownvotes && (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="settings-downvote-points">
                      Downvote Points per Round
                    </Label>
                    <NumberStepper
                      value={downvotePoints}
                      onChange={setDownvotePoints}
                      min={1}
                      max={10}
                    />
                  </div>
                )}

                {allowDownvotes && (
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
                      <SelectTrigger className="w-full">
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
                )}

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
                    <SelectTrigger className="w-full">
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
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="settings-voting-penalty">
                      Voting Penalty
                    </Label>
                    <p className="text-muted-foreground text-xs">
                      Non-voters only receive downvotes
                    </p>
                  </div>
                  <Switch
                    id="settings-voting-penalty"
                    checked={votingPenalty}
                    onCheckedChange={(v) => setVotingPenalty(v)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>Deadline Behavior</Label>
                  <Select
                    value={deadlineBehavior}
                    onValueChange={(v) =>
                      setDeadlineBehavior(
                        v as "STEADY" | "ACCELERATED" | "SPEEDY",
                      )
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STEADY">Steady</SelectItem>
                      <SelectItem value="ACCELERATED">Accelerated</SelectItem>
                      <SelectItem value="SPEEDY">Speedy</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-muted-foreground text-xs">
                    {deadlineBehavior === "STEADY"
                      ? "Fixed deadlines, no early advancement"
                      : deadlineBehavior === "ACCELERATED"
                        ? "Auto-advance when all finish, next round on schedule"
                        : "Auto-advance and start next round immediately"}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>Max Members</Label>
                  <NumberStepper
                    value={maxMembers}
                    onChange={setMaxMembers}
                    min={2}
                    max={50}
                  />
                </div>

                {updateSettings.error && (
                  <p className="text-destructive text-sm">
                    {updateSettings.error.message}
                  </p>
                )}
              </>
            ) : (
              <div className="py-2">
                <p className="text-muted-foreground text-sm">
                  You are a member of this league.
                </p>
              </div>
            )}

            <Separator />

            <div className="flex flex-col gap-2">
              <Button
                variant="secondary"
                onClick={onLeave}
                disabled={isLeaving}
              >
                <LogOut className="h-4 w-4" />
                {isLeaving ? "Leaving..." : "Leave League"}
              </Button>
              {isOwner && (
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete League
                </Button>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            {isOwner && (
              <Button onClick={handleSave} disabled={updateSettings.isPending}>
                {updateSettings.isPending ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete League</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &ldquo;{league.name}&rdquo; and all
              its rounds, submissions, and votes. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setDeleteDialogOpen(false);
                onDelete();
              }}
            >
              {isDeleting ? "Deleting..." : "Delete League"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

const REPORT_REASONS = [
  { key: "SPAM" as const, label: "Spam" },
  { key: "OFFENSIVE" as const, label: "Offensive content" },
  { key: "HARASSMENT" as const, label: "Harassment" },
  { key: "OTHER" as const, label: "Other" },
];

function ReportDialog({
  open,
  onClose,
  contentType,
  contentId,
  contentLabel,
  reportedUserId,
}: {
  open: boolean;
  onClose: () => void;
  contentType: "LEAGUE" | "USER";
  contentId: string;
  contentLabel: string;
  reportedUserId?: string;
}) {
  const trpc = useTRPC();
  const [reason, setReason] = useState<
    "SPAM" | "OFFENSIVE" | "HARASSMENT" | "OTHER" | null
  >(null);
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const reportMutation = useMutation(
    trpc.moderation.reportContent.mutationOptions({
      onSuccess: () => {
        setSubmitted(true);
      },
    }),
  );

  const handleSubmit = () => {
    if (!reason) return;
    reportMutation.mutate({
      contentType,
      contentId,
      reportedUserId,
      reason,
      details: details.trim() || undefined,
    });
  };

  const handleClose = () => {
    setReason(null);
    setDetails("");
    setSubmitted(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {submitted ? "Report Submitted" : "Report Content"}
          </DialogTitle>
          {!submitted && (
            <DialogDescription>
              Report &ldquo;{contentLabel}&rdquo;
            </DialogDescription>
          )}
        </DialogHeader>

        {submitted ? (
          <div className="py-4 text-center">
            <p className="text-muted-foreground text-sm">
              Thank you for your report. We&apos;ll review it and take
              appropriate action.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Reason</Label>
              {REPORT_REASONS.map((r) => (
                <label
                  key={r.key}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                    reason === r.key
                      ? "border-emerald-500/40 bg-emerald-500/10"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    checked={reason === r.key}
                    onChange={() => setReason(r.key)}
                    className="sr-only"
                  />
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                      reason === r.key
                        ? "border-emerald-400 bg-emerald-400"
                        : "border-muted-foreground"
                    }`}
                  >
                    {reason === r.key && (
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-sm">{r.label}</span>
                </label>
              ))}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="report-details">
                Additional details (optional)
              </Label>
              <Textarea
                id="report-details"
                rows={3}
                maxLength={1000}
                placeholder="Provide more context..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            </div>

            {reportMutation.error && (
              <p className="text-destructive text-sm">
                {reportMutation.error.message}
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={handleClose}>
            {submitted ? "Close" : "Cancel"}
          </Button>
          {!submitted && (
            <Button
              onClick={handleSubmit}
              disabled={!reason || reportMutation.isPending}
            >
              {reportMutation.isPending ? "Submitting..." : "Submit Report"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
