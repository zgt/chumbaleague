import { useEffect, useRef } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";

import type { NotificationData } from "~/utils/notifications";
import { vanillaTrpc } from "~/utils/api";
import {
  configureNotificationHandler,
  getExpoPushToken,
  getPlatform,
  requestPermissions,
} from "~/utils/notifications";

/**
 * Register push token with the server.
 * Called on every app start to ensure the token is up-to-date (upsert).
 */
async function registerPushToken() {
  if (!Device.isDevice) {
    console.log("[Notifications] Push notifications require a physical device");
    return;
  }

  const granted = await requestPermissions();
  if (!granted) return;

  const token = await getExpoPushToken();
  if (!token) return;

  try {
    await vanillaTrpc.notification.registerPushToken.mutate({
      token,
      platform: getPlatform(),
    });
    console.log("[Notifications] Push token registered");
  } catch (error) {
    console.error("[Notifications] Failed to register push token:", error);
  }
}

/**
 * Hook to set up push notification handling at the app root level.
 * - Configures the foreground handler
 * - Requests permissions and registers push token
 * - Handles notification taps (deep linking to leagues/rounds)
 */
export function useNotifications() {
  const router = useRouter();
  const responseListener = useRef<Notifications.EventSubscription | undefined>(
    undefined,
  );
  const notificationListener = useRef<
    Notifications.EventSubscription | undefined
  >(undefined);

  useEffect(() => {
    configureNotificationHandler();

    // Register push token on mount
    void registerPushToken();

    // Handle notification received while app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log(
          "[Notifications] Received in foreground:",
          notification.request.content.title,
        );
      });

    // Handle user tapping a notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data as unknown as
          | NotificationData
          | undefined;
        const actionIdentifier = response.actionIdentifier;

        if (actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
          if (data?.type === "league" && data.roundId) {
            router.push(`/round/${data.roundId}` as never);
          } else if (data?.type === "league" && data.leagueId) {
            router.push(`/league/${data.leagueId}` as never);
          }
        }
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [router]);
}
