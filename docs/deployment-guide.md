# Deployment Guide

## Overview

This guide describes the intended deployment approach for the MVP environment.

## Prerequisites

- Docker and Docker Compose
- Go 1.22+
- Node.js 20+
- npm
- Git

## Fabric setup

1. Configure the Org1 and Org2 MSPs and cryptographic material.
2. Start the ordering service and peer nodes.
3. Create the `emergency-channel`.
4. Install the chaincode package.
5. Approve and commit the chaincode definition.

## Application startup

1. Copy `.env.example` to `.env` and update the service settings.
2. Run the database migrations.
3. Start the 911 backend.
4. Start the hospital backend.
5. Start the integration service.
6. Start the frontend.
7. Validate API connectivity and Fabric health.

## Operational notes

- Keep cryptographic material out of the repository.
- Use environment variables for secrets.
- Run the monitoring stack separately from the application stack.
- Verify Fabric commit results before showing a success state in the frontend.

## Recovery plan

When a component fails:

- keep the outbox in persistent storage
- replay pending events after service recovery
- record abnormal status as a monitoring alert
- reconcile local state against the Fabric ledger

## Environment assumption

This step is intentionally aligned with the educational scope of the MVP and can be refined for production deployment later.
