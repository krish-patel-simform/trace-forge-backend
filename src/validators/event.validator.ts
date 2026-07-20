import { EVENT_TYPES } from '../constants/events-types.ts';
import type { EventType, TraceForgeEvent } from '../types/events.type.ts';

type ValidationResult =
  | {
      success: true;
      data: TraceForgeEvent;
    }
  | {
      success: false;
      message: string;
    };

export function validateEvent(event: unknown): ValidationResult {
  // Check if request body exists
  if (!event) {
    return {
      success: false,
      message: 'Request body is required.',
    };
  }

  // Check if request body is an object
  if (typeof event !== 'object') {
    return {
      success: false,
      message: 'Request body must be an object.',
    };
  }

  // Now we can safely access properties
  const data = event as Partial<TraceForgeEvent>;

  if (!data.projectKey) {
    return {
      success: false,
      message: 'projectKey is required.',
    };
  }

  if (!data.timestamp) {
    return {
      success: false,
      message: 'timestamp is required.',
    };
  }

  if (!data.eventType) {
    return {
      success: false,
      message: 'eventType is required.',
    };
  }

  const validEventTypes = Object.values(EVENT_TYPES);

  if (!validEventTypes.includes(data.eventType as EventType)) {
    return {
      success: false,
      message: 'Invalid eventType.',
    };
  }

  return {
    success: true,
    data: data as TraceForgeEvent,
  };
}
