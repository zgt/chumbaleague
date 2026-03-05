import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react-native";

import { GradientBackground } from "~/components/GradientBackground";
import { trpc } from "~/utils/api";

const THEME_TEMPLATES = [
  {
    name: "Guilty Pleasures",
    description: "Songs you love but are embarrassed to admit",
    category: "Classic",
  },
  {
    name: "One-Hit Wonders",
    description: "Artists known for just one big hit",
    category: "Classic",
  },
  {
    name: "Covers",
    description: "Cover versions of songs",
    category: "Classic",
  },
  {
    name: "Duets",
    description: "Songs featuring two or more artists",
    category: "Classic",
  },
  { name: "Jazz", description: "Jazz tracks of any era", category: "Genre" },
  { name: "Hip-Hop", description: "Hip-hop and rap tracks", category: "Genre" },
  { name: "Country", description: "Country music", category: "Genre" },
  {
    name: "Electronic",
    description: "Electronic, EDM, or synth-based music",
    category: "Genre",
  },
  {
    name: "Punk",
    description: "Punk rock and its subgenres",
    category: "Genre",
  },
  {
    name: "Songs from the 80s",
    description: "Released between 1980-1989",
    category: "Era",
  },
  {
    name: "Songs from the 2000s",
    description: "Released between 2000-2009",
    category: "Era",
  },
  {
    name: "Songs from the Year You Were Born",
    description: "Released the year you were born",
    category: "Era",
  },
  {
    name: "Songs That Make You Cry",
    description: "Emotionally devastating tracks",
    category: "Mood",
  },
  {
    name: "Road Trip Anthems",
    description: "Perfect for driving with the windows down",
    category: "Mood",
  },
  {
    name: "Late Night Vibes",
    description: "Music for the late hours",
    category: "Mood",
  },
  {
    name: "Workout Bangers",
    description: "High energy tracks to get you moving",
    category: "Mood",
  },
  {
    name: "Songs Under 3 Minutes",
    description: "Short and sweet - under 3 minutes",
    category: "Challenge",
  },
  {
    name: "Songs with a Color in the Title",
    description: "The title must contain a color",
    category: "Challenge",
  },
  {
    name: "One-Word Song Titles",
    description: "The title is a single word",
    category: "Challenge",
  },
  {
    name: "Instrumentals Only",
    description: "No vocals allowed",
    category: "Challenge",
  },
  {
    name: "Foreign Language Songs",
    description: "Sung in a language other than English",
    category: "Challenge",
  },
  {
    name: "Your Most Played Song",
    description: "Your current most-listened track",
    category: "Personal",
  },
  {
    name: "A Song That Changed Your Life",
    description: "A track that had a profound impact on you",
    category: "Personal",
  },
  {
    name: "Your Guilty Pleasure",
    description: "The song you secretly love",
    category: "Personal",
  },
  {
    name: "A Song That Reminds You of Someone",
    description: "A track tied to a specific person",
    category: "Personal",
  },
] as const;

const CATEGORIES = [
  "Classic",
  "Genre",
  "Era",
  "Mood",
  "Challenge",
  "Personal",
] as const;

export default function CreateRound() {
  const { leagueId } = useLocalSearchParams<{ leagueId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [themeName, setThemeName] = useState("");
  const [themeDescription, setThemeDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const createMutation = useMutation(
    trpc.musicLeague.createRound.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.musicLeague.getLeagueById.queryFilter(),
        );
        router.back();
      },
      onError: (error) => {
        Alert.alert("Failed to create round", error.message);
      },
    }),
  );

  const handleCreate = () => {
    if (!themeName.trim()) {
      Alert.alert("Theme required", "Please enter a theme name.");
      return;
    }
    createMutation.mutate({
      leagueId,
      themeName: themeName.trim(),
      themeDescription: themeDescription.trim() || undefined,
    });
  };

  const handleSelectTemplate = (template: (typeof THEME_TEMPLATES)[number]) => {
    setThemeName(template.name);
    setThemeDescription(template.description);
  };

  const filteredTemplates = selectedCategory
    ? THEME_TEMPLATES.filter((t) => t.category === selectedCategory)
    : THEME_TEMPLATES;

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <Stack.Screen options={{ headerShown: false }} />

        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4">
          <Pressable
            onPress={() => router.back()}
            className="rounded-full bg-[#0f3a2e] p-2"
          >
            <ArrowLeft color="#e0f0eb" size={24} />
          </Pressable>
          <Text className="text-xl font-bold text-[#e0f0eb]">Create Round</Text>
          <View className="w-10" />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 64 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Theme Name */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-[#6b9b8a]">
              Theme Name *
            </Text>
            <TextInput
              value={themeName}
              onChangeText={setThemeName}
              placeholder="e.g. Guilty Pleasures"
              placeholderTextColor="#6b9b8a"
              maxLength={200}
              className="rounded-2xl border border-[#0f3a2e] bg-[#071f1a] px-4 text-[#e0f0eb]"
              style={{
                fontSize: 16,
                height: 48,
                textAlignVertical: "center",
              }}
            />
          </View>

          {/* Theme Description */}
          <View className="mb-6">
            <Text className="mb-2 text-sm font-medium text-[#6b9b8a]">
              Description
            </Text>
            <TextInput
              value={themeDescription}
              onChangeText={setThemeDescription}
              placeholder="Describe the theme..."
              placeholderTextColor="#6b9b8a"
              maxLength={500}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="rounded-2xl border border-[#0f3a2e] bg-[#071f1a] px-4 text-[#e0f0eb]"
              style={{
                fontSize: 16,
                minHeight: 80,
                paddingVertical: 12,
                textAlignVertical: "top",
              }}
            />
          </View>

          {/* Theme Templates */}
          <Text className="mb-3 text-lg font-bold text-[#e0f0eb]">
            Theme Ideas
          </Text>

          {/* Category Filter */}
          <View className="mb-4 flex-row flex-wrap gap-2">
            <Pressable
              onPress={() => setSelectedCategory(null)}
              className={`rounded-full px-3 py-1.5 ${
                selectedCategory === null
                  ? "border border-[#10b981] bg-[#10b981]/20"
                  : "border border-[#0f3a2e] bg-[#071f1a]"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  selectedCategory === null
                    ? "text-[#10b981]"
                    : "text-[#6b9b8a]"
                }`}
              >
                All
              </Text>
            </Pressable>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                onPress={() =>
                  setSelectedCategory(cat === selectedCategory ? null : cat)
                }
                className={`rounded-full px-3 py-1.5 ${
                  selectedCategory === cat
                    ? "border border-[#10b981] bg-[#10b981]/20"
                    : "border border-[#0f3a2e] bg-[#071f1a]"
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    selectedCategory === cat
                      ? "text-[#10b981]"
                      : "text-[#6b9b8a]"
                  }`}
                >
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Template List */}
          <View className="mb-6 gap-2">
            {filteredTemplates.map((template) => {
              const isSelected = themeName === template.name;
              return (
                <Pressable
                  key={template.name}
                  onPress={() => handleSelectTemplate(template)}
                  style={{
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: isSelected
                      ? "rgba(16, 185, 129, 0.5)"
                      : "#0f3a2e",
                    backgroundColor: isSelected
                      ? "rgba(16, 185, 129, 0.15)"
                      : "#071f1a",
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "600",
                      color: isSelected ? "#10b981" : "#e0f0eb",
                      marginBottom: 2,
                    }}
                  >
                    {template.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#6b9b8a",
                    }}
                  >
                    {template.description}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Create Button */}
          <Pressable
            onPress={handleCreate}
            disabled={createMutation.isPending || !themeName.trim()}
            style={{
              alignItems: "center",
              borderRadius: 12,
              backgroundColor: "#10b981",
              paddingVertical: 16,
              opacity: createMutation.isPending || !themeName.trim() ? 0.5 : 1,
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
                Create Round
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}
