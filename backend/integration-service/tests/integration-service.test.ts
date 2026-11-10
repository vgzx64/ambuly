import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { getEventStatus, markDelivered, queueEvent } from '../src/integration-service.js';

describe('integration service', () => {
  it('queues a new event', () => {
    const result = queueEvent({
      eventId: 'EVT-1001',
      emergencyId: 'EMG-2026-000001',
      eventType: 'HospitalAccepted',
      sourceOrg: 'Org2MSP',
      targetOrg: 'Org1MSP',
      payload: { acceptanceStatus: 'ACCEPTED' },
      receivedAt: new Date().toISOString()
    });

    assert.equal(result.success, true);
    assert.equal(result.status, 'queued');
  });

  it('detects duplicate event IDs', () => {
    const first = queueEvent({
      eventId: 'EVT-1002',
      emergencyId: 'EMG-2026-000002',
      eventType: 'DispatchRequested',
      sourceOrg: 'Org1MSP',
      targetOrg: 'Org2MSP',
      payload: { priority: 'HIGH' },
      receivedAt: new Date().toISOString()
    });

    const second = queueEvent({
      eventId: 'EVT-1002',
      emergencyId: 'EMG-2026-000002',
      eventType: 'DispatchRequested',
      sourceOrg: 'Org1MSP',
      targetOrg: 'Org2MSP',
      payload: { priority: 'HIGH' },
      receivedAt: new Date().toISOString()
    });

    assert.equal(first.success, true);
    assert.equal(second.duplicate, true);
  });

  it('marks a queued event as delivered', () => {
    const queued = queueEvent({
      eventId: 'EVT-1003',
      emergencyId: 'EMG-2026-000003',
      eventType: 'PatientHandover',
      sourceOrg: 'Org2MSP',
      targetOrg: 'Org1MSP',
      payload: { status: 'HANDED_OVER' },
      receivedAt: new Date().toISOString()
    });

    assert.equal(queued.success, true);
    assert.equal(markDelivered('EVT-1003'), true);
    assert.equal(getEventStatus('EVT-1003')?.status, 'delivered');
  });
});
