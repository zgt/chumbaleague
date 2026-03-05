import { useCallback, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Linking,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  LogOut,
  Music,
  ShieldAlert,
  Star,
  Trophy,
  Users,
} from "lucide-react-native";

import { GradientBackground } from "~/components/GradientBackground";
import { UserAvatar } from "~/components/UserAvatar";
import { trpc } from "~/utils/api";
import { authClient } from "~/utils/auth";

interface StatCard {
  id: string;
  label: string;
  value: string | number;
  icon: React.ReactNode;
}

export default function ProfileScreen() {
  const router = useRouter();
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
  const {
    data: profile,
    isLoading,
    refetch,
  } = useQuery(trpc.musicLeague.getUserProfile.queryOptions());

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    triggerRipple();
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch, triggerRipple]);

  if (isLoading) {
    return (
      <GradientBackground>
        <SafeAreaView style={{ flex: 1 }}>
          <Stack.Screen options={{ headerShown: false }} />
        </SafeAreaView>
      </GradientBackground>
    );
  }

  const stats: StatCard[] = [
    {
      id: "points",
      label: "Total Points",
      value: profile?.totalPoints ?? 0,
      icon: <Star size={20} color="#FFD700" />,
    },
    {
      id: "wins",
      label: "Rounds Won",
      value: profile?.roundsWon ?? 0,
      icon: <Trophy size={20} color="#50C878" />,
    },
    {
      id: "leagues",
      label: "Leagues Active",
      value: profile?.leaguesJoined ?? 0,
      icon: <Users size={20} color="#66B2FF" />,
    },
    {
      id: "submissions",
      label: "Total Submissions",
      value: profile?.totalSubmissions ?? 0,
      icon: <Music size={20} color="#BA68C8" />,
    },
  ];

  const renderStatCard = ({ item }: { item: StatCard }) => (
    <View className="flex-1 rounded-2xl border border-[#3D1F5C] bg-[#1A0E2E] p-4">
      <View className="mb-2">{item.icon}</View>
      <Text className="text-2xl font-bold text-[#E8E0F0]">{item.value}</Text>
      <Text className="text-xs text-[#9B8AB8]">{item.label}</Text>
    </View>
  );

  return (
    <GradientBackground rippleTrigger={rippleTrigger}>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <Stack.Screen options={{ headerShown: false }} />

        {/* Header */}
        <View className="flex-row items-center px-4 py-3">
          <Pressable
            onPress={() => router.back()}
            className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#1A0E2E]"
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <ChevronLeft size={20} color="#E8E0F0" />
          </Pressable>
          <Text className="text-2xl font-bold text-[#E8E0F0]">Profile</Text>
        </View>

        <FlatList
          data={[{ id: "content" }]}
          keyExtractor={(item) => item.id}
          renderItem={() => null}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#c03484"
            />
          }
          ListHeaderComponent={
            <View className="px-4 pb-8">
              {/* User Avatar & Name */}
              <View className="mb-6 items-center">
                <UserAvatar
                  name={session?.user.name}
                  image={session?.user.image}
                  size={80}
                />
                <Text className="mt-3 text-xl font-bold text-[#E8E0F0]">
                  {session?.user.name ?? "User"}
                </Text>
                {profile && (
                  <Text className="mt-1 text-sm text-[#9B8AB8]">
                    {profile.roundsParticipated} rounds played
                  </Text>
                )}
              </View>

              {/* Stats Grid - 2x2 */}
              <View className="mb-6 gap-3">
                <View className="flex-row gap-3">
                  {stats.slice(0, 2).map((stat) => (
                    <View key={stat.id} className="flex-1">
                      {renderStatCard({ item: stat })}
                    </View>
                  ))}
                </View>
                <View className="flex-row gap-3">
                  {stats.slice(2, 4).map((stat) => (
                    <View key={stat.id} className="flex-1">
                      {renderStatCard({ item: stat })}
                    </View>
                  ))}
                </View>
              </View>

              {/* Best Submission */}
              {profile?.bestSubmission && (
                <View className="mb-6">
                  <Text className="mb-3 text-lg font-bold text-[#E8E0F0]">
                    Best Submission
                  </Text>
                  <View className="rounded-2xl border border-[#FFD700]/30 bg-[#FFD700]/5 p-4">
                    <View className="flex-row items-center gap-4">
                      {profile.bestSubmission.albumArtUrl ? (
                        <Image
                          source={{ uri: profile.bestSubmission.albumArtUrl }}
                          style={{ width: 72, height: 72, borderRadius: 8 }}
                        />
                      ) : (
                        <View className="h-[72px] w-[72px] items-center justify-center rounded-lg bg-[#1A0E2E]">
                          <Music size={28} color="#9B8AB8" />
                        </View>
                      )}
                      <View className="flex-1">
                        <Text
                          className="text-base font-bold text-[#E8E0F0]"
                          numberOfLines={1}
                        >
                          {profile.bestSubmission.trackName}
                        </Text>
                        <Text
                          className="text-sm text-[#9B8AB8]"
                          numberOfLines={1}
                        >
                          {profile.bestSubmission.artistName}
                        </Text>
                        <Text className="mt-1 text-xs text-[#9B8AB8]">
                          Theme: {profile.bestSubmission.roundTheme}
                        </Text>
                        <View className="mt-2 flex-row items-center gap-1">
                          <Trophy size={14} color="#FFD700" />
                          <Text className="text-sm font-bold text-[#FFD700]">
                            {profile.bestSubmission.points} points
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {/* Navigation Links */}
              <View className="mb-6 gap-3">
                <Pressable
                  onPress={() => router.push("/settings" as never)}
                  className="flex-row items-center justify-between rounded-2xl border border-[#3D1F5C] bg-[#1A0E2E] p-4 active:bg-[#3D1F5C]/60"
                >
                  <View className="flex-row items-center gap-3">
                    <Bell size={20} color="#9B8AB8" />
                    <Text className="text-base font-medium text-[#E8E0F0]">
                      Notification Settings
                    </Text>
                  </View>
                  <ChevronRight size={18} color="#9B8AB8" />
                </Pressable>

                <Pressable
                  onPress={() => router.push("/blocked-users" as never)}
                  className="flex-row items-center justify-between rounded-2xl border border-[#3D1F5C] bg-[#1A0E2E] p-4 active:bg-[#3D1F5C]/60"
                >
                  <View className="flex-row items-center gap-3">
                    <ShieldAlert size={20} color="#9B8AB8" />
                    <Text className="text-base font-medium text-[#E8E0F0]">
                      Blocked Users
                    </Text>
                  </View>
                  <ChevronRight size={18} color="#9B8AB8" />
                </Pressable>

                <Pressable
                  onPress={() =>
                    Linking.openURL("mailto:support@chumbaleague.app")
                  }
                  className="flex-row items-center justify-between rounded-2xl border border-[#3D1F5C] bg-[#1A0E2E] p-4 active:bg-[#3D1F5C]/60"
                >
                  <View className="flex-row items-center gap-3">
                    <HelpCircle size={20} color="#9B8AB8" />
                    <Text className="text-base font-medium text-[#E8E0F0]">
                      Contact Support
                    </Text>
                  </View>
                  <ChevronRight size={18} color="#9B8AB8" />
                </Pressable>
              </View>

              {/* Sign Out */}
              <Pressable
                onPress={() => authClient.signOut()}
                className="flex-row items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 active:bg-red-500/20"
              >
                <LogOut size={18} color="#f87171" />
                <Text className="font-semibold text-red-400">Sign Out</Text>
              </Pressable>
            </View>
          }
        />
      </SafeAreaView>
    </GradientBackground>
  );
}
