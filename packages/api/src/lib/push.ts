import Expo from "expo-server-sdk";

import { inArray } from "@acme/db";
import { db } from "@acme/db/client";
import { PushToken } from "@acme/db/schema";

const expo = new Expo();

interface PushMessage {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: "default" | null;
}

export async function sendPushToUsers(
  userIds: string[],
  message: PushMessage,
): Promise<void> {
  if (userIds.length === 0) return;

  try {
    const tokens = await db.query.PushToken.findMany({
      where: inArray(PushToken.userId, userIds),
    });

    if (tokens.length === 0) return;

    const messages = tokens
      .filter((t) => Expo.isExpoPushToken(t.token))
      .map((t) => ({
        to: t.token,
        title: message.title,
        body: message.body,
        data: message.data,
        sound: (message.sound ?? "default") as "default",
      }));

    if (messages.length === 0) return;

    const chunks = expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      try {
        const tickets = await expo.sendPushNotificationsAsync(chunk);

        for (const ticket of tickets) {
          if (ticket.status === "error") {
            console.error(
              `[Push] Error sending notification:`,
              ticket.message,
              ticket.details,
            );
          }
        }
      } catch (error) {
        console.error("[Push] Failed to send chunk:", error);
      }
    }
  } catch (error) {
    console.error("[Push] Failed to send push notifications:", error);
  }
}

export async function sendPushToUser(
  userId: string,
  message: PushMessage,
): Promise<void> {
  return sendPushToUsers([userId], message);
}
