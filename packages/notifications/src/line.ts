import type { ChannelProvider, DeliveryResult, NotificationMessage } from './types';

export class LineProvider implements ChannelProvider {
  readonly channel = 'line' as const;

  constructor(
    private readonly channelAccessToken: string,
    private readonly fetchImpl: typeof fetch = fetch
  ) {}

  async send(lineUserId: string, message: NotificationMessage): Promise<DeliveryResult> {
    try {
      const res = await this.fetchImpl('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.channelAccessToken}`,
        },
        body: JSON.stringify({
          to: lineUserId,
          messages: [{ type: 'text', text: `${message.title}\n${message.body}` }],
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        return { ok: false, channel: this.channel, error: `LINE ${res.status} ${text}` };
      }
      return { ok: true, channel: this.channel };
    } catch (error) {
      return { ok: false, channel: this.channel, error: error instanceof Error ? error.message : 'LINE failure' };
    }
  }
}
