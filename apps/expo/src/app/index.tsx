import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Music, Plus, Search, User } from "lucide-react-native";

import { GradientBackground } from "~/components/GradientBackground";
import { trpc } from "~/utils/api";

export default function HomeScreen() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
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

  const {
    data: leagues,
    isLoading,
    refetch,
  } = useQuery(trpc.musicLeague.getAllLeagues.queryOptions());

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    triggerRipple();
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch, triggerRipple]);

  const handleJoinNavigate = () => {
    const code = inviteCode.trim().toUpperCase();
    if (!code) {
      Alert.alert(
        "Enter a code",
        "Please enter an invite code to join a league.",
      );
      return;
    }
    setInviteCode("");
    router.push(`/join/${code}` as never);
  };

  const renderLeagueCard = useCallback(
    ({ item }: { item: NonNullable<typeof leagues>[number] }) => (
      <Pressable
        onPress={() => router.push(`/league/${item.id}` as never)}
        className="mx-4 mb-3 rounded-2xl border border-[#3D1F5C] bg-[#1A0E2E] p-4 active:bg-[#3D1F5C]/60"
        accessibilityLabel={`League: ${item.name}, ${item.memberCount} members`}
        accessibilityRole="button"
      >
        <View className="flex-row items-center justify-between">
          <Text className="flex-1 text-lg font-semibold text-[#E8E0F0]">
            {item.name}
          </Text>
          <View className="ml-2 rounded-full bg-[#c03484]/15 px-2.5 py-1">
            <Text className="text-xs font-medium text-[#c03484]">
              {item.memberCount} members
            </Text>
          </View>
        </View>

        {item.currentRound ? (
          <View className="mt-3 rounded-xl bg-[#0A0A14]/60 p-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="mb-0.5 text-[11px] font-bold uppercase text-[#c03484]">
                  Current Round
                </Text>
                <Text className="text-[15px] font-medium text-[#E8E0F0]">
                  {item.currentRound.themeName}
                </Text>
              </View>
              <View className="ml-2 rounded-md bg-[#3D1F5C] px-2 py-1">
                <Text className="text-xs font-medium text-[#9B8AB8]">
                  {item.currentRound.status}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <Text className="mt-2 text-sm italic text-[#9B8AB8]">
            No active rounds
          </Text>
        )}
      </Pressable>
    ),
    [router],
  );

  return (
    <GradientBackground rippleTrigger={rippleTrigger}>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <Stack.Screen
          options={{ title: "Chumbaleague", headerShown: false }}
        />

        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <Text className="text-3xl font-bold text-[#E8E0F0]">
            Chumba<Text className="text-[#c03484]">league</Text>
          </Text>
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => router.push("/profile" as never)}
              className="h-10 w-10 items-center justify-center rounded-full bg-[#3D1F5C] active:bg-[#4D2F6C]"
              accessibilityLabel="Profile"
              accessibilityRole="button"
            >
              <User size={18} color="#E8E0F0" />
            </Pressable>
            <Pressable
              onPress={() => router.push("/league/create" as never)}
              className="flex-row items-center gap-1.5 rounded-full bg-[#c03484] px-4 py-2 active:bg-[#d04494]"
              accessibilityLabel="Create league"
              accessibilityRole="button"
            >
              <Plus size={18} color="#FFFFFF" strokeWidth={3} />
              <Text className="text-sm font-bold text-white">Create</Text>
            </Pressable>
          </View>
        </View>

        {/* Join League Input */}
        <View className="flex-row items-center gap-2 px-4 pb-4">
          <View className="flex-1 flex-row items-center rounded-2xl border border-[#3D1F5C] bg-[#1A0E2E] px-3">
            <Search size={18} color="#9B8AB8" />
            <TextInput
              value={inviteCode}
              onChangeText={setInviteCode}
              placeholder="Enter invite code"
              placeholderTextColor="#9B8AB8"
              autoCapitalize="characters"
              returnKeyType="go"
              onSubmitEditing={handleJoinNavigate}
              className="flex-1 py-3 pl-2 text-base text-[#E8E0F0]"
            />
          </View>
          <Pressable
            onPress={handleJoinNavigate}
            disabled={!inviteCode.trim()}
            className="rounded-2xl bg-[#3D1F5C] px-4 py-3 active:bg-[#4D2F6C]"
            style={!inviteCode.trim() ? { opacity: 0.5 } : undefined}
            accessibilityLabel="Join league"
            accessibilityRole="button"
          >
            <Text className="font-semibold text-[#E8E0F0]">Join</Text>
          </Pressable>
        </View>

        {/* Content */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#c03484" />
          </View>
        ) : !leagues || leagues.length === 0 ? (
          <View className="flex-1 items-center px-8 pt-20">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-[#3D1F5C]">
              <Music size={28} color="#c03484" />
            </View>
            <Text className="mb-2 text-center text-xl font-bold text-[#E8E0F0]">
              No leagues yet
            </Text>
            <Text className="mb-6 text-center text-sm leading-5 text-[#9B8AB8]">
              Create a new league to play with friends, or enter an invite code
              above to join one.
            </Text>
            <Pressable
              onPress={() => router.push("/league/create" as never)}
              className="flex-row items-center gap-2 rounded-2xl bg-[#c03484] px-6 py-3 active:bg-[#d04494]"
            >
              <Plus size={20} color="#FFFFFF" strokeWidth={3} />
              <Text className="text-base font-bold text-white">
                Create Your First League
              </Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={leagues}
            keyExtractor={(item) => item.id}
            renderItem={renderLeagueCard}
            contentContainerStyle={{
              paddingTop: 4,
              paddingBottom: 100,
              flexGrow: 1,
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#c03484"
              />
            }
          />
        )}
      </SafeAreaView>
    </GradientBackground>
  );
}
