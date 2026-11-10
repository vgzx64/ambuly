# Business Process

## Primary flow

The emergency case lifecycle begins with a call received by 911 ECC and ends after the patient is handed over and the case is marked complete.

1. A dispatcher registers a new emergency incident.
2. The 911 system validates the payload and creates a unique `emergencyId`.
3. A `CreateEmergency` transaction is submitted to Fabric.
4. An event is emitted for hospital notification.
5. Hospital ED receives the case notification and checks capacity.
6. Hospital approves or rejects the case.
7. 911 ECC dispatches the ambulance and updates transport status.
8. The ambulance moves to the scene, then to the hospital.
9. Hospital confirms arrival and patient handover.
10. The emergency case is closed as `COMPLETED`.

## State model

The lifecycle includes business states such as:

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

## Distinction between acceptance and handover

There are two separate confirmations:

- `HospitalAccepted`: the hospital confirms it is ready to receive the patient
- `PatientHandover`: the patient has physically been transferred to hospital staff

These state transitions should not be collapsed into a single action because they represent different operational responsibilities.

## Transfer rules

The chaincode should reject invalid transitions, such as:

- creating a case without required fields
- reusing an existing `emergencyId`
- confirming a handover before arrival at the hospital
- accepting an emergency by a non-hospital actor
- editing a completed case through a normal business mutation
- processing a previously handled event as a new case

## Primary responsibilities

### 911 ECC

- create the record
- classify and prioritize the incident
- allocate the ambulance
- update transport states
- receive hospital confirmations

### Hospital ED

- review incoming emergency request
- accept or reject the patient intake
- confirm arrival at the facility
- confirm patient transfer to hospital staff

## Recovery expectations

The system must be resilient to temporary outage, message loss, or partial service recovery. Any message that was already committed to the platform must not be lost or processed twice.
