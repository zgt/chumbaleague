import { StyleSheet, View } from "react-native";

import { DotBackground } from "./DotBackground";

export function GradientBackground({
  children,
  rippleTrigger,
}: {
  children: React.ReactNode;
  rippleTrigger?: number;
}) {
  return (
    <View style={styles.container}>
      <View
        style={[StyleSheet.absoluteFill, styles.baseGradient]}
        pointerEvents="none"
      />

      <DotBackground trigger={rippleTrigger} />

      <View
        style={[StyleSheet.absoluteFill, styles.auroraTop]}
        pointerEvents="none"
      />
      <View
        style={[StyleSheet.absoluteFill, styles.auroraBottom]}
        pointerEvents="none"
      />

      <View style={{ flex: 1, zIndex: 1 }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020a0a",
  },
  baseGradient: {
    backgroundColor: "#071414",
  },
  auroraTop: {
    backgroundColor: "rgba(16, 185, 129, 0.06)",
    opacity: 0.6,
  },
  auroraBottom: {
    backgroundColor: "rgba(16, 185, 129, 0.04)",
    opacity: 0.4,
  },
});
