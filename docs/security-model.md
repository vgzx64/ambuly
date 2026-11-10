# Security Model

## Threats

The platform must mitigate the following threats:

- unauthorized state mutation
- forged organization identity
- duplicate or replayed requests
- message tampering
- data leakage
- integration service downtime
- state mismatch across services
- stolen credentials

## Controls

### Identity and authorization

- MSP checks by Fabric
- certificate attribute validation
- per-role authorization rules
- chaincode enforcement of allowed actions

### Data minimization

Only minimal coordination data is stored in the ledger. Sensitive patient data must remain outside the shared Fabric channel or in private data collections designed for controlled access.

### Deduplication

Each business event and external message must carry a unique identifier and must be checked before any business mutation is allowed.

### Monitoring and detection

The monitoring layer watches for:

- unauthorized operations
- repeated failures
- cross-organization state mismatch
- duplicate events
- delayed event delivery

## Security events

The project defines detection rules such as:

- `DET-01`: Unauthorized Operation
- `DET-02`: Repeated Transaction Failures
- `DET-03`: Cross-Organization State Mismatch
- `DET-04`: Duplicate Event
- `DET-05`: Delayed Integration Event

## Key management and network protections

- TLS security for service communication
- secrets stored outside the repository
- audit logs with correlation identifiers
- access restrictions to the logging plane
- backup and recovery policy

## Principle of least privilege

A user can execute only the operations explicit to their organization and role. UI controls are not a substitute for backend validation or chaincode rules.
