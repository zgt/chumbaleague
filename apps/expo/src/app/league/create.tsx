import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react-native";

import { GradientBackground } from "~/components/GradientBackground";
import { trpc } from "~/utils/api";

function NumberStepper({
  value,
  onChange,
  min,
  max,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  label: string;
}) {
  return (
    <View className="flex-row items-center justify-between rounded-2xl border border-[#3D1F5C] bg-[#1A0E2E] px-4 py-3">
      <Text className="text-base font-medium text-[#E8E0F0]">{label}</Text>
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="h-9 w-9 items-center justify-center rounded-lg bg-[#3D1F5C] active:bg-[#4D2F6C]"
          style={value <= min ? { opacity: 0.4 } : undefined}
        >
          <ChevronDown size={20} color="#E8E0F0" />
        </Pressable>
        <Text className="w-8 text-center text-lg font-bold text-[#c03484]">
          {value}
        </Text>
        <Pressable
          onPress={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="h-9 w-9 items-center justify-center rounded-lg bg-[#3D1F5C] active:bg-[#4D2F6C]"
          style={value >= max ? { opacity: 0.4 } : undefined}
        >
          <ChevronUp size={20} color="#E8E0F0" />
        </Pressable>
      </View>
    </View>
  );
}

function NullableNumberStepper({
  value,
  onChange,
  min,
  max,
  label,
  nullLabel = "No limit",
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  min: number;
  max: number;
  label: string;
  nullLabel?: string;
}) {
  const isLimited = value !== null;
  return (
    <View className="rounded-2xl border border-[#3D1F5C] bg-[#1A0E2E] px-4 py-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-medium text-[#E8E0F0]">{label}</Text>
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => onChange(isLimited ? null : min)}
            className={`rounded-full px-3 py-1 ${
              isLimited
                ? "border border-[#c03484] bg-[#c03484]/20"
                : "border border-[#3D1F5C] bg-[#3D1F5C]"
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                isLimited ? "text-[#c03484]" : "text-[#9B8AB8]"
              }`}
            >
              {isLimited ? "Limited" : nullLabel}
            </Text>
          </Pressable>
        </View>
      </View>
      {isLimited && (
        <View className="mt-3 flex-row items-center justify-end gap-3">
          <Pressable
            onPress={() => onChange(Math.max(min, value - 1))}
            disabled={value <= min}
            className="h-9 w-9 items-center justify-center rounded-lg bg-[#3D1F5C] active:bg-[#4D2F6C]"
            style={value <= min ? { opacity: 0.4 } : undefined}
          >
            <ChevronDown size={20} color="#E8E0F0" />
          </Pressable>
          <Text className="w-8 text-center text-lg font-bold text-[#c03484]">
            {value}
          </Text>
          <Pressable
            onPress={() => onChange(Math.min(max, value + 1))}
            disabled={value >= max}
            className="h-9 w-9 items-center justify-center rounded-lg bg-[#3D1F5C] active:bg-[#4D2F6C]"
            style={value >= max ? { opacity: 0.4 } : undefined}
          >
            <ChevronUp size={20} color="#E8E0F0" />
          </Pressable>
        </View>
      )}
    </View>
  );
}

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
  { label: "Steady", value: "STEADY" as const, desc: "Fixed deadlines" },
  {
    label: "Accelerated",
    value: "ACCELERATED" as const,
    desc: "Earlier if all submit",
  },
  { label: "Speedy", value: "SPEEDY" as const, desc: "Fast transitions" },
];

export default function CreateLeague() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [maxMembers, setMaxMembers] = useState(20);
  const [songsPerRound, setSongsPerRound] = useState(1);
  const [upvotePoints, setUpvotePoints] = useState(5);
  const [allowDownvotes, setAllowDownvotes] = useState(false);
  const [downvotePoints, setDownvotePoints] = useState(3);
  const [submissionWindowDays, setSubmissionWindowDays] = useState(3);
  const [votingWindowDays, setVotingWindowDays] = useState(2);
  const [deadlineBehavior, setDeadlineBehavior] = useState<
    "STEADY" | "ACCELERATED" | "SPEEDY"
  >("STEADY");
  const [maxUpvotesPerSong, setMaxUpvotesPerSong] = useState<number | null>(
    null,
  );
  const [maxDownvotesPerSong, setMaxDownvotesPerSong] = useState<number | null>(
    null,
  );
  const [votingPenalty, setVotingPenalty] = useState(false);

  const createMutation = useMutation(
    trpc.musicLeague.createLeague.mutationOptions({
      onSuccess: async (data) => {
        await queryClient.invalidateQueries(
          trpc.musicLeague.getAllLeagues.queryFilter(),
        );
        router.replace(`/league/${data.id}` as never);
      },
      onError: (error) => {
        Alert.alert("Failed to create league", error.message);
      },
    }),
  );

  const handleCreate = () => {
    if (!name.trim()) {
      Alert.alert("Name required", "Please enter a league name.");
      return;
    }
    createMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      maxMembers,
      songsPerRound,
      upvotePointsPerRound: upvotePoints,
      allowDownvotes,
      submissionWindowDays,
      votingWindowDays,
      downvotePointsPerRound: downvotePoints,
      deadlineBehavior,
      maxUpvotesPerSong,
      maxDownvotesPerSong,
      votingPenalty,
    });
  };

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <Stack.Screen options={{ headerShown: false }} />

        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4">
          <Pressable
            onPress={() => router.back()}
            className="rounded-full bg-[#3D1F5C] p-2"
          >
            <ArrowLeft color="#E8E0F0" size={24} />
          </Pressable>
          <Text className="text-xl font-bold text-[#E8E0F0]">
            Create League
          </Text>
          <View className="w-10" />
        </View>

        <FlatList
          data={[{ key: "form" }]}
          renderItem={() => null}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 64 }}
          ListHeaderComponent={
            <View>
              {/* Name */}
              <View className="mb-4">
                <Text className="mb-2 text-sm font-medium text-[#9B8AB8]">
                  League Name *
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Friday Vibes"
                  placeholderTextColor="#9B8AB8"
                  maxLength={100}
                  className="rounded-2xl border border-[#3D1F5C] bg-[#1A0E2E] px-4 text-[#E8E0F0]"
                  style={{
                    fontSize: 16,
                    height: 48,
                    textAlignVertical: "center",
                  }}
                />
              </View>

              {/* Description */}
              <View className="mb-6">
                <Text className="mb-2 text-sm font-medium text-[#9B8AB8]">
                  Description
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="What's this league about?"
                  placeholderTextColor="#9B8AB8"
                  maxLength={500}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  className="rounded-2xl border border-[#3D1F5C] bg-[#1A0E2E] px-4 text-[#E8E0F0]"
                  style={{
                    fontSize: 16,
                    minHeight: 80,
                    paddingVertical: 12,
                    textAlignVertical: "top",
                  }}
                />
              </View>

              {/* Round Windows */}
              <Text className="mb-3 text-lg font-bold text-[#E8E0F0]">
                Round Windows
              </Text>

              {/* Submission Window Presets */}
              <View className="mb-4">
                <Text className="mb-2 text-sm font-medium text-[#9B8AB8]">
                  Submission window
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {SUBMISSION_WINDOW_PRESETS.map((preset) => (
                    <Pressable
                      key={preset.days}
                      onPress={() => setSubmissionWindowDays(preset.days)}
                      className={`rounded-full px-4 py-2 ${
                        submissionWindowDays === preset.days
                          ? "border border-[#c03484] bg-[#c03484]/20"
                          : "border border-[#3D1F5C] bg-[#1A0E2E]"
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          submissionWindowDays === preset.days
                            ? "text-[#c03484]"
                            : "text-[#9B8AB8]"
                        }`}
                      >
                        {preset.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Voting Window Presets */}
              <View className="mb-4">
                <Text className="mb-2 text-sm font-medium text-[#9B8AB8]">
                  Voting window (after submissions close)
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {VOTING_WINDOW_PRESETS.map((preset) => (
                    <Pressable
                      key={preset.days}
                      onPress={() => setVotingWindowDays(preset.days)}
                      className={`rounded-full px-4 py-2 ${
                        votingWindowDays === preset.days
                          ? "border border-[#c03484] bg-[#c03484]/20"
                          : "border border-[#3D1F5C] bg-[#1A0E2E]"
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          votingWindowDays === preset.days
                            ? "text-[#c03484]"
                            : "text-[#9B8AB8]"
                        }`}
                      >
                        {preset.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Deadline Behavior */}
              <View className="mb-6">
                <Text className="mb-2 text-sm font-medium text-[#9B8AB8]">
                  Deadline behavior
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {DEADLINE_BEHAVIORS.map((preset) => (
                    <Pressable
                      key={preset.value}
                      onPress={() => setDeadlineBehavior(preset.value)}
                      className={`rounded-full px-4 py-2 ${
                        deadlineBehavior === preset.value
                          ? "border border-[#c03484] bg-[#c03484]/20"
                          : "border border-[#3D1F5C] bg-[#1A0E2E]"
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          deadlineBehavior === preset.value
                            ? "text-[#c03484]"
                            : "text-[#9B8AB8]"
                        }`}
                      >
                        {preset.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Text className="mt-1.5 text-xs text-[#9B8AB8]">
                  {
                    DEADLINE_BEHAVIORS.find(
                      (b) => b.value === deadlineBehavior,
                    )?.desc
                  }
                </Text>
              </View>

              {/* Settings */}
              <Text className="mb-3 text-lg font-bold text-[#E8E0F0]">
                Settings
              </Text>

              <View className="mb-4 gap-3">
                <NumberStepper
                  label="Max members"
                  value={maxMembers}
                  onChange={setMaxMembers}
                  min={2}
                  max={50}
                />

                <NumberStepper
                  label="Songs per round"
                  value={songsPerRound}
                  onChange={setSongsPerRound}
                  min={1}
                  max={5}
                />

                <NumberStepper
                  label="Upvote points per round"
                  value={upvotePoints}
                  onChange={setUpvotePoints}
                  min={1}
                  max={20}
                />

                <NullableNumberStepper
                  label="Max upvotes per song"
                  value={maxUpvotesPerSong}
                  onChange={setMaxUpvotesPerSong}
                  min={1}
                  max={10}
                />

                {/* Allow Downvotes Toggle */}
                <View className="flex-row items-center justify-between rounded-2xl border border-[#3D1F5C] bg-[#1A0E2E] px-4 py-3">
                  <View className="flex-1">
                    <Text className="text-base font-medium text-[#E8E0F0]">
                      Allow downvotes
                    </Text>
                    <Text className="mt-0.5 text-xs text-[#9B8AB8]">
                      Members can spend points to downvote songs
                    </Text>
                  </View>
                  <Switch
                    value={allowDownvotes}
                    onValueChange={setAllowDownvotes}
                    trackColor={{ false: "#3D1F5C", true: "#c03484" }}
                    thumbColor={allowDownvotes ? "#0A0A14" : "#9B8AB8"}
                  />
                </View>

                {/* Downvote Points (only when downvotes enabled) */}
                {allowDownvotes && (
                  <>
                    <NumberStepper
                      label="Downvote points per round"
                      value={downvotePoints}
                      onChange={setDownvotePoints}
                      min={1}
                      max={10}
                    />
                    <NullableNumberStepper
                      label="Max downvotes per song"
                      value={maxDownvotesPerSong}
                      onChange={setMaxDownvotesPerSong}
                      min={1}
                      max={5}
                    />
                  </>
                )}

                {/* Voting Penalty Toggle */}
                <View className="flex-row items-center justify-between rounded-2xl border border-[#3D1F5C] bg-[#1A0E2E] px-4 py-3">
                  <View className="flex-1">
                    <Text className="text-base font-medium text-[#E8E0F0]">
                      Voting penalty
                    </Text>
                    <Text className="mt-0.5 text-xs text-[#9B8AB8]">
                      Penalize members who don't vote
                    </Text>
                  </View>
                  <Switch
                    value={votingPenalty}
                    onValueChange={setVotingPenalty}
                    trackColor={{ false: "#3D1F5C", true: "#c03484" }}
                    thumbColor={votingPenalty ? "#0A0A14" : "#9B8AB8"}
                  />
                </View>
              </View>

              {/* Create Button */}
              <Pressable
                onPress={handleCreate}
                disabled={createMutation.isPending || !name.trim()}
                style={{
                  alignItems: "center",
                  borderRadius: 12,
                  backgroundColor: "#c03484",
                  paddingVertical: 16,
                  marginTop: 16,
                  opacity: createMutation.isPending || !name.trim() ? 0.5 : 1,
                }}
              >
                {createMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: "#FFFFFF",
                    }}
                  >
                    Create League
                  </Text>
                )}
              </Pressable>
            </View>
          }
        />
      </SafeAreaView>
    </GradientBackground>
  );
}
