import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, BellOff, ChevronLeft } from "lucide-react-native";

import { GradientBackground } from "~/components/GradientBackground";
import { trpc } from "~/utils/api";

interface NotificationPref {
  key: "roundStart" | "submissionReminder" | "votingOpen" | "resultsAvailable";
  label: string;
  description: string;
}

const NOTIFICATION_PREFS: NotificationPref[] = [
  {
    key: "roundStart",
    label: "Round Started",
    description: "Get notified when a new round begins",
  },
  {
    key: "submissionReminder",
    label: "Submission Reminder",
    description: "Reminder before submission deadline",
  },
  {
    key: "votingOpen",
    label: "Voting Open",
    description: "Get notified when voting starts",
  },
  {
    key: "resultsAvailable",
    label: "Results Available",
    description: "Get notified when results are posted",
  },
];

export default function SettingsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery(
    trpc.musicLeague.getUserProfile.queryOptions(),
  );

  const [prefs, setPrefs] = useState({
    roundStart: true,
    submissionReminder: true,
    votingOpen: true,
    resultsAvailable: true,
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Sync prefs from server
  useEffect(() => {
    if (profile?.notificationPreferences) {
      const serverPrefs = profile.notificationPreferences as Record<
        string,
        boolean
      >;
      /* eslint-disable react-hooks/set-state-in-effect -- intentional: syncing server notification prefs to local state */
      setPrefs({
        roundStart: serverPrefs.roundStart ?? true,
        submissionReminder: serverPrefs.submissionReminder ?? true,
        votingOpen: serverPrefs.votingOpen ?? true,
        resultsAvailable: serverPrefs.resultsAvailable ?? true,
      });
      setHasChanges(false);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [profile?.notificationPreferences]);

  const saveMutation = useMutation(
    trpc.musicLeague.updateNotificationPreferences.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.musicLeague.getUserProfile.queryFilter(),
        );
        setHasChanges(false);
        Alert.alert("Saved", "Notification preferences updated.");
      },
      onError: (error) => {
        Alert.alert("Failed to save", error.message);
      },
    }),
  );

  const handleToggle = (key: NotificationPref["key"]) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      setHasChanges(true);
      return next;
    });
  };

  const handleSave = () => {
    saveMutation.mutate(prefs);
  };

  if (isLoading) {
    return (
      <GradientBackground>
        <SafeAreaView style={{ flex: 1 }}>
          <Stack.Screen options={{ headerShown: false }} />
        </SafeAreaView>
      </GradientBackground>
    );
  }

  const allEnabled = Object.values(prefs).every(Boolean);

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <Stack.Screen options={{ headerShown: false }} />

        {/* Header */}
        <View className="flex-row items-center px-4 py-3">
          <Pressable
            onPress={() => router.back()}
            className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#071f1a]"
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <ChevronLeft size={20} color="#e0f0eb" />
          </Pressable>
          <Text className="text-2xl font-bold text-[#e0f0eb]">Settings</Text>
        </View>

        <View className="flex-1 px-4">
          {/* Notification Section Header */}
          <View className="mb-4 flex-row items-center gap-3">
            {allEnabled ? (
              <Bell size={22} color="#10b981" />
            ) : (
              <BellOff size={22} color="#6b9b8a" />
            )}
            <View>
              <Text className="text-lg font-bold text-[#e0f0eb]">
                Notifications
              </Text>
              <Text className="text-sm text-[#6b9b8a]">
                Choose which notifications you receive
              </Text>
            </View>
          </View>

          {/* Notification Toggles */}
          <View className="overflow-hidden rounded-2xl border border-[#0f3a2e] bg-[#071f1a]">
            {NOTIFICATION_PREFS.map((pref, index) => (
              <View
                key={pref.key}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 16,
                  borderBottomWidth:
                    index < NOTIFICATION_PREFS.length - 1 ? 1 : 0,
                  borderBottomColor: "#0f3a2e",
                }}
              >
                <View style={{ flex: 1, paddingRight: 16 }}>
                  <Text className="text-base font-medium text-[#e0f0eb]">
                    {pref.label}
                  </Text>
                  <Text className="mt-0.5 text-xs text-[#6b9b8a]">
                    {pref.description}
                  </Text>
                </View>
                <Switch
                  value={prefs[pref.key]}
                  onValueChange={() => handleToggle(pref.key)}
                  trackColor={{ false: "#0f3a2e", true: "#10b981" }}
                  thumbColor="#e0f0eb"
                />
              </View>
            ))}
          </View>

          {/* Save Button */}
          <Pressable
            onPress={handleSave}
            disabled={!hasChanges || saveMutation.isPending}
            className="mt-6 items-center rounded-2xl bg-[#10b981] py-4"
            style={{
              opacity: !hasChanges || saveMutation.isPending ? 0.5 : 1,
            }}
          >
            {saveMutation.isPending ? (
              <ActivityIndicator color="#e0f0eb" size="small" />
            ) : (
              <Text className="text-base font-bold text-[#e0f0eb]">
                {hasChanges ? "Save Changes" : "No Changes"}
              </Text>
            )}
          </Pressable>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}
