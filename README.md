# Emergency Response Coordination Platform

This repository contains an MVP implementation blueprint for a Hyperledger Fabric-based emergency response coordination platform. The system coordinates a single emergency case between the 911 Emergency Communications Center and the Hospital Emergency Department with a shared ledger, regulated status transitions, and delivery retries.

## Project scope

- Shared Fabric network with two organizations: `Org1MSP` (911 ECC) and `Org2MSP` (Hospital)
- Go chaincode for business validation and lifecycle management
- Separate backend services for 911, hospital, and integration operations
- Unified frontend for both organizations
- Monitoring and reconciliation features
- Automated and repeatable testing flow
- Documentation covering architecture, contracts, security, and deployment

## Repository structure

```text
EmergencyResponse/
├── blockchain/
│   └── chaincode/
│       └── emergency-response/
├── backend/
│   ├── 911-service/
│   ├── hospital-service/
│   ├── integration-service/
│   └── shared/
├── frontend/
├── monitoring/
├── database/
├── tests/
├── docs/
├── scripts/
├── .github/
├── docker-compose.yml
├── .env.example
├── README.md
└── LICENSE
```

## Business objective

The platform is designed to provide a transparent, tamper-evident, and auditable record of an emergency case across organizations. It ensures that the emergency case is created once, receives a shared identifier (`emergencyId`), has validated lifecycle transitions, and supports delivery, acceptance, arrival, and handover events.

## Core lifecycle states

- `CREATED`
- `HOSPITAL_NOTIFIED`
- `HOSPITAL_ACCEPTED`
- `HOSPITAL_REJECTED`
- `AMBULANCE_DISPATCHED`
- `EN_ROUTE_TO_SCENE`
- `AT_SCENE`
- `EN_ROUTE_TO_HOSPITAL`
- `ARRIVED_AT_HOSPITAL`
- `HANDED_OVER`
- `COMPLETED`
- `CANCELLED`

## Chaincode contract

The contract logic is implemented in Go under `blockchain/chaincode/emergency-response`. It provides the business validation layer for:

- `CreateEmergency`
- `AssignAmbulance`
- `NotifyHospital`
- `AcceptEmergency`
- `RejectEmergency`
- `UpdateTransportStatus`
- `ConfirmArrival`
- `ConfirmHandover`
- `CompleteEmergency`
- `GetEmergency`
- `GetEmergencyHistory`

The validation logic enforces:

- MSP-based authorization
- allowed lifecycle transitions
- idempotent event processing
- duplicate prevention
- immutable completion rules

## Organization model

- `Org1MSP`: 911 ECC
- `Org2MSP`: Hospital ED

## Quick start

1. Review the project documentation in `docs/`.
2. Follow the full installation and runtime flow in [docs/setup-manual.md](docs/setup-manual.md).
3. Start the Fabric network and deploy the chaincode.
4. Launch the backend services.
5. Run the frontend app.
6. Execute the test flows for unit, integration, e2e, and load validation.

## Documentation set

- `docs/architecture.md`
- `docs/business-process.md`
- `docs/integration-contract.md`
- `docs/chaincode-specification.md`
- `docs/api-documentation.md`
- `docs/security-model.md`
- `docs/testing-plan.md`
- `docs/deployment-guide.md`
- `docs/user-guide.md`
- `docs/final-testing-report.md`
- `docs/known-limitations.md`

## Important note

This repository is an MVP teaching implementation. It is intentionally scoped for demonstration and validation rather than production emergency-response deployment. The implementation uses synthetic data and focuses on transactional integrity, authorization, event propagation, and auditable state transitions.

## License

This project is provided for educational and demonstration purposes.
