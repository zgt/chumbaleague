import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";

import { GradientBackground } from "~/components/GradientBackground";

export default function BlockedUsersScreen() {
  const router = useRouter();

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <Stack.Screen options={{ title: "Blocked Users" }} />

        <View className="flex-row items-center px-4 py-3">
          <Pressable
            onPress={() => router.back()}
            className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#1A0E2E]"
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <ChevronLeft size={20} color="#E8E0F0" />
          </Pressable>
          <Text className="text-2xl font-bold text-[#E8E0F0]">
            Blocked Users
          </Text>
        </View>

        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-[#9B8AB8]">
            No blocked users
          </Text>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}
