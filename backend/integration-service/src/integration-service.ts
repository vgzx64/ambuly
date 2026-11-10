export interface IntegrationEvent {
  eventId: string;
  emergencyId: string;
  eventType: string;
  sourceOrg: 'Org1MSP' | 'Org2MSP';
  targetOrg: 'Org1MSP' | 'Org2MSP';
  payload: Record<string, unknown>;
  receivedAt: string;
}

export interface DeliveryResult {
  success: boolean;
  duplicate: boolean;
  status: 'queued' | 'delivered' | 'duplicate';
  eventId: string;
}

const eventStore = new Map<string, IntegrationEvent>();

export function queueEvent(event: IntegrationEvent): DeliveryResult {
  if (eventStore.has(event.eventId)) {
    return {
      success: false,
      duplicate: true,
      status: 'duplicate',
      eventId: event.eventId
    };
  }

  eventStore.set(event.eventId, event);

  return {
    success: true,
    duplicate: false,
    status: 'queued',
    eventId: event.eventId
  };
}

export function markDelivered(eventId: string): boolean {
  const event = eventStore.get(eventId);

  if (!event) {
    return false;
  }

  eventStore.set(eventId, {
    ...event,
    receivedAt: new Date().toISOString()
  });

  return true;
}

export function getEventStatus(eventId: string): DeliveryResult | null {
  if (!eventStore.has(eventId)) {
    return null;
  }

  return {
    success: true,
    duplicate: false,
    status: 'delivered',
    eventId
  };
}
