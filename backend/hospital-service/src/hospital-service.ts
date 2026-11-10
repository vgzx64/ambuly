export type HospitalStatus =
  | 'HOSPITAL_ACCEPTED'
  | 'HOSPITAL_REJECTED'
  | 'ARRIVED_AT_HOSPITAL'
  | 'HANDED_OVER';

export interface HospitalDecision {
  emergencyId: string;
  status: HospitalStatus;
  organization: 'Org2MSP';
  timestamp: string;
}

export function acceptEmergency(emergencyId: string): HospitalDecision {
  return {
    emergencyId,
    status: 'HOSPITAL_ACCEPTED',
    organization: 'Org2MSP',
    timestamp: new Date().toISOString()
  };
}

export function rejectEmergency(emergencyId: string): HospitalDecision {
  return {
    emergencyId,
    status: 'HOSPITAL_REJECTED',
    organization: 'Org2MSP',
    timestamp: new Date().toISOString()
  };
}

export function confirmArrival(emergencyId: string): HospitalDecision {
  return {
    emergencyId,
    status: 'ARRIVED_AT_HOSPITAL',
    organization: 'Org2MSP',
    timestamp: new Date().toISOString()
  };
}

export function confirmHandover(emergencyId: string): HospitalDecision {
  return {
    emergencyId,
    status: 'HANDED_OVER',
    organization: 'Org2MSP',
    timestamp: new Date().toISOString()
  };
}
