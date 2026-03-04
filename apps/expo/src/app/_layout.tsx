import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClientProvider } from "@tanstack/react-query";

import { AuthGuard } from "~/components/AuthGuard";
import { DotBackground } from "~/components/DotBackground";
import { queryClient } from "~/utils/api";
import { authClient } from "~/utils/auth";

import "../styles.css";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { data: session, isPending, error } = authClient.useSession();

  if (isPending) {
    return <DotBackground trigger={1} />;
  }

  if (error || !session) {
    if (error) {
      console.error("[Auth] Session error:", error);
    }
    return <AuthGuard />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <BottomSheetModalProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                headerStyle: {
                  backgroundColor: "#c03484",
                },
                contentStyle: {
                  backgroundColor:
                    colorScheme === "dark" ? "#09090B" : "#FFFFFF",
                },
              }}
            />
            <StatusBar />
          </BottomSheetModalProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
