import express from 'express';

import {
  createEmergencyCase,
  dispatchAmbulance,
  updateTransportState,
  type EmergencyCase
} from './emergency-service.js';

const app = express();
const port = Number(process.env.PORT ?? 3001);
const emergencyStore = new Map<string, EmergencyCase>();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: '911-service' });
});

app.get('/api/v1/emergencies', (_req, res) => {
  res.json({
    success: true,
    data: Array.from(emergencyStore.values()),
    service: '911-service',
    organization: 'Org1MSP'
  });
});

app.post('/api/v1/emergencies', (req, res) => {
  try {
    const emergency = createEmergencyCase(req.body ?? {});
    emergencyStore.set(emergency.emergencyId, emergency);

    res.status(201).json({
      success: true,
      ...emergency,
      service: '911-service',
      organization: 'Org1MSP'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Invalid emergency payload'
    });
  }
});

app.post('/api/v1/emergencies/:id/dispatch', (req, res) => {
  const emergency = emergencyStore.get(req.params.id);

  if (!emergency) {
    return res.status(404).json({ success: false, error: 'Emergency not found' });
  }

  try {
    const updated = dispatchAmbulance(emergency, req.body?.ambulanceId ?? 'AMB-UNKNOWN');
    emergencyStore.set(updated.emergencyId, updated);
    res.json({ success: true, emergency: updated });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Dispatch failed'
    });
  }
});

app.post('/api/v1/emergencies/:id/status', (req, res) => {
  const emergency = emergencyStore.get(req.params.id);

  if (!emergency) {
    return res.status(404).json({ success: false, error: 'Emergency not found' });
  }

  try {
    const updated = updateTransportState(emergency, req.body?.status ?? emergency.status);
    emergencyStore.set(updated.emergencyId, updated);
    res.json({ success: true, emergency: updated });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Status update failed'
    });
  }
});

app.listen(port, () => {
  console.log(`911 service listening on port ${port}`);
});
