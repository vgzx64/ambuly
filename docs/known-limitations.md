# Known Limitations

## Scope restrictions

This MVP intentionally limits the implementation to a proof-of-concept coordination platform.

- It does not replace hospital medical record systems.
- It does not include live patient diagnostics.
- It does not model real emergency ambulance dispatch networks.
- It does not provide a legal or regulatory-grade security certification.
- It uses synthetic data for demonstration purposes.

## Operational considerations

Production deployment would require:

- multi-peer and multi-org resilience
- stronger key management
- hardened identity verification
- deeper private-data protections
- more advanced monitoring and anomaly detection
- stricter compliance review

## Important caveat

Blockchain improves auditability and cross-organization agreement, but it does not guarantee the physical truth of external events. It validates recorded actions and their history, not the reality outside the system.
