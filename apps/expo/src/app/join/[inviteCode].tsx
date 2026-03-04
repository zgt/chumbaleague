import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams } from "expo-router";

import { GradientBackground } from "~/components/GradientBackground";

export default function JoinLeagueScreen() {
  const { inviteCode } = useLocalSearchParams<{ inviteCode: string }>();

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <Stack.Screen options={{ title: "Join League" }} />
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-2xl font-bold text-[#E8E0F0]">
            Join League
          </Text>
          <Text className="mt-2 text-center text-[#9B8AB8]">
            Invite Code: {inviteCode}
          </Text>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}
