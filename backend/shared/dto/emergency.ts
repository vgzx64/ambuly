export interface CreateEmergencyRequest {
  emergencyId: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  incidentType: string;
  hospitalId: string;
  locationRef?: string;
  createdBy?: string;
}
