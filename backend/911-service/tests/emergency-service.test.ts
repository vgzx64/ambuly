import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  createEmergencyCase,
  dispatchAmbulance,
  updateTransportState,
  validateEmergencyRequest
} from '../src/emergency-service.js';

describe('911 emergency service', () => {
  it('validates a complete emergency request', () => {
    const result = validateEmergencyRequest({
      emergencyId: 'EMG-2026-000001',
      priority: 'HIGH',
      incidentType: 'TRAFFIC_ACCIDENT',
      hospitalId: 'HOSPITAL-001',
      locationRef: 'LOC-001',
      createdBy: 'dispatcher-01'
    });

    assert.equal(result.ok, true);
  });

  it('rejects an invalid emergency request', () => {
    const result = validateEmergencyRequest({
      emergencyId: '',
      priority: 'CRITICAL',
      incidentType: '',
      hospitalId: ''
    });

    assert.equal(result.ok, false);
    assert.ok(result.error);
  });

  it('creates a case with a valid status', () => {
    const emergency = createEmergencyCase({
      emergencyId: 'EMG-2026-000002',
      priority: 'MEDIUM',
      incidentType: 'MEDICAL_ASSISTANCE',
      hospitalId: 'HOSPITAL-002',
      locationRef: 'LOC-002',
      createdBy: 'dispatcher-02'
    });

    assert.equal(emergency.status, 'CREATED');
    assert.equal(emergency.organization, 'Org1MSP');
  });

  it('dispatches an ambulance and updates transport status', () => {
    const emergency = createEmergencyCase({
      emergencyId: 'EMG-2026-000003',
      priority: 'HIGH',
      incidentType: 'FALL',
      hospitalId: 'HOSPITAL-003',
      locationRef: 'LOC-003',
      createdBy: 'dispatcher-03'
    });

    const withAmbulance = dispatchAmbulance(emergency, 'AMB-204');
    const enRoute = updateTransportState(withAmbulance, 'EN_ROUTE_TO_SCENE');

    assert.equal(withAmbulance.ambulanceId, 'AMB-204');
    assert.equal(enRoute.status, 'EN_ROUTE_TO_SCENE');
  });
});
