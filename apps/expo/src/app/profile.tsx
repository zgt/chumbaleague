import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";

import { GradientBackground } from "~/components/GradientBackground";
import { authClient } from "~/utils/auth";

export default function ProfileScreen() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <Stack.Screen options={{ title: "Profile" }} />

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

        <View className="flex-1 items-center px-8 pt-12">
          <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-[#3D1F5C]">
            <Text className="text-3xl font-bold text-[#c03484]">
              {session?.user.name?.charAt(0)?.toUpperCase() ?? "?"}
            </Text>
          </View>
          <Text className="mb-1 text-xl font-bold text-[#E8E0F0]">
            {session?.user.name ?? "Unknown"}
          </Text>
          <Text className="mb-8 text-sm text-[#9B8AB8]">
            {session?.user.email ?? ""}
          </Text>

          <Pressable
            onPress={() => authClient.signOut()}
            className="rounded-xl bg-[#3D1F5C] px-6 py-3 active:bg-[#4D2F6C]"
            accessibilityLabel="Sign out"
            accessibilityRole="button"
          >
            <Text className="font-semibold text-[#E8E0F0]">Sign Out</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}
