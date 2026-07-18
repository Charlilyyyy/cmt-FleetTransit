import type { NotificationMessage } from './types';

export type NotificationEvent = 'pickup' | 'dropoff' | 'delay' | 'emergency';

export interface TemplateContext {
  passengerName: string;
  organizationName?: string;
  time?: string;
  minutesLate?: number;
  detail?: string;
}

/** Renders a guardian-facing message for a given event. */
export function renderTemplate(event: NotificationEvent, ctx: TemplateContext): NotificationMessage {
  const time = ctx.time ?? new Date().toLocaleTimeString();
  switch (event) {
    case 'pickup':
      return {
        title: 'Picked up',
        body: `${ctx.passengerName} was picked up at ${time}.`,
      };
    case 'dropoff':
      return {
        title: 'Dropped off',
        body: `${ctx.passengerName} was dropped off safely at ${time}.`,
      };
    case 'delay':
      return {
        title: 'Running late',
        body: `${ctx.passengerName}'s trip is delayed by about ${ctx.minutesLate ?? 'a few'} minutes.`,
      };
    case 'emergency':
      return {
        title: 'Emergency alert',
        body: `Urgent: ${ctx.detail ?? 'Please contact the transport office regarding ' + ctx.passengerName}.`,
      };
    default:
      return { title: 'Update', body: `Update for ${ctx.passengerName}.` };
  }
}
