import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { detectThreat, type ThreatAlert } from '../detection/threat-detection.js';

describe('threat detection', () => {
  it('accepts a valid security alert', () => {
    const alert: ThreatAlert = {
      code: 'DET-01 Unauthorized Operation',
      severity: 'HIGH',
      message: 'A hospital user attempted to create an emergency case.',
      emergencyId: 'EMG-2026-000001'
    };

    assert.equal(detectThreat(alert), true);
  });

  it('rejects an incomplete alert payload', () => {
    const alert = {
      code: 'DET-04 Duplicate Event',
      severity: 'MEDIUM',
      emergencyId: 'EMG-2026-000001'
    } as ThreatAlert;

    assert.equal(detectThreat(alert), false);
  });

  it('detects repeated transaction failures', () => {
    const alert: ThreatAlert = {
      code: 'DET-02 Repeated Transaction Failures',
      severity: 'MEDIUM',
      message: 'Three failed Fabric calls in the last five minutes.'
    };

    assert.equal(detectThreat(alert), true);
  });
});
