import { EVENT_TYPES } from '../constants/events-types.js';

export interface TraceForgeEvent {
  eventId: string;
  projectKey: string;
  eventType: string;
  timestamp: string;

  sdkVersion: string;
  platform: 'web';

  context: {
    url: string;
    path: string;
    title?: string;
    referrer?: string;
  };

  payload: Record<string, unknown>;
}

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];
