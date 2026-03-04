"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Disc3, Loader2, Music, Star, Trophy } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import { Card, CardContent } from "@acme/ui/card";

import { authClient } from "~/auth/client";
import { AppShell } from "~/components/app-shell";
import { useTRPC } from "~/trpc/react";

export default function ProfilePage() {
  const trpc = useTRPC();
  const { data: session } = authClient.useSession();

  const { data: profile, isLoading } = useQuery(
    trpc.musicLeague.getUserProfile.queryOptions(),
  );

  return (
    <AppShell>
      <div className="py-4">
        <h1 className="mb-6 text-2xl font-bold">Profile</h1>

        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
          </div>
        ) : !profile ? (
          <div className="glass-card rounded-xl p-5">
            <p className="text-muted-foreground">
              Could not load profile data.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* User info */}
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={session?.user?.image ?? undefined} />
                <AvatarFallback className="bg-primary/20 text-lg">
                  {session?.user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-semibold">
                  {session?.user?.name ?? "Unknown"}
                </p>
                <p className="text-muted-foreground text-sm">
                  {session?.user?.email}
                </p>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Total Points",
                  value: profile.totalPoints,
                  icon: Star,
                },
                {
                  label: "Rounds Won",
                  value: profile.roundsWon,
                  icon: Trophy,
                },
                {
                  label: "Leagues Joined",
                  value: profile.leaguesJoined,
                  icon: Music,
                },
                {
                  label: "Submissions",
                  value: profile.totalSubmissions,
                  icon: Disc3,
                },
              ].map((stat) => (
                <Card key={stat.label} className="glass-card border-white/5">
                  <CardContent className="flex items-center gap-3 py-4">
                    <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                      <stat.icon className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-muted-foreground text-xs">
                        {stat.label}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Rounds participated */}
            <div className="glass-card rounded-xl p-4">
              <p className="text-muted-foreground text-sm">
                Rounds Participated
              </p>
              <p className="text-xl font-bold">{profile.roundsParticipated}</p>
            </div>

            {/* Best submission */}
            {profile.bestSubmission && (
              <div>
                <h2 className="mb-3 text-lg font-semibold">Best Submission</h2>
                <Card className="glass-card border-white/5">
                  <CardContent className="flex items-center gap-4 py-4">
                    <Image
                      src={profile.bestSubmission.albumArtUrl}
                      alt={profile.bestSubmission.trackName}
                      width={56}
                      height={56}
                      className="rounded-md"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {profile.bestSubmission.trackName}
                      </p>
                      <p className="text-muted-foreground truncate text-sm">
                        {profile.bestSubmission.artistName}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {profile.bestSubmission.roundTheme}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-primary text-lg font-bold">
                        {profile.bestSubmission.points}
                      </p>
                      <p className="text-muted-foreground text-xs">points</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
