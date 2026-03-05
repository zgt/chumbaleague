import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Share,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  LogOut,
  Play,
  Plus,
  RefreshCw,
  Settings,
  Share2,
  Trophy,
} from "lucide-react-native";

import type { LeagueSettingsSheetRef } from "~/components/music/LeagueSettingsSheet";
import { GradientBackground } from "~/components/GradientBackground";
import { LeagueSettingsSheet } from "~/components/music/LeagueSettingsSheet";
import { LeagueStandingsTable } from "~/components/music/LeagueStandingsTable";
import { trpc } from "~/utils/api";
import { authClient } from "~/utils/auth";

interface VoteItem {
  points: number;
}

interface SubmissionItem {
  id: string;
  trackName: string;
  artistName: string;
  userId: string;
  user: { name: string | null };
  votes: VoteItem[];
}

interface RoundItem {
  id: string;
  roundNumber: number;
  themeName: string;
  themeDescription: string | null;
  status: string;
  submissions: SubmissionItem[];
}

function getRoundWinner(round: RoundItem) {
  if (round.status !== "COMPLETED" && round.status !== "RESULTS") return null;
  if (round.submissions.length === 0) return null;

  let bestSubmission: SubmissionItem | null = null;
  let bestScore = -Infinity;

  for (const sub of round.submissions) {
    const score = sub.votes.reduce((sum, v) => sum + v.points, 0);
    if (score > bestScore) {
      bestScore = score;
      bestSubmission = sub;
    }
  }

  return bestSubmission
    ? {
        userName: bestSubmission.user.name ?? "Unknown",
        trackName: bestSubmission.trackName,
        artistName: bestSubmission.artistName,
        score: bestScore,
      }
    : null;
}

export default function LeagueDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const settingsSheetRef = useRef<LeagueSettingsSheetRef>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [rippleTrigger, setRippleTrigger] = useState(0);
  const rippleDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRipple = useCallback(() => {
    if (rippleDebounceRef.current) return;
    setRippleTrigger((prev) => prev + 1);
    rippleDebounceRef.current = setTimeout(() => {
      rippleDebounceRef.current = null;
    }, 500);
  }, []);

  const { data: session } = authClient.useSession();
  const currentUserId = session?.user.id;

  const {
    data: league,
    isLoading,
    refetch: refetchLeague,
  } = useQuery(
    trpc.musicLeague.getLeagueById.queryOptions({ id: id }, { enabled: !!id }),
  );

  const { data: standings, refetch: refetchStandings } = useQuery(
    trpc.musicLeague.getLeagueStandings.queryOptions(
      { leagueId: id },
      { enabled: !!id },
    ),
  );

  const regenerateInviteCodeMutation = useMutation(
    trpc.musicLeague.regenerateLeagueInviteCode.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.musicLeague.getLeagueById.queryFilter(),
        );
      },
      onError: (error) => {
        Alert.alert("Failed to regenerate", error.message);
      },
    }),
  );

  const leaveLeagueMutation = useMutation(
    trpc.musicLeague.leaveLeague.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.musicLeague.getAllLeagues.queryFilter(),
        );
        router.back();
      },
      onError: (error) => {
        Alert.alert("Failed to leave", error.message);
      },
    }),
  );

  const deleteLeagueMutation = useMutation(
    trpc.musicLeague.deleteLeague.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.musicLeague.getAllLeagues.queryFilter(),
        );
        router.back();
      },
      onError: (error) => {
        Alert.alert("Failed to delete", error.message);
      },
    }),
  );

  const startLeagueMutation = useMutation(
    trpc.musicLeague.startLeague.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.musicLeague.getLeagueById.queryFilter(),
        );
      },
      onError: (error) => {
        Alert.alert("Failed to start league", error.message);
      },
    }),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    triggerRipple();
    try {
      await Promise.all([refetchLeague(), refetchStandings()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchLeague, refetchStandings, triggerRipple]);

  const currentMember = league?.members.find(
    (m: { userId: string }) => m.userId === currentUserId,
  );
  const isOwner = currentMember?.role === "OWNER";
  const isAdmin = currentMember?.role === "ADMIN" || isOwner;

  const allRoundsPending = useMemo(() => {
    if (!league?.rounds.length) return false;
    return league.rounds.every(
      (r: { status: string }) => r.status === "PENDING",
    );
  }, [league?.rounds]);

  const showStartBanner =
    isOwner && (league?.rounds.length ?? 0) > 0 && allRoundsPending;

  const handleShareInvite = async () => {
    if (!league) return;
    try {
      await Share.share({
        message: `Join my music league "${league.name}" on Chumbaleague!\n\nhttps://music.calayo.net/join/${league.inviteCode}`,
      });
    } catch {
      // User cancelled share
    }
  };

  const handleRegenerateCode = () => {
    Alert.alert(
      "Regenerate Invite Code",
      "This will invalidate the current invite code. Anyone with the old code won't be able to join.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Regenerate",
          style: "destructive",
          onPress: () => regenerateInviteCodeMutation.mutate({ leagueId: id }),
        },
      ],
    );
  };

  const handleLeaveLeague = () => {
    Alert.alert(
      "Leave League",
      "Are you sure you want to leave this league? You can rejoin with an invite code.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => leaveLeagueMutation.mutate({ leagueId: id }),
        },
      ],
    );
  };

  const handleDeleteLeague = () => {
    Alert.alert(
      "Delete League",
      "This will permanently delete the league and all its data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteLeagueMutation.mutate({ leagueId: id }),
        },
      ],
    );
  };

  const handleStartLeague = () => {
    Alert.alert(
      "Start League",
      "This will begin the first round and open submissions. Are you ready?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Start",
          onPress: () => startLeagueMutation.mutate({ leagueId: id }),
        },
      ],
    );
  };

  const getStatusColors = (status: string) => {
    switch (status) {
      case "PENDING":
        return { bg: "rgba(107, 114, 128, 0.15)", text: "#6B7280" };
      case "SUBMISSION":
        return { bg: "rgba(16, 185, 129, 0.2)", text: "#10b981" };
      case "VOTING":
        return { bg: "rgba(234, 179, 8, 0.2)", text: "#EAB308" };
      case "RESULTS":
        return { bg: "rgba(100, 149, 237, 0.2)", text: "#6495ED" };
      case "COMPLETED":
        return { bg: "rgba(34, 197, 94, 0.15)", text: "#22C55E" };
      default:
        return { bg: "rgba(107, 155, 138, 0.15)", text: "#6b9b8a" };
    }
  };

  const renderRoundCard = useCallback(
    ({ item }: { item: RoundItem }) => {
      const isPending = item.status === "PENDING";
      const statusColors = getStatusColors(item.status);
      const winner = getRoundWinner(item);

      return (
        <Pressable
          onPress={() => router.push(`/round/${item.id}` as never)}
          accessibilityLabel={`Round ${item.roundNumber}: ${item.themeName}, ${item.status}`}
          accessibilityRole="button"
          style={[
            {
              borderRadius: 16,
              borderWidth: 1,
              borderColor: isPending ? "#0a2a20" : "#0f3a2e",
              backgroundColor: "#071f1a",
              padding: 16,
              marginBottom: 8,
            },
            isPending ? { opacity: 0.6 } : undefined,
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  marginBottom: 6,
                  color: isPending ? "#6B7280" : "#10b981",
                }}
              >
                Round {item.roundNumber}
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  marginBottom: 4,
                  color: isPending ? "#6B7280" : "#e0f0eb",
                }}
              >
                {item.themeName}
              </Text>
              {item.themeDescription && (
                <Text
                  style={{
                    fontSize: 14,
                    lineHeight: 20,
                    color: isPending ? "#4B5563" : "#6b9b8a",
                  }}
                  numberOfLines={2}
                >
                  {item.themeDescription}
                </Text>
              )}
              {winner && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 8,
                    gap: 6,
                  }}
                >
                  <Trophy size={14} color="#EAB308" />
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#EAB308",
                      fontWeight: "600",
                    }}
                  >
                    {winner.userName}
                  </Text>
                  <Text
                    style={{ fontSize: 13, color: "#6b9b8a" }}
                    numberOfLines={1}
                  >
                    — {winner.trackName}
                  </Text>
                </View>
              )}
            </View>
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: statusColors.bg,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: statusColors.text,
                }}
              >
                {item.status}
              </Text>
            </View>
          </View>
        </Pressable>
      );
    },
    [router],
  );

  if (isLoading || !league) {
    return (
      <GradientBackground rippleTrigger={rippleTrigger}>
        <SafeAreaView
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Stack.Screen options={{ headerShown: false }} />
          <ActivityIndicator size="large" color="#10b981" />
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground rippleTrigger={rippleTrigger}>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <Stack.Screen options={{ headerShown: false }} />

        {/* Header */}
        <View className="px-4 py-4">
          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={() => router.back()}
              className="rounded-full bg-[#0f3a2e] p-2"
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <ArrowLeft color="#e0f0eb" size={24} />
            </Pressable>
            <Text
              className="flex-1 text-center text-xl font-bold text-[#e0f0eb]"
              numberOfLines={1}
            >
              {league.name}
            </Text>
            <View className="flex-row gap-2">
              {isAdmin && (
                <Pressable
                  onPress={() => settingsSheetRef.current?.present()}
                  className="rounded-full bg-[#0f3a2e] p-2"
                  accessibilityLabel="League settings"
                  accessibilityRole="button"
                >
                  <Settings color="#e0f0eb" size={20} />
                </Pressable>
              )}
              {!isAdmin && <View className="w-10" />}
            </View>
          </View>
          {league.description ? (
            <Text className="mt-1 text-center text-sm text-[#6b9b8a]">
              {league.description}
            </Text>
          ) : null}
        </View>

        <FlatList
          data={league.rounds as RoundItem[]}
          keyExtractor={(item) => item.id}
          renderItem={renderRoundCard}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#10b981"
            />
          }
          ListHeaderComponent={
            <View>
              {/* Start League Banner */}
              {showStartBanner && (
                <Pressable
                  onPress={handleStartLeague}
                  disabled={startLeagueMutation.isPending}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: "rgba(34, 197, 94, 0.4)",
                    backgroundColor: "rgba(34, 197, 94, 0.15)",
                    paddingVertical: 14,
                    marginBottom: 16,
                    opacity: startLeagueMutation.isPending ? 0.6 : 1,
                  }}
                >
                  {startLeagueMutation.isPending ? (
                    <ActivityIndicator color="#22C55E" />
                  ) : (
                    <>
                      <Play size={20} color="#22C55E" />
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "700",
                          color: "#22C55E",
                        }}
                      >
                        Start League
                      </Text>
                    </>
                  )}
                </Pressable>
              )}

              {/* Invite Code Card */}
              <View className="mb-4 rounded-2xl border border-[#10b981]/20 bg-[#071f1a] p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="mb-1 text-xs font-semibold tracking-wider text-[#6b9b8a] uppercase">
                      Invite Code
                    </Text>
                    <Text
                      className="text-2xl font-bold tracking-widest text-[#10b981]"
                      style={{ fontFamily: "monospace" }}
                      selectable
                    >
                      {league.inviteCode}
                    </Text>
                    <Text className="mt-1.5 text-xs text-[#6b9b8a]">
                      {league.members.length} members
                    </Text>
                  </View>
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={handleShareInvite}
                      className="h-10 w-10 items-center justify-center rounded-full bg-[#0f3a2e] active:bg-[#1a4d3e]"
                      accessibilityLabel="Share invite code"
                      accessibilityRole="button"
                    >
                      <Share2 size={18} color="#e0f0eb" />
                    </Pressable>
                    {isAdmin && (
                      <Pressable
                        onPress={handleRegenerateCode}
                        disabled={regenerateInviteCodeMutation.isPending}
                        className="h-10 w-10 items-center justify-center rounded-full bg-[#0f3a2e] active:bg-[#1a4d3e]"
                        accessibilityLabel="Regenerate invite code"
                        accessibilityRole="button"
                        style={
                          regenerateInviteCodeMutation.isPending
                            ? { opacity: 0.5 }
                            : undefined
                        }
                      >
                        <RefreshCw size={18} color="#e0f0eb" />
                      </Pressable>
                    )}
                  </View>
                </View>
              </View>

              {/* Admin: Create Round Button */}
              {isAdmin && (
                <Pressable
                  onPress={() =>
                    router.push(`/round/create?leagueId=${id}` as never)
                  }
                  className="mb-4 flex-row items-center justify-center gap-2 rounded-2xl bg-[#10b981] py-3 active:bg-[#34d399]"
                  accessibilityLabel="Create round"
                  accessibilityRole="button"
                >
                  <Plus size={20} color="#FFFFFF" strokeWidth={3} />
                  <Text className="text-base font-bold text-white">
                    Create Round
                  </Text>
                </Pressable>
              )}

              {/* Standings */}
              {standings && standings.length > 0 && (
                <View className="mb-6">
                  <View className="mb-3 flex-row items-center gap-2">
                    <Trophy size={18} color="#10b981" />
                    <Text className="text-xl font-bold text-[#e0f0eb]">
                      Standings
                    </Text>
                  </View>
                  <LeagueStandingsTable
                    standings={standings}
                    currentUserId={currentUserId ?? ""}
                  />
                </View>
              )}

              {/* Rounds Header */}
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-xl font-bold text-[#e0f0eb]">Rounds</Text>
              </View>

              {league.rounds.length === 0 && (
                <View className="items-center py-8">
                  <Text className="text-[#6b9b8a] italic">
                    No rounds started yet
                  </Text>
                </View>
              )}
            </View>
          }
          ListFooterComponent={
            <View>
              {/* Members */}
              <Text className="mt-8 mb-4 text-xl font-bold text-[#e0f0eb]">
                Members
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {league.members.map(
                  (member: {
                    id: string;
                    role: string;
                    userId: string;
                    user: { name: string | null };
                  }) => (
                    <View
                      key={member.id}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        borderRadius: 9999,
                        paddingHorizontal: 14,
                        paddingVertical: 6,
                        ...(member.userId === currentUserId
                          ? {
                              borderWidth: 1,
                              borderColor: "rgba(16, 185, 129, 0.4)",
                              backgroundColor: "rgba(16, 185, 129, 0.2)",
                            }
                          : {
                              backgroundColor: "#0f3a2e",
                            }),
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "500",
                          color:
                            member.userId === currentUserId
                              ? "#10b981"
                              : "#e0f0eb",
                        }}
                      >
                        {member.user.name ?? "Unknown"}
                      </Text>
                      {member.role === "OWNER" && (
                        <Text style={{ fontSize: 12 }}>👑</Text>
                      )}
                    </View>
                  ),
                )}
              </View>

              {/* Actions */}
              {!isOwner && (
                <View style={{ marginTop: 32 }}>
                  <Pressable
                    onPress={handleLeaveLeague}
                    disabled={leaveLeagueMutation.isPending}
                    style={({ pressed }) => ({
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: "rgba(239, 68, 68, 0.3)",
                      backgroundColor: pressed
                        ? "rgba(239, 68, 68, 0.2)"
                        : "rgba(239, 68, 68, 0.1)",
                      paddingVertical: 14,
                      opacity: leaveLeagueMutation.isPending ? 0.5 : 1,
                    })}
                  >
                    <LogOut size={18} color="#ef4444" />
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "600",
                        color: "#f87171",
                      }}
                    >
                      Leave League
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          }
        />

        {/* Settings Bottom Sheet */}
        {isAdmin && (
          <LeagueSettingsSheet
            ref={settingsSheetRef}
            leagueId={id}
            name={league.name}
            description={league.description}
            maxMembers={league.maxMembers}
            songsPerRound={league.songsPerRound}
            upvotePointsPerRound={league.upvotePointsPerRound}
            allowDownvotes={league.allowDownvotes}
            downvotePointsPerRound={league.downvotePointsPerRound}
            submissionWindowDays={league.submissionWindowDays}
            votingWindowDays={league.votingWindowDays}
            deadlineBehavior={league.deadlineBehavior}
            maxUpvotesPerSong={league.maxUpvotesPerSong}
            maxDownvotesPerSong={league.maxDownvotesPerSong}
            votingPenalty={league.votingPenalty}
            isOwner={isOwner}
            onDeleteLeague={handleDeleteLeague}
          />
        )}
      </SafeAreaView>
    </GradientBackground>
  );
}
