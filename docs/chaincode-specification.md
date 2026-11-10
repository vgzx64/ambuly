# Chaincode Specification

## Goal

The chaincode defines the canonical business rules for emergency case coordination between the 911 ECC and the Hospital ED. It acts as the trusted validation layer for every state transition recorded in Fabric.

## Core entity

The primary object is an `EmergencyCase` with the following fields:

- `emergencyId`
- `status`
- `priority`
- `incidentType`
- `ambulanceId`
- `hospitalId`
- `createdByMSP`
- `lastUpdatedByMSP`
- `lastEventId`
- `schemaVersion`
- `createdAt`
- `updatedAt`
- `history`

## Allowed operations

### `CreateEmergency`

Creates a new emergency case and validates required fields.

Required conditions:

- caller MSP is `Org1MSP`
- caller role is one of `DISPATCHER` or `SUPERVISOR`
- `emergencyId` is unique
- all mandatory fields are present

### `AssignAmbulance`

Links an ambulance to the emergency case.

Required conditions:

- only `Org1MSP`
- case must be in an eligible state
- ambulance assignment must be unique for the active case

### `NotifyHospital`

Marks the hospital as notified about the case.

### `AcceptEmergency`

Validates hospital acceptance.

- only `Org2MSP`
- only the Hospital workforce roles may call it
- case must support the transition

### `RejectEmergency`

Rejects an emergency case receipt.

### `UpdateTransportStatus`

Tracks movement from the scene to the hospital.

### `ConfirmArrival`

Confirms the ambulance has arrived at the hospital.

### `ConfirmHandover`

Confirms patient handover to hospital staff.

### `CompleteEmergency`

Finalizes the case after the handover is confirmed and the required validation succeeds.

### `GetEmergency`

Returns the current state for one case.

### `GetEmergencyHistory`

Returns the full transition history of the case.

## Authorization model

The contract uses the Fabric client identity API to extract the MSP and certificate attributes. Authorization must be enforced in chaincode rather than only in the UI.

## Transition rules

The state machine must reject transitions such as:

- invalid status ordering
- unauthorized organization actions
- transition after completion
- duplicate event handling
- hospital action before case creation

## Event publication

When a state changes, the chaincode emits a business event with the following metadata:

- `emergencyId`
- `eventId`
- `eventType`
- `previousStatus`
- `newStatus`
- `orgMSP`
- `txId`

## Notes

This contract is intentionally scoped to the needs of an educational MVP. Production hardening would require more granular endorsement policies, stronger identity rules, and careful private-data handling.
