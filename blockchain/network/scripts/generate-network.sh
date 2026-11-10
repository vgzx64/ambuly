#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FABRIC_CFG_PATH="${ROOT_DIR}/configtx"
ORG_DIR="${ROOT_DIR}/organizations"
CONFIG_FILE="${FABRIC_CFG_PATH}/configtx.yaml"

rm -rf "${ORG_DIR}" "${FABRIC_CFG_PATH}/genesis.block"
rm -f "${FABRIC_CFG_PATH}/crypto-config.yaml" "${FABRIC_CFG_PATH}/channel.tx"
mkdir -p "${ORG_DIR}"

if ! command -v cryptogen >/dev/null 2>&1; then
  echo "[ERROR] cryptogen is required but not installed. Install the Hyperledger Fabric binaries first." >&2
  exit 1
fi

if ! command -v configtxgen >/dev/null 2>&1; then
  echo "[ERROR] configtxgen is required but not installed. Install the Hyperledger Fabric binaries first." >&2
  exit 1
fi

mkdir -p "${ORG_DIR}/peerOrganizations/org1.example.com" "${ORG_DIR}/peerOrganizations/org2.example.com" "${ORG_DIR}/ordererOrganizations/example.com"

cat > "${ROOT_DIR}/configtx/crypto-config.yaml" <<'EOF'
OrdererOrgs:
  - Name: OrdererOrg
    Domain: example.com
    Specs:
      - Hostname: orderer

PeerOrgs:
  - Name: Org1
    Domain: org1.example.com
    EnableNodeOUs: true
    Template:
      Count: 1
    Users:
      Count: 1

  - Name: Org2
    Domain: org2.example.com
    EnableNodeOUs: true
    Template:
      Count: 1
    Users:
      Count: 1
EOF

cryptogen generate --config="${ROOT_DIR}/configtx/crypto-config.yaml" --output="${ORG_DIR}"
# Fabric v3.x does not require a system-channel bootstrap block for orderer startup.
# The application channel config block is the required operational artifact for OSN admin join.
FABRIC_CFG_PATH="${FABRIC_CFG_PATH}" configtxgen -configPath "${FABRIC_CFG_PATH}" -profile EmergencyChannel -channelID emergency-channel -outputBlock "${ROOT_DIR}/configtx/emergency-channel.block"

printf '\n[INFO] Fabric crypto material and channel configuration generated.\n'
