#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

mkdir -p blockchain/network/{organizations,configtx,docker,scripts}
mkdir -p blockchain/chaincode/emergency-response
mkdir -p backend/shared/{models,dto,schemas,errors,validation}
mkdir -p backend/911-service/src backend/911-service/tests
mkdir -p backend/hospital-service/src backend/hospital-service/tests
mkdir -p backend/integration-service/src backend/integration-service/tests
mkdir -p frontend/src/{pages,components,features,services,hooks,types,layouts}
mkdir -p monitoring/{logger,detection,reconciliation,reports}
mkdir -p database/{migrations,seeds}
mkdir -p tests/{unit,integration,e2e,security,load}
mkdir -p docs

printf 'Project directories created successfully.\n'
