# Integration Contract

## General identifiers

Each emergency operation uses a shared `emergencyId` and a unique `eventId` for each message. Fabric transactions also carry a `txId`.

Example identifiers:

- `emergencyId`: `EMG-2026-000001`
- `eventId`: `EVT-550e8400-e29b-41d4-a716-446655440000`
- `txId`: Fabric transaction ID produced during commit

## Message format

Messages are exchanged as JSON objects with a versioned schema and consistent validation rules.

### Example notification from 911 ECC

```json
{
  "schemaVersion": "1.0",
  "eventId": "EVT-001",
  "emergencyId": "EMG-2026-000001",
  "eventType": "DispatchRequested",
  "occurredAt": "2026-11-10T12:00:00Z",
  "sourceOrg": "Org1MSP",
  "targetOrg": "Org2MSP",
  "priority": "HIGH",
  "incidentType": "TRAFFIC_ACCIDENT",
  "ambulanceId": "AMB-001",
  "hospitalId": "HOSPITAL-001",
  "locationRef": "LOC-OPAQUE-001",
  "payloadHash": "sha256:..."
}
```

### Example response from Hospital ED

```json
{
  "schemaVersion": "1.0",
  "eventId": "EVT-002",
  "emergencyId": "EMG-2026-000001",
  "eventType": "HospitalAccepted",
  "occurredAt": "2026-11-10T12:02:00Z",
  "sourceOrg": "Org2MSP",
  "targetOrg": "Org1MSP",
  "hospitalId": "HOSPITAL-001",
  "acceptanceStatus": "ACCEPTED",
  "payloadHash": "sha256:..."
}
```

## Reliability and idempotency

The integration system must enforce:

- unique `eventId` tracking across all services
- deduplication against previously processed events
- safe retries on failure
- no repeated business mutation on duplicate event delivery
- journaling of all send/receive outcomes

## Outbox pattern

Each backend persists a business event and local outbox record in one transaction. An outbox worker picks up pending messages and delivers them to the integration service.

## Retry behavior

- limited retries with exponential backoff
- failure queue for dead-letter handling
- manual replay support for administrators
- event status tracking

## Synchronization rules

The system must reconcile:

- backend local state
- integration service state
- Fabric ledger state

The local state may not override a confirmed Fabric state without explicit reconciliation and review.
