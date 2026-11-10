#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CHANNEL_NAME="emergency-channel"
CHAINCODE_NAME="emergency-response"
CHAINCODE_PATH="${ROOT_DIR}/../../chaincode/emergency-response"

if ! command -v peer >/dev/null 2>&1; then
  echo "[ERROR] Fabric peer CLI is required for chaincode deployment." >&2
  exit 1
fi

cat <<EOF
[INFO] This project is configured for a Fabric 3.x deployment model.
[INFO] The next operational step is to:
[INFO] 1) start the network, 2) create the channel, 3) join peers, 4) install chaincode, and 5) approve + commit the definition.
[INFO] The chaincode source is located at: ${CHAINCODE_PATH}
[INFO] Channel: ${CHANNEL_NAME}
[INFO] Chaincode: ${CHAINCODE_NAME}
EOF

# The exact lifecycle commands below should be executed in the Fabric CLI container or a local peer environment.
# Example:
# peer lifecycle chaincode package ${CHAINCODE_NAME}.tar.gz --path ${CHAINCODE_PATH} --lang golang --label ${CHAINCODE_NAME}_1.0
# peer lifecycle chaincode install ${CHAINCODE_NAME}.tar.gz
# peer lifecycle chaincode approveformyorg --channelID ${CHANNEL_NAME} --name ${CHAINCODE_NAME} --version 1.0 --package-id <packageid> --sequence 1 --tls --cafile ...
# peer lifecycle chaincode commit --channelID ${CHANNEL_NAME} --name ${CHAINCODE_NAME} --version 1.0 --sequence 1 --tls --cafile ...
