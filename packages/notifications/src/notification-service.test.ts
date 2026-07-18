import { describe, expect, it, vi } from 'vitest';

import { NotificationService } from './notification-service';
import { renderTemplate } from './templates';

describe('renderTemplate', () => {
  it('renders pickup and dropoff', () => {
    const pickup = renderTemplate('pickup', { passengerName: 'Ada', time: '08:00' });
    expect(pickup.title).toBe('Picked up');
    expect(pickup.body).toContain('Ada');

    const dropoff = renderTemplate('dropoff', { passengerName: 'Ada', time: '15:00' });
    expect(dropoff.body).toContain('safely');
  });

  it('renders delay with minutes', () => {
    const delay = renderTemplate('delay', { passengerName: 'Ada', minutesLate: 12 });
    expect(delay.body).toContain('12');
  });
});

describe('NotificationService', () => {
  it('skips channels without credentials', async () => {
    const service = new NotificationService({});
    const results = await service.notify('pickup', { passengerName: 'Ada' }, [
      { channel: 'telegram', address: '123' },
    ]);
    expect(results[0].ok).toBe(false);
    expect(results[0].error).toMatch(/not configured/);
  });

  it('delivers via Telegram when configured', async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({ ok: true, result: { message_id: 42 } }), { status: 200 })
    ) as unknown as typeof fetch;

    const service = new NotificationService({ telegramBotToken: 'token', fetchImpl });
    const results = await service.notify('dropoff', { passengerName: 'Ada' }, [
      { channel: 'telegram', address: 'chat-1' },
    ]);

    expect(results[0].ok).toBe(true);
    expect(results[0].providerMessageId).toBe('42');
    expect(fetchImpl).toHaveBeenCalledOnce();
  });
});
