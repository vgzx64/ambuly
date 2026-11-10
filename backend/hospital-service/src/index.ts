import express from 'express';

import {
  acceptEmergency,
  confirmArrival,
  confirmHandover,
  rejectEmergency
} from './hospital-service.js';

const app = express();
const port = Number(process.env.PORT ?? 3002);

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'hospital-service' });
});

app.get('/api/v1/incoming-emergencies', (_req, res) => {
  res.json({
    success: true,
    data: [
      { emergencyId: 'EMG-2026-000001', status: 'HOSPITAL_NOTIFIED' }
    ],
    service: 'hospital-service',
    organization: 'Org2MSP'
  });
});

app.post('/api/v1/emergencies/:id/accept', (req, res) => {
  const result = acceptEmergency(req.params.id);
  res.json({ success: true, ...result, service: 'hospital-service' });
});

app.post('/api/v1/emergencies/:id/reject', (req, res) => {
  const result = rejectEmergency(req.params.id);
  res.json({ success: true, ...result, service: 'hospital-service' });
});

app.post('/api/v1/emergencies/:id/arrival', (req, res) => {
  const result = confirmArrival(req.params.id);
  res.json({ success: true, ...result, service: 'hospital-service' });
});

app.post('/api/v1/emergencies/:id/handover', (req, res) => {
  const result = confirmHandover(req.params.id);
  res.json({ success: true, ...result, service: 'hospital-service' });
});

app.listen(port, () => {
  console.log(`Hospital service listening on port ${port}`);
});
