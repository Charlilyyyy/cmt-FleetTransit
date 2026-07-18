import { FcmProvider } from './fcm';
import { LineProvider } from './line';
import { renderTemplate, type NotificationEvent, type TemplateContext } from './templates';
import { TelegramProvider } from './telegram';
import type {
  ChannelProvider,
  DeliveryResult,
  DeliveryTarget,
  ProviderCredentials,
} from './types';

/**
 * Fans a rendered event out to a guardian's registered channels using
 * per-organization credentials. Missing credentials skip that channel.
 */
export class NotificationService {
  private providers: Partial<Record<string, ChannelProvider>> = {};

  constructor(credentials: ProviderCredentials) {
    const doFetch = credentials.fetchImpl ?? fetch;
    if (credentials.telegramBotToken) {
      this.providers.telegram = new TelegramProvider(credentials.telegramBotToken, doFetch);
    }
    if (credentials.lineChannelAccessToken) {
      this.providers.line = new LineProvider(credentials.lineChannelAccessToken, doFetch);
    }
    if (credentials.fcmServerKey) {
      this.providers.fcm = new FcmProvider(credentials.fcmServerKey, doFetch);
    }
  }

  async notify(
    event: NotificationEvent,
    ctx: TemplateContext,
    targets: DeliveryTarget[]
  ): Promise<DeliveryResult[]> {
    const message = renderTemplate(event, ctx);
    const results: DeliveryResult[] = [];
    for (const target of targets) {
      const provider = this.providers[target.channel];
      if (!provider) {
        results.push({ ok: false, channel: target.channel, error: 'Channel not configured' });
        continue;
      }
      results.push(await provider.send(target.address, message));
    }
    return results;
  }
}
