import type { ChannelProvider, DeliveryResult, NotificationMessage } from './types';

/** Firebase Cloud Messaging legacy HTTP provider (server key). */
export class FcmProvider implements ChannelProvider {
  readonly channel = 'fcm' as const;

  constructor(
    private readonly serverKey: string,
    private readonly fetchImpl: typeof fetch = fetch
  ) {}

  async send(token: string, message: NotificationMessage): Promise<DeliveryResult> {
    try {
      const res = await this.fetchImpl('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `key=${this.serverKey}`,
        },
        body: JSON.stringify({
          to: token,
          notification: { title: message.title, body: message.body },
        }),
      });
      const json = (await res.json()) as { success?: number; results?: { message_id?: string }[] };
      if (!json.success) return { ok: false, channel: this.channel, error: 'FCM delivery failed' };
      return { ok: true, channel: this.channel, providerMessageId: json.results?.[0]?.message_id };
    } catch (error) {
      return { ok: false, channel: this.channel, error: error instanceof Error ? error.message : 'FCM failure' };
    }
  }
}
