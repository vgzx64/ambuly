export type EmergencyPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type EmergencyTransitionStatus =
  | 'CREATED'
  | 'HOSPITAL_NOTIFIED'
  | 'HOSPITAL_ACCEPTED'
  | 'HOSPITAL_REJECTED'
  | 'AMBULANCE_DISPATCHED'
  | 'EN_ROUTE_TO_SCENE'
  | 'AT_SCENE'
  | 'EN_ROUTE_TO_HOSPITAL'
  | 'ARRIVED_AT_HOSPITAL'
  | 'HANDED_OVER'
  | 'COMPLETED'
  | 'CANCELLED';

export interface EmergencyValidationInput {
  emergencyId?: string;
  priority?: string;
  incidentType?: string;
  hospitalId?: string;
  locationRef?: string;
  createdBy?: string;
}

export type ValidationResult =
  | { ok: true }
  | { ok: false; error: string };

const legalPriorities: EmergencyPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export function validateEmergencyRequest(input: EmergencyValidationInput): ValidationResult {
  const errors: string[] = [];

  if (!input.emergencyId || !input.emergencyId.trim()) {
    errors.push('emergencyId is required');
  }

  if (!input.priority || !legalPriorities.includes(input.priority as EmergencyPriority)) {
    errors.push('priority must be one of LOW, MEDIUM, HIGH, CRITICAL');
  }

  if (!input.incidentType || !input.incidentType.trim()) {
    errors.push('incidentType is required');
  }

  if (!input.hospitalId || !input.hospitalId.trim()) {
    errors.push('hospitalId is required');
  }

  if (input.locationRef !== undefined && !input.locationRef.trim()) {
    errors.push('locationRef cannot be empty when provided');
  }

  if (errors.length > 0) {
    return { ok: false, error: errors.join('; ') };
  }

  return { ok: true };
}

export function isValidTransition(current: string, next: string): boolean {
  const validNext: Record<string, string[]> = {
    CREATED: ['HOSPITAL_NOTIFIED', 'AMBULANCE_DISPATCHED', 'CANCELLED'],
    HOSPITAL_NOTIFIED: ['HOSPITAL_ACCEPTED', 'HOSPITAL_REJECTED', 'CANCELLED'],
    HOSPITAL_ACCEPTED: ['AMBULANCE_DISPATCHED', 'CANCELLED'],
    HOSPITAL_REJECTED: ['CANCELLED'],
    AMBULANCE_DISPATCHED: ['EN_ROUTE_TO_SCENE', 'CANCELLED'],
    EN_ROUTE_TO_SCENE: ['AT_SCENE', 'CANCELLED'],
    AT_SCENE: ['EN_ROUTE_TO_HOSPITAL', 'CANCELLED'],
    EN_ROUTE_TO_HOSPITAL: ['ARRIVED_AT_HOSPITAL', 'CANCELLED'],
    ARRIVED_AT_HOSPITAL: ['HANDED_OVER', 'CANCELLED'],
    HANDED_OVER: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: []
  };

  return validNext[current]?.includes(next) ?? false;
}
