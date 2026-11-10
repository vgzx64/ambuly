# User Guide

## 911 ECC workflow

1. Sign in as a dispatcher or supervisor.
2. Create a new emergency case.
3. Provide the priority and incident category.
4. Review the generated `emergencyId`.
5. Assign an ambulance and dispatch the unit.
6. Monitor event delivery to the hospital.
7. Review the hospital response and continue the transport flow.

## Hospital workflow

1. Sign in as a hospital operator or coordinator.
2. Review incoming emergencies.
3. Accept or reject the emergency based on available resources.
4. Confirm arrival at the hospital.
5. Confirm patient handover.
6. Review the final hospital-side timeline and transaction history.

## Shared visibility

Both organizations can view the shared emergency operation, event history, and Fabric transaction status. The UI must never present a state as confirmed without a successful ledger commit.

## Known constraints

This is an educational demonstration. Production use requires stronger deployment controls, broader audit logging, and a fully hardened environment.
