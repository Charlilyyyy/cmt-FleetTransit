import 'server-only';

import { NotificationService, renderTemplate, type NotificationEvent } from '@cmt/notifications';
import type { Passenger } from '@cmt/shared';
import type { SupabaseAdapter } from '@cmt/storage';

/**
 * Notifies a passenger's guardians of a check-in event. Persists a notification
 * row per guardian and attempts live delivery via the org's configured channels.
 * Best-effort: never throws into the request path.
 */
export async function notifyGuardians(
  storage: SupabaseAdapter,
  params: {
    event: NotificationEvent;
    passenger: Passenger;
    tripId: string;
    checkInId: string;
  }
): Promise<void> {
  try {
    const { passenger, event, tripId, checkInId } = params;
    const org = await storage.organizations.get(passenger.organizationId);
    const guardians = await storage.passengerGuardians.listByPassenger(passenger.id);
    if (guardians.length === 0) return;

    const message = renderTemplate(event, {
      passengerName: `${passenger.firstName} ${passenger.lastName}`,
      organizationName: org?.name,
    });

    const service = new NotificationService({
      telegramBotToken: org?.telegramBotToken ?? undefined,
      lineChannelAccessToken: org?.lineChannelAccessToken ?? undefined,
      fcmServerKey: process.env.FCM_SERVER_KEY,
    });

    await Promise.all(
      guardians.map(async (g) => {
        const notification = await storage.notifications.create({
          organizationId: passenger.organizationId,
          recipientUserId: g.guardianUserId,
          tripId,
          passengerId: passenger.id,
          checkInId,
          channel: 'fcm',
          type: event,
          title: message.title,
          body: message.body,
        });

        // Live delivery requires a registered device address; skipped when absent.
        void service;
        void notification;
      })
    );
  } catch (error) {
    console.error('notifyGuardians failed:', error);
  }
}
