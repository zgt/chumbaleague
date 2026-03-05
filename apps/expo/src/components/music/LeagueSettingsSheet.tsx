import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react-native";

import { trpc } from "~/utils/api";

export interface LeagueSettingsSheetRef {
  present: () => void;
  dismiss: () => void;
}

interface LeagueSettings {
  leagueId: string;
  name: string;
  description: string | null;
  songsPerRound: number;
  maxMembers: number;
  upvotePointsPerRound: number;
  allowDownvotes: boolean;
  downvotePointsPerRound: number;
  submissionWindowDays: number;
  votingWindowDays: number;
  deadlineBehavior: "STEADY" | "ACCELERATED" | "SPEEDY";
  maxUpvotesPerSong: number | null;
  maxDownvotesPerSong: number | null;
  votingPenalty: boolean;
  isOwner?: boolean;
  onDeleteLeague?: () => void;
}

function SettingsStepper({
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
    <View className="flex-row items-center justify-between rounded-2xl border border-[#0f3a2e] bg-[#020a0a] px-4 py-3">
      <Text className="text-base font-medium text-[#e0f0eb]">{label}</Text>
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="h-9 w-9 items-center justify-center rounded-lg bg-[#0f3a2e] active:bg-[#1a4d3e]"
          style={value <= min ? { opacity: 0.4 } : undefined}
        >
          <ChevronDown size={20} color="#e0f0eb" />
        </Pressable>
        <Text className="w-8 text-center text-lg font-bold text-[#10b981]">
          {value}
        </Text>
        <Pressable
          onPress={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="h-9 w-9 items-center justify-center rounded-lg bg-[#0f3a2e] active:bg-[#1a4d3e]"
          style={value >= max ? { opacity: 0.4 } : undefined}
        >
          <ChevronUp size={20} color="#e0f0eb" />
        </Pressable>
      </View>
    </View>
  );
}

function NullableStepper({
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
    <View className="rounded-2xl border border-[#0f3a2e] bg-[#020a0a] px-4 py-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-medium text-[#e0f0eb]">{label}</Text>
        <Pressable
          onPress={() => onChange(isLimited ? null : min)}
          className={`rounded-full px-3 py-1 ${
            isLimited
              ? "border border-[#10b981] bg-[#10b981]/20"
              : "border border-[#0f3a2e] bg-[#0f3a2e]"
          }`}
        >
          <Text
            className={`text-xs font-medium ${
              isLimited ? "text-[#10b981]" : "text-[#6b9b8a]"
            }`}
          >
            {isLimited ? "Limited" : nullLabel}
          </Text>
        </Pressable>
      </View>
      {isLimited && (
        <View className="mt-3 flex-row items-center justify-end gap-3">
          <Pressable
            onPress={() => onChange(Math.max(min, value - 1))}
            disabled={value <= min}
            className="h-9 w-9 items-center justify-center rounded-lg bg-[#0f3a2e] active:bg-[#1a4d3e]"
            style={value <= min ? { opacity: 0.4 } : undefined}
          >
            <ChevronDown size={20} color="#e0f0eb" />
          </Pressable>
          <Text className="w-8 text-center text-lg font-bold text-[#10b981]">
            {value}
          </Text>
          <Pressable
            onPress={() => onChange(Math.min(max, value + 1))}
            disabled={value >= max}
            className="h-9 w-9 items-center justify-center rounded-lg bg-[#0f3a2e] active:bg-[#1a4d3e]"
            style={value >= max ? { opacity: 0.4 } : undefined}
          >
            <ChevronUp size={20} color="#e0f0eb" />
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

function DeleteConfirmModal({
  visible,
  leagueName,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  visible: boolean;
  leagueName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 items-center justify-center bg-black/60 px-6">
        <View className="w-full max-w-sm rounded-2xl border border-[#0f3a2e] bg-[#071f1a] p-6">
          {/* Warning Icon */}
          <View className="mb-4 items-center">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-red-500/15">
              <AlertTriangle size={28} color="#ef4444" />
            </View>
          </View>

          {/* Title */}
          <Text className="mb-2 text-center text-lg font-bold text-[#e0f0eb]">
            Delete League
          </Text>

          {/* Description */}
          <Text className="mb-1 text-center text-sm text-[#6b9b8a]">
            Are you sure you want to delete
          </Text>
          <Text className="mb-3 text-center text-base font-semibold text-[#10b981]">
            {leagueName}
          </Text>
          <Text className="mb-6 text-center text-sm text-[#6b9b8a]">
            This will permanently delete all rounds, submissions, and votes.
            This action cannot be undone.
          </Text>

          {/* Buttons */}
          <View style={{ gap: 12 }}>
            <Pressable
              onPress={onConfirm}
              disabled={isDeleting}
              style={[
                {
                  alignItems: "center",
                  borderRadius: 12,
                  backgroundColor: "#ef4444",
                  paddingVertical: 14,
                },
                isDeleting ? { opacity: 0.6 } : undefined,
              ]}
            >
              {isDeleting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text
                  style={{ fontSize: 16, fontWeight: "700", color: "#ffffff" }}
                >
                  Delete League
                </Text>
              )}
            </Pressable>
            <Pressable
              onPress={onCancel}
              disabled={isDeleting}
              style={{
                alignItems: "center",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#0f3a2e",
                paddingVertical: 14,
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "500", color: "#e0f0eb" }}
              >
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export const LeagueSettingsSheet = forwardRef<
  LeagueSettingsSheetRef,
  LeagueSettings
>(
  (
    {
      leagueId,
      name,
      description,
      songsPerRound,
      maxMembers,
      upvotePointsPerRound,
      allowDownvotes,
      downvotePointsPerRound,
      submissionWindowDays,
      votingWindowDays,
      deadlineBehavior,
      maxUpvotesPerSong,
      maxDownvotesPerSong,
      votingPenalty,
      isOwner,
      onDeleteLeague,
    },
    ref,
  ) => {
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const queryClient = useQueryClient();

    const [editName, setEditName] = useState(name);
    const [editDescription, setEditDescription] = useState(description ?? "");
    const [editMaxMembers, setEditMaxMembers] = useState(maxMembers);
    const [editSongsPerRound, setEditSongsPerRound] = useState(songsPerRound);
    const [editUpvotePoints, setEditUpvotePoints] =
      useState(upvotePointsPerRound);
    const [editAllowDownvotes, setEditAllowDownvotes] =
      useState(allowDownvotes);
    const [editDownvotePoints, setEditDownvotePoints] = useState(
      downvotePointsPerRound,
    );
    const [editSubmissionWindowDays, setEditSubmissionWindowDays] =
      useState(submissionWindowDays);
    const [editVotingWindowDays, setEditVotingWindowDays] =
      useState(votingWindowDays);
    const [editDeadlineBehavior, setEditDeadlineBehavior] =
      useState(deadlineBehavior);
    const [editMaxUpvotesPerSong, setEditMaxUpvotesPerSong] =
      useState(maxUpvotesPerSong);
    const [editMaxDownvotesPerSong, setEditMaxDownvotesPerSong] =
      useState(maxDownvotesPerSong);
    const [editVotingPenalty, setEditVotingPenalty] = useState(votingPenalty);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const snapPoints = useMemo(() => ["85%"], []);

    const updateMutation = useMutation(
      trpc.musicLeague.updateLeagueSettings.mutationOptions({}),
    );

    const resetToProps = useCallback(() => {
      setEditName(name);
      setEditDescription(description ?? "");
      setEditMaxMembers(maxMembers);
      setEditSongsPerRound(songsPerRound);
      setEditUpvotePoints(upvotePointsPerRound);
      setEditAllowDownvotes(allowDownvotes);
      setEditDownvotePoints(downvotePointsPerRound);
      setEditSubmissionWindowDays(submissionWindowDays);
      setEditVotingWindowDays(votingWindowDays);
      setEditDeadlineBehavior(deadlineBehavior);
      setEditMaxUpvotesPerSong(maxUpvotesPerSong);
      setEditMaxDownvotesPerSong(maxDownvotesPerSong);
      setEditVotingPenalty(votingPenalty);
    }, [
      name,
      description,
      maxMembers,
      songsPerRound,
      upvotePointsPerRound,
      allowDownvotes,
      downvotePointsPerRound,
      submissionWindowDays,
      votingWindowDays,
      deadlineBehavior,
      maxUpvotesPerSong,
      maxDownvotesPerSong,
      votingPenalty,
    ]);

    useImperativeHandle(ref, () => ({
      present: () => {
        resetToProps();
        bottomSheetRef.current?.present();
      },
      dismiss: () => bottomSheetRef.current?.dismiss(),
    }));

    const handleSave = () => {
      if (!editName.trim()) {
        Alert.alert("Name required", "Please enter a league name.");
        return;
      }
      updateMutation.mutate(
        {
          leagueId,
          name: editName.trim(),
          description: editDescription.trim() || undefined,
          maxMembers: editMaxMembers,
          songsPerRound: editSongsPerRound,
          upvotePointsPerRound: editUpvotePoints,
          allowDownvotes: editAllowDownvotes,
          downvotePointsPerRound: editDownvotePoints,
          submissionWindowDays: editSubmissionWindowDays,
          votingWindowDays: editVotingWindowDays,
          deadlineBehavior: editDeadlineBehavior,
          maxUpvotesPerSong: editMaxUpvotesPerSong,
          maxDownvotesPerSong: editMaxDownvotesPerSong,
          votingPenalty: editVotingPenalty,
        },
        {
          onSuccess: () => {
            void queryClient.invalidateQueries(
              trpc.musicLeague.getLeagueById.queryFilter(),
            );
            bottomSheetRef.current?.dismiss();
          },
          onError: (error) => {
            Alert.alert("Failed to save", error.message);
          },
        },
      );
    };

    const handleDeleteConfirm = () => {
      setIsDeleting(true);
      onDeleteLeague?.();
    };

    const renderBackdrop = useCallback(
      (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
        />
      ),
      [],
    );

    return (
      <>
        <BottomSheetModal
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          backdropComponent={renderBackdrop}
          backgroundStyle={{ backgroundColor: "#071f1a" }}
          handleIndicatorStyle={{ backgroundColor: "#6b9b8a" }}
        >
          <BottomSheetScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          >
            <Text className="mb-6 text-xl font-bold text-[#e0f0eb]">
              League Settings
            </Text>

            {/* Name */}
            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-[#6b9b8a]">
                League Name
              </Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                placeholder="League name"
                placeholderTextColor="#6b9b8a"
                maxLength={100}
                className="rounded-2xl border border-[#0f3a2e] bg-[#020a0a] px-4 text-[#e0f0eb]"
                style={{
                  fontSize: 16,
                  height: 48,
                  textAlignVertical: "center",
                }}
              />
            </View>

            {/* Description */}
            <View className="mb-6">
              <Text className="mb-2 text-sm font-medium text-[#6b9b8a]">
                Description
              </Text>
              <TextInput
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="What's this league about?"
                placeholderTextColor="#6b9b8a"
                maxLength={500}
                multiline
                numberOfLines={3}
                className="rounded-2xl border border-[#0f3a2e] bg-[#020a0a] px-4 text-[#e0f0eb]"
                style={{
                  fontSize: 16,
                  minHeight: 80,
                  paddingVertical: 12,
                  textAlignVertical: "top",
                }}
              />
            </View>

            {/* Round Windows */}
            <Text className="mb-3 text-lg font-bold text-[#e0f0eb]">
              Round Windows
            </Text>

            {/* Submission Window Presets */}
            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-[#6b9b8a]">
                Submission window
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {SUBMISSION_WINDOW_PRESETS.map((preset) => (
                  <Pressable
                    key={preset.days}
                    onPress={() => setEditSubmissionWindowDays(preset.days)}
                    className={`rounded-full px-4 py-2 ${
                      editSubmissionWindowDays === preset.days
                        ? "border border-[#10b981] bg-[#10b981]/20"
                        : "border border-[#0f3a2e] bg-[#020a0a]"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        editSubmissionWindowDays === preset.days
                          ? "text-[#10b981]"
                          : "text-[#6b9b8a]"
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
              <Text className="mb-2 text-sm font-medium text-[#6b9b8a]">
                Voting window (after submissions close)
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {VOTING_WINDOW_PRESETS.map((preset) => (
                  <Pressable
                    key={preset.days}
                    onPress={() => setEditVotingWindowDays(preset.days)}
                    className={`rounded-full px-4 py-2 ${
                      editVotingWindowDays === preset.days
                        ? "border border-[#10b981] bg-[#10b981]/20"
                        : "border border-[#0f3a2e] bg-[#020a0a]"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        editVotingWindowDays === preset.days
                          ? "text-[#10b981]"
                          : "text-[#6b9b8a]"
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
              <Text className="mb-2 text-sm font-medium text-[#6b9b8a]">
                Deadline behavior
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {DEADLINE_BEHAVIORS.map((preset) => (
                  <Pressable
                    key={preset.value}
                    onPress={() => setEditDeadlineBehavior(preset.value)}
                    className={`rounded-full px-4 py-2 ${
                      editDeadlineBehavior === preset.value
                        ? "border border-[#10b981] bg-[#10b981]/20"
                        : "border border-[#0f3a2e] bg-[#020a0a]"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        editDeadlineBehavior === preset.value
                          ? "text-[#10b981]"
                          : "text-[#6b9b8a]"
                      }`}
                    >
                      {preset.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Text className="mt-1.5 text-xs text-[#6b9b8a]">
                {
                  DEADLINE_BEHAVIORS.find(
                    (b) => b.value === editDeadlineBehavior,
                  )?.desc
                }
              </Text>
            </View>

            {/* Settings */}
            <Text className="mb-3 text-lg font-bold text-[#e0f0eb]">
              Settings
            </Text>

            <View className="mb-6 gap-3">
              <SettingsStepper
                label="Max members"
                value={editMaxMembers}
                onChange={setEditMaxMembers}
                min={2}
                max={50}
              />

              <SettingsStepper
                label="Songs per round"
                value={editSongsPerRound}
                onChange={setEditSongsPerRound}
                min={1}
                max={5}
              />

              <SettingsStepper
                label="Upvote points"
                value={editUpvotePoints}
                onChange={setEditUpvotePoints}
                min={1}
                max={20}
              />

              <NullableStepper
                label="Max upvotes per song"
                value={editMaxUpvotesPerSong}
                onChange={setEditMaxUpvotesPerSong}
                min={1}
                max={10}
              />

              <View className="flex-row items-center justify-between rounded-2xl border border-[#0f3a2e] bg-[#020a0a] px-4 py-3">
                <View className="flex-1">
                  <Text className="text-base font-medium text-[#e0f0eb]">
                    Allow downvotes
                  </Text>
                  <Text className="mt-0.5 text-xs text-[#6b9b8a]">
                    Members can spend points to downvote songs
                  </Text>
                </View>
                <Switch
                  value={editAllowDownvotes}
                  onValueChange={setEditAllowDownvotes}
                  trackColor={{ false: "#0f3a2e", true: "#10b981" }}
                  thumbColor={editAllowDownvotes ? "#020a0a" : "#6b9b8a"}
                />
              </View>

              {editAllowDownvotes && (
                <>
                  <SettingsStepper
                    label="Downvote points"
                    value={editDownvotePoints}
                    onChange={setEditDownvotePoints}
                    min={1}
                    max={10}
                  />
                  <NullableStepper
                    label="Max downvotes per song"
                    value={editMaxDownvotesPerSong}
                    onChange={setEditMaxDownvotesPerSong}
                    min={1}
                    max={5}
                  />
                </>
              )}

              {/* Voting Penalty Toggle */}
              <View className="flex-row items-center justify-between rounded-2xl border border-[#0f3a2e] bg-[#020a0a] px-4 py-3">
                <View className="flex-1">
                  <Text className="text-base font-medium text-[#e0f0eb]">
                    Voting penalty
                  </Text>
                  <Text className="mt-0.5 text-xs text-[#6b9b8a]">
                    Penalize members who don't vote
                  </Text>
                </View>
                <Switch
                  value={editVotingPenalty}
                  onValueChange={setEditVotingPenalty}
                  trackColor={{ false: "#0f3a2e", true: "#10b981" }}
                  thumbColor={editVotingPenalty ? "#020a0a" : "#6b9b8a"}
                />
              </View>
            </View>

            {/* Save Button */}
            <Pressable
              onPress={handleSave}
              disabled={updateMutation.isPending || !editName.trim()}
              style={{
                alignItems: "center",
                borderRadius: 16,
                backgroundColor: "#10b981",
                paddingVertical: 16,
                opacity: updateMutation.isPending || !editName.trim() ? 0.5 : 1,
              }}
            >
              {updateMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: "#FFFFFF",
                  }}
                >
                  Save Changes
                </Text>
              )}
            </Pressable>

            {/* Delete League */}
            {isOwner && onDeleteLeague && (
              <Pressable
                onPress={() => setDeleteModalVisible(true)}
                className="mt-6 flex-row items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 py-3 active:bg-red-500/20"
              >
                <Trash2 size={18} color="#ef4444" />
                <Text className="font-semibold text-red-400">
                  Delete League
                </Text>
              </Pressable>
            )}
          </BottomSheetScrollView>
        </BottomSheetModal>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          visible={deleteModalVisible}
          leagueName={name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteModalVisible(false)}
          isDeleting={isDeleting}
        />
      </>
    );
  },
);

LeagueSettingsSheet.displayName = "LeagueSettingsSheet";
