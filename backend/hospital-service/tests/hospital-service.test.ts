import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  acceptEmergency,
  confirmArrival,
  confirmHandover,
  rejectEmergency
} from '../src/hospital-service.js';

describe('hospital service', () => {
  it('accepts a case for intake', () => {
    const result = acceptEmergency('EMG-2026-000001');
    assert.equal(result.status, 'HOSPITAL_ACCEPTED');
    assert.equal(result.organization, 'Org2MSP');
  });

  it('rejects a case when capacity is unavailable', () => {
    const result = rejectEmergency('EMG-2026-000002');
    assert.equal(result.status, 'HOSPITAL_REJECTED');
  });

  it('tracks arrival and handover events', () => {
    const arrival = confirmArrival('EMG-2026-000001');
    const handover = confirmHandover('EMG-2026-000001');

    assert.equal(arrival.status, 'ARRIVED_AT_HOSPITAL');
    assert.equal(handover.status, 'HANDED_OVER');
  });
});
