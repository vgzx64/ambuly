import {
  isValidTransition,
  validateEmergencyRequest as validateEmergencyPayload,
  type EmergencyPriority,
  type EmergencyTransitionStatus
} from '../../shared/validation/emergency-validation.js';

export type EmergencyStatus = EmergencyTransitionStatus;

export interface EmergencyCase {
  emergencyId: string;
  status: EmergencyStatus;
  priority: EmergencyPriority;
  incidentType: string;
  hospitalId: string;
  ambulanceId?: string;
  locationRef?: string;
  organization: 'Org1MSP';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  history: Array<{
    eventType: string;
    timestamp: string;
    status: EmergencyStatus;
  }>;
}

export interface EmergencyRequest {
  emergencyId: string;
  priority: EmergencyPriority;
  incidentType: string;
  hospitalId: string;
  locationRef?: string;
  createdBy?: string;
}

export function validateEmergencyRequest(input: EmergencyRequest): { ok: true } | { ok: false; error: string } {
  return validateEmergencyPayload(input);
}

export function createEmergencyCase(request: EmergencyRequest): EmergencyCase {
  const validation = validateEmergencyRequest(request);

  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const stamp = new Date().toISOString();

  return {
    emergencyId: request.emergencyId,
    status: 'CREATED',
    priority: request.priority,
    incidentType: request.incidentType,
    hospitalId: request.hospitalId,
    locationRef: request.locationRef,
    organization: 'Org1MSP',
    createdAt: stamp,
    updatedAt: stamp,
    createdBy: request.createdBy ?? 'dispatcher-unknown',
    history: [{ eventType: 'EmergencyCreated', timestamp: stamp, status: 'CREATED' }]
  };
}

export function dispatchAmbulance(emergency: EmergencyCase, ambulanceId: string): EmergencyCase {
  if (!ambulanceId.trim()) {
    throw new Error('ambulanceId is required');
  }

  if (!isValidTransition(emergency.status, 'AMBULANCE_DISPATCHED')) {
    throw new Error(`invalid ambulance dispatch from status ${emergency.status}`);
  }

  return {
    ...emergency,
    ambulanceId,
    status: 'AMBULANCE_DISPATCHED',
    updatedAt: new Date().toISOString(),
    history: [
      ...emergency.history,
      {
        eventType: 'AmbulanceAssigned',
        timestamp: new Date().toISOString(),
        status: 'AMBULANCE_DISPATCHED'
      }
    ]
  };
}

export function updateTransportState(emergency: EmergencyCase, nextStatus: EmergencyStatus): EmergencyCase {
  if (!isValidTransition(emergency.status, nextStatus)) {
    throw new Error(`invalid transition from ${emergency.status} to ${nextStatus}`);
  }

  return {
    ...emergency,
    status: nextStatus,
    updatedAt: new Date().toISOString(),
    history: [
      ...emergency.history,
      {
        eventType: 'TransportStatusUpdated',
        timestamp: new Date().toISOString(),
        status: nextStatus
      }
    ]
  };
}
