export type ThreatType =
  | 'DET-01 Unauthorized Operation'
  | 'DET-02 Repeated Transaction Failures'
  | 'DET-03 Cross-Organization State Mismatch'
  | 'DET-04 Duplicate Event'
  | 'DET-05 Delayed Integration Event';

export interface ThreatAlert {
  code: ThreatType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  message: string;
  emergencyId?: string;
}

const allowedThreatCodes = new Set<ThreatType>([
  'DET-01 Unauthorized Operation',
  'DET-02 Repeated Transaction Failures',
  'DET-03 Cross-Organization State Mismatch',
  'DET-04 Duplicate Event',
  'DET-05 Delayed Integration Event'
]);

const allowedSeverities = new Set(['LOW', 'MEDIUM', 'HIGH']);

export function detectThreat(alert: ThreatAlert): boolean {
  if (!alert || typeof alert !== 'object') {
    return false;
  }

  if (!alert.code || !allowedThreatCodes.has(alert.code)) {
    return false;
  }

  if (!alert.message || !alert.message.trim()) {
    return false;
  }

  if (!alert.severity || !allowedSeverities.has(alert.severity)) {
    return false;
  }

  return true;
}
