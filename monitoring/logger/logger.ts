export interface LogRecord {
  timestamp: string;
  emergencyId?: string;
  eventId?: string;
  txId?: string;
  orgMSP?: string;
  eventType?: string;
  severity?: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  component: string;
  message: string;
}

export function writeLog(record: LogRecord): void {
  console.log(JSON.stringify(record));
}
