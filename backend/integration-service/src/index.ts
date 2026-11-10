import express from 'express';

import { getEventStatus, markDelivered, queueEvent } from './integration-service.js';

const app = express();
const port = Number(process.env.PORT ?? 3003);

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'integration-service' });
});

app.post('/api/v1/events', (req, res) => {
  const event = req.body ?? {};

  if (!event.eventId || !event.emergencyId || !event.eventType) {
    return res.status(400).json({ success: false, error: 'eventId, emergencyId and eventType are required' });
  }

  const result = queueEvent({
    eventId: event.eventId,
    emergencyId: event.emergencyId,
    eventType: event.eventType,
    sourceOrg: event.sourceOrg ?? 'Org1MSP',
    targetOrg: event.targetOrg ?? 'Org2MSP',
    payload: event.payload ?? {},
    receivedAt: new Date().toISOString()
  });

  if (result.duplicate) {
    return res.status(200).json({ ...result, service: 'integration-service' });
  }

  res.status(202).json({
    ...result,
    service: 'integration-service'
  });
});

app.get('/api/v1/events/:eventId', (req, res) => {
  const result = getEventStatus(req.params.eventId);

  if (!result) {
    return res.status(404).json({ success: false, error: 'Event not found' });
  }

  res.json({ ...result, service: 'integration-service' });
});

app.post('/api/v1/events/:eventId/delivered', (req, res) => {
  const ok = markDelivered(req.params.eventId);

  if (!ok) {
    return res.status(404).json({ success: false, error: 'Event not found' });
  }

  res.json({ success: true, eventId: req.params.eventId, status: 'delivered' });
});

app.listen(port, () => {
  console.log(`Integration service listening on port ${port}`);
});
