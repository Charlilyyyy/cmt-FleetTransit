import type { NotificationChannel } from '@cmt/shared';

export interface NotificationMessage {
  title: string;
  body: string;
}

export interface DeliveryTarget {
  channel: NotificationChannel;
  /** FCM token, LINE user id, or Telegram chat id depending on channel. */
  address: string;
}

export interface DeliveryResult {
  ok: boolean;
  channel: NotificationChannel;
  providerMessageId?: string;
  error?: string;
}

export interface ChannelProvider {
  readonly channel: NotificationChannel;
  send(address: string, message: NotificationMessage): Promise<DeliveryResult>;
}

export interface ProviderCredentials {
  telegramBotToken?: string;
  lineChannelAccessToken?: string;
  fcmServerKey?: string;
  fetchImpl?: typeof fetch;
}
