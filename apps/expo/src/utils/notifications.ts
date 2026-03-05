import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";

// ─── Types ───────────────────────────────────────────────────────────

export interface LeagueNotificationData {
  type: "league";
  leagueId?: string;
  roundId?: string;
}

export type NotificationData = LeagueNotificationData;

// ─── Configuration ───────────────────────────────────────────────────

/** Configure how notifications are displayed when the app is foregrounded */
export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: () =>
      Promise.resolve({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
  });
}

// ─── Permissions ─────────────────────────────────────────────────────

export async function requestPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === Notifications.PermissionStatus.GRANTED) return true;

  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });

  return status === Notifications.PermissionStatus.GRANTED;
}

// ─── Push Token ──────────────────────────────────────────────────────

export async function getExpoPushToken(): Promise<string | null> {
  try {
    const expoEasConfig = Constants.expoConfig?.extra?.eas as
      | { projectId?: string }
      | undefined;
    const easConfig = Constants.easConfig as { projectId?: string } | undefined;
    const projectId = expoEasConfig?.projectId ?? easConfig?.projectId;

    if (!projectId) {
      console.warn("[Notifications] No EAS project ID found");
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token.data;
  } catch (error) {
    console.error("[Notifications] Failed to get push token:", error);
    return null;
  }
}

// ─── Platform ────────────────────────────────────────────────────────

export function getPlatform(): "ios" | "android" {
  return Platform.OS === "ios" ? "ios" : "android";
}
