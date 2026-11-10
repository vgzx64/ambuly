# Fabric network layer

This directory contains the Hyperledger Fabric 3.x network configuration for the emergency response platform.

## Components

- Orderer node for the shared ordering service
- One peer for Org1MSP (`911 ECC`)
- One peer for Org2MSP (`Hospital ED`)
- CouchDB state databases for each peer
- Channel definition for `emergency-channel`
- Chaincode deployment and bootstrap scripts

## Files

- `configtx/configtx.yaml` — channel and orderer configuration
- `docker/docker-compose-network.yaml` — Docker Compose topology
- `scripts/generate-network.sh` — generates crypto material and channel transactions
- `scripts/deploy-chaincode.sh` — deployment checklist and lifecycle commands

## Prerequisites

- Docker Engine and Docker Compose
- Hyperledger Fabric binaries: `cryptogen`, `configtxgen`, `peer`
- Go toolchain for chaincode development

## Typical flow

1. Generate the network material.
2. Start the Docker network.
3. Create and join the channel.
4. Package and deploy the chaincode.
5. Validate ledger and business transitions.

This layer is intentionally scaffolded for reproducibility and future Fabric deployment, while preserving the MVP scope of the repository.
