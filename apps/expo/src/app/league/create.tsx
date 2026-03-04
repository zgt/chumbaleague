import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";

import { GradientBackground } from "~/components/GradientBackground";

export default function CreateLeagueScreen() {
  return (
    <GradientBackground>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <Stack.Screen options={{ title: "Create League" }} />
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-2xl font-bold text-[#E8E0F0]">
            Create League
          </Text>
          <Text className="mt-2 text-center text-[#9B8AB8]">
            Coming soon
          </Text>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}
