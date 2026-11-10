# Project Setup Manual

This guide explains how to set up the Emergency Response Coordination Platform and run a complete example emergency lifecycle from creation to hospital handover.

## 1. Requirements

Before starting, install the following tools:

- Docker Engine + Docker Compose
- Go 1.24+
- Node.js 20+ and npm
- A local shell with `curl`
- Hyperledger Fabric binaries in a directory such as `/home/dev2/fabric-bin/bin`

The repo expects the following Fabric tools to be available on `PATH`:

- `cryptogen`
- `configtxgen`
- `peer`
- `osnadmin`

Verify:

```bash
export PATH="/home/dev2/fabric-bin/bin:$PATH"
cryptogen version
configtxgen --version
peer version
osnadmin --help
```

## 2. Clone and prepare the repository

```bash
cd ~
git clone <your-repo-url>
cd ambuly
cp .env.example .env
```

If the repo has no local `.env` file yet, use the default values from `.env.example` or create a simple environment file for local development.

## 3. Start shared infrastructure

The repository root contains a Docker Compose file for local shared services:

```bash
cd /home/dev2/Code/ambuly
docker compose up -d
```

This starts:

- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`

To verify:

```bash
docker compose ps
```

## 4. Start the Hyperledger Fabric 3.x network

The Fabric network is defined under `blockchain/network`.

### 4.1 Generate crypto material and config

```bash
cd /home/dev2/Code/ambuly
export PATH="/home/dev2/fabric-bin/bin:$PATH"
bash blockchain/network/scripts/generate-network.sh
```

This script:

- creates the MSP folders for Org1 and Org2
- creates the orderer identities
- generates the application channel block for `emergency-channel`

### 4.2 Start the network containers

```bash
cd /home/dev2/Code/ambuly/blockchain/network/docker
docker compose -f docker-compose-network.yaml up -d --remove-orphans
```

Check the status:

```bash
docker compose -f docker-compose-network.yaml ps
```

The network includes:

- Orderer: `orderer.example.com:7050` and admin API on `7053`
- Org1 peer: `peer0.org1.example.com:7051`
- Org2 peer: `peer0.org2.example.com:7051`
- CouchDB for each org
- CLI container for admin and channel operations

### 4.3 Create the application channel in Fabric 3.x

The project is configured for the v3 no-system-channel model. The correct flow is to generate an application channel block and then join the OSN with `osnadmin`.

```bash
cd /home/dev2/Code/ambuly
export PATH="/home/dev2/fabric-bin/bin:$PATH"
docker exec cli bash -lc '
  configtxgen -configPath /etc/hyperledger/fabric/configtx -profile EmergencyChannel -channelID emergency-channel -outputBlock /tmp/emergency-channel.block
  osnadmin channel join \
    --channelID emergency-channel \
    --config-block /tmp/emergency-channel.block \
    --orderer-address orderer.example.com:7053 \
    --ca-file /etc/hyperledger/fabric/organizations/ordererOrganizations/example.com/users/Admin@example.com/tls/ca.crt \
    --client-cert /etc/hyperledger/fabric/organizations/ordererOrganizations/example.com/users/Admin@example.com/tls/client.crt \
    --client-key /etc/hyperledger/fabric/organizations/ordererOrganizations/example.com/users/Admin@example.com/tls/client.key
'
```

Expected result:

```json
{
  "name": "emergency-channel",
  "status": "active",
  "height": 1
}
```

## 5. Start the backend services

Each backend service has its own Express app and an independent `npm install` step.

### 5.1 911 Service

```bash
cd /home/dev2/Code/ambuly/backend/911-service
npm install
npm run dev
```

This service listens on:

- `http://localhost:3001`

### 5.2 Hospital Service

```bash
cd /home/dev2/Code/ambuly/backend/hospital-service
npm install
npm run dev
```

This service listens on:

- `http://localhost:3002`

### 5.3 Integration Service

```bash
cd /home/dev2/Code/ambuly/backend/integration-service
npm install
npm run dev
```

This service listens on:

- `http://localhost:3003`

Health checks:

```bash
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
```

## 6. Start the frontend

```bash
cd /home/dev2/Code/ambuly/frontend
npm install
npm run dev -- --host 0.0.0.0
```

Open the frontend in a browser:

- `http://localhost:5173`

## 7. Example end-to-end workflow

The platform demonstrates a patient emergency case moving through the operational lifecycle.

### 7.1 Create an emergency case

```bash
curl -X POST http://localhost:3001/api/v1/emergencies \
  -H 'Content-Type: application/json' \
  -d '{
    "emergencyId": "EMG-2026-000001",
    "priority": "HIGH",
    "incidentType": "TRAFFIC_ACCIDENT",
    "hospitalId": "HOSP-01",
    "locationRef": "Main St & 5th Ave",
    "createdBy": "dispatcher-001"
  }'
```

Example response:

```json
{
  "success": true,
  "emergencyId": "EMG-2026-000001",
  "status": "CREATED",
  "priority": "HIGH",
  "incidentType": "TRAFFIC_ACCIDENT",
  "hospitalId": "HOSP-01",
  "organization": "Org1MSP",
  "service": "911-service"
}
```

### 7.2 Dispatch an ambulance

```bash
curl -X POST http://localhost:3001/api/v1/emergencies/EMG-2026-000001/dispatch \
  -H 'Content-Type: application/json' \
  -d '{
    "ambulanceId": "AMB-74"
  }'
```

This moves the case from `CREATED` to `AMBULANCE_DISPATCHED`.

### 7.3 Update transport status

```bash
curl -X POST http://localhost:3001/api/v1/emergencies/EMG-2026-000001/status \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "EN_ROUTE_TO_SCENE"
  }'
```

### 7.4 Notify hospital and accept the case

```bash
curl -X POST http://localhost:3002/api/v1/emergencies/EMG-2026-000001/accept
```

This represents the hospital accepting the emergency. The result is a state transition to `HOSPITAL_ACCEPTED`.

### 7.5 Confirm arrival and handover

```bash
curl -X POST http://localhost:3002/api/v1/emergencies/EMG-2026-000001/arrival
curl -X POST http://localhost:3002/api/v1/emergencies/EMG-2026-000001/handover
```

### 7.6 Queue an event for the integration layer

```bash
curl -X POST http://localhost:3003/api/v1/events \
  -H 'Content-Type: application/json' \
  -d '{
    "eventId": "EVT-001",
    "emergencyId": "EMG-2026-000001",
    "eventType": "HospitalAccepted",
    "sourceOrg": "Org1MSP",
    "targetOrg": "Org2MSP",
    "payload": {
      "status": "HOSPITAL_ACCEPTED"
    }
  }'
```

Check event status:

```bash
curl http://localhost:3003/api/v1/events/EVT-001
```

## 8. Example lifecycle summary

The full lifecycle in this project looks like this:

```text
CREATED
  -> AMBULANCE_DISPATCHED
  -> EN_ROUTE_TO_SCENE
  -> HOSPITAL_ACCEPTED
  -> ARRIVED_AT_HOSPITAL
  -> HANDED_OVER
  -> COMPLETED
```

The flow is intentionally simple but demonstrates:

- request validation
- status transition rules
- cross-org coordination
- event queueing and delivery tracking
- auditable emergency records

## 9. Useful commands

Check the 911 service emergency list:

```bash
curl http://localhost:3001/api/v1/emergencies
```

Check health:

```bash
curl http://localhost:3002/health
curl http://localhost:3003/health
```

Inspect the Fabric channel:

```bash
docker exec cli bash -lc 'osnadmin channel list --orderer-address orderer.example.com:7053 --ca-file /etc/hyperledger/fabric/organizations/ordererOrganizations/example.com/users/Admin@example.com/tls/ca.crt --client-cert /etc/hyperledger/fabric/organizations/ordererOrganizations/example.com/users/Admin@example.com/tls/client.crt --client-key /etc/hyperledger/fabric/organizations/ordererOrganizations/example.com/users/Admin@example.com/tls/client.key'
```

## 10. Troubleshooting

### Docker network conflict

If Docker reports `Address already in use`, remove the stale Fabric network:

```bash
docker network rm docker_emergency-network
```

Then recreate the network:

```bash
cd /home/dev2/Code/ambuly/blockchain/network/docker
docker compose -f docker-compose-network.yaml down -v --remove-orphans
docker compose -f docker-compose-network.yaml up -d --remove-orphans
```

### Missing Fabric binaries

If `cryptogen` or `configtxgen` is not found, export the correct path:

```bash
export PATH="/home/dev2/fabric-bin/bin:$PATH"
```

### Backend service not starting

Verify dependencies are installed in each service directory:

```bash
cd backend/911-service && npm install
cd ../hospital-service && npm install
cd ../integration-service && npm install
```

## 11. Final note

This project is designed as a reproducible MVP for demonstration, validation, and learning. The Fabric layer is the source of truth, while the backend services and frontend provide the operational workflow and simulation of a real emergency coordination environment.
