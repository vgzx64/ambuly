# Architecture

## Overview

The platform is a distributed coordination layer for emergency response operations between the 911 Emergency Communications Center and a Hospital Emergency Department. The core value is a shared, auditable ledger of emergency case states, validated by Hyperledger Fabric, rather than a single centralized operation database.

## Layers

### 1. User layer

The frontend is a single web application with workspace views for each organization. Authentication controls the organization context and role. The UI does not define trust boundaries; it displays state and forwards requests to backend APIs.

### 2. Application layer

Each organization owns a backend service:

- `911-service` handles emergency registration, dispatch management, and updates from the hospital
- `hospital-service` handles incoming cases, acceptance, arrival, and handover
- `integration-service` routes events and reconciles delivery details

These services are separate, with independent validation, persistence, and operational responsibility.

### 3. Integration layer

The integration service sits between backend modules. It receives events, validates their schema, checks deduplication, ensures delivery, and tracks retry and reconciliation behavior. It does not override Fabric state; it only coordinates delivery and reconciliation.

### 4. Blockchain layer

Fabric provides the shared state and evidence of business actions. The network is designed with two MSPs, a shared channel, and a single chaincode for all emergency-case lifecycle rules.

### 5. Monitoring and security layer

Monitoring collects cross-system logs, detects unauthorized attempts, tracks state mismatches, and records metrics such as latency, duplicates, and failures.

## Data flow

1. 911 ECC creates an emergency case and sends a Fabric transaction.
2. The 911 backend publishes an event to the integration layer.
3. The integration service notifies the hospital backend.
4. Hospital ED validates readiness and sends a Fabric confirmation.
5. Additional transport and handover states are logged in Fabric.
6. Monitoring maintains a reconciled view across components.

## Key principles

- Single source of truth: Fabric ledger
- Organization-specific responsibility boundaries
- Controlled transitions with validation
- Event delivery with retry and deduplication
- Observability across all components
- Minimal data exposure in ledger storage

## Design assumptions

This is an educational MVP. The architecture intentionally avoids production-grade high availability, multi-region disaster recovery, and formal hospital integration by design. It is built for demonstration, validation, and process consistency.
