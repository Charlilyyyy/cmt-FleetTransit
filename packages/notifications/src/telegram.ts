import type { ChannelProvider, DeliveryResult, NotificationMessage } from './types';

export class TelegramProvider implements ChannelProvider {
  readonly channel = 'telegram' as const;

  constructor(
    private readonly botToken: string,
    private readonly fetchImpl: typeof fetch = fetch
  ) {}

  async send(chatId: string, message: NotificationMessage): Promise<DeliveryResult> {
    try {
      const res = await this.fetchImpl(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `*${message.title}*\n${message.body}`,
          parse_mode: 'Markdown',
        }),
      });
      const json = (await res.json()) as { ok: boolean; result?: { message_id: number }; description?: string };
      if (!json.ok) return { ok: false, channel: this.channel, error: json.description ?? 'Telegram error' };
      return { ok: true, channel: this.channel, providerMessageId: String(json.result?.message_id) };
    } catch (error) {
      return { ok: false, channel: this.channel, error: error instanceof Error ? error.message : 'Telegram failure' };
    }
  }
}
