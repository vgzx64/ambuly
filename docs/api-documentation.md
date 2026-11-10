# API Documentation

## Overview

The application exposes REST APIs for the backend services. The contract is designed for a minimal MVP and can be expanded once the business flow is finalized.

## 911 ECC API

### `POST /api/v1/emergencies`

Creates a new emergency case.

Request body:

```json
{
  "emergencyId": "EMG-2026-000001",
  "priority": "HIGH",
  "incidentType": "TRAFFIC_ACCIDENT",
  "locationRef": "LOC-OPAQUE-001",
  "hospitalId": "HOSPITAL-001",
  "createdBy": "dispatcher-101"
}
```

Response:

```json
{
  "success": true,
  "emergencyId": "EMG-2026-000001",
  "status": "CREATED",
  "txId": "fabric-tx-id"
}
```

### `POST /api/v1/emergencies/:id/dispatch`

Assigns and dispatches an ambulance.

### `GET /api/v1/emergencies/:id`

Returns the current emergency state.

### `GET /api/v1/emergencies/:id/history`

Returns the business history and ledger-relevant events.

## Hospital API

### `GET /api/v1/incoming-emergencies`

Lists incoming emergency cases.

### `POST /api/v1/emergencies/:id/accept`

Confirms the hospital is ready to receive the patient.

### `POST /api/v1/emergencies/:id/reject`

Rejects an incoming emergency case.

### `POST /api/v1/emergencies/:id/arrival`

Confirms ambulance arrival at the hospital.

### `POST /api/v1/emergencies/:id/handover`

Confirms patient transfer.

## Integration API

### `POST /api/v1/events`

Receives an event payload from a backend service.

### `GET /api/v1/events/:eventId`

Returns delivery status by event ID.

### `POST /api/v1/reconcile`

Triggers reconciliation checks.

## Error model

The API responds with structured errors containing:

- `code`
- `message`
- `details`
- `correlationId`

Example:

```json
{
  "code": "UNAUTHORIZED_OPERATION",
  "message": "The current organization cannot perform this action.",
  "details": {
    "emergencyId": "EMG-2026-000001"
  },
  "correlationId": "corr-123"
}
```
