export type EmergencyStatus =
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

export interface EmergencyCase {
  emergencyId: string;
  status: EmergencyStatus;
  priority: string;
  incidentType: string;
  ambulanceId?: string;
  hospitalId?: string;
  schemaVersion: string;
  createdAt: string;
  updatedAt: string;
}
