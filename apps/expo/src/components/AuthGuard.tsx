import { Text as RNText, View } from "react-native";

import { GradientBackground } from "./GradientBackground";
import { SignInButtons } from "./SignInButton";

export function AuthGuard() {
  return (
    <GradientBackground>
      <View className="flex-1 items-center justify-center px-8">
        {/* Branding */}
        <View className="mb-8 items-center">
          <RNText className="mb-2 text-5xl font-bold text-[#e0f0eb]">
            Chumba<RNText className="text-[#10b981]">league</RNText>
          </RNText>
          <View className="h-1 w-20 rounded-full bg-[#10b981]" />
        </View>

        <View className="mb-12 items-center rounded-full border border-[#0f3a2e] bg-[#071f1a] px-6 py-3">
          <RNText className="mb-3 text-center text-2xl font-semibold text-[#e0f0eb]">
            Welcome!
          </RNText>
          <RNText className="text-center text-base leading-relaxed text-[#6b9b8a]">
            Sign in to join leagues, submit songs, and compete with friends.
          </RNText>
        </View>

        {/* Sign-In Buttons */}
        <View className="absolute bottom-18">
          <SignInButtons size="large" />
        </View>
        <View className="absolute bottom-12">
          <RNText className="text-center text-xs text-white">
            Sign in with Discord to get started
          </RNText>
        </View>
      </View>
    </GradientBackground>
  );
}
