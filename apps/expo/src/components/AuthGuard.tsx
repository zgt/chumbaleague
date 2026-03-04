import { Text as RNText, View } from "react-native";

import { GradientBackground } from "./GradientBackground";
import { SignInButtons } from "./SignInButton";

export function AuthGuard() {
  return (
    <GradientBackground>
      <View className="flex-1 items-center justify-center px-8">
        {/* Branding */}
        <View className="mb-8 items-center">
          <RNText className="mb-2 text-5xl font-bold text-[#E8E0F0]">
            Chumba<RNText className="text-[#c03484]">league</RNText>
          </RNText>
          <View className="h-1 w-20 rounded-full bg-[#c03484]" />
        </View>

        <View className="mb-12 items-center rounded-full border border-[#3D1F5C] bg-[#1A0E2E] px-6 py-3">
          <RNText className="mb-3 text-center text-2xl font-semibold text-[#E8E0F0]">
            Welcome!
          </RNText>
          <RNText className="text-center text-base leading-relaxed text-[#9B8AB8]">
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
