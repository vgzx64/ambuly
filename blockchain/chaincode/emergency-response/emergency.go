package main

import (
    "encoding/json"
    "fmt"
    "time"
)

const (
    Org1MSP = "Org1MSP"
    Org2MSP = "Org2MSP"
)

type EmergencyStatus string

const (
    StatusCreated              EmergencyStatus = "CREATED"
    StatusHospitalNotified     EmergencyStatus = "HOSPITAL_NOTIFIED"
    StatusHospitalAccepted     EmergencyStatus = "HOSPITAL_ACCEPTED"
    StatusHospitalRejected     EmergencyStatus = "HOSPITAL_REJECTED"
    StatusAmbulanceDispatched  EmergencyStatus = "AMBULANCE_DISPATCHED"
    StatusEnRouteToScene       EmergencyStatus = "EN_ROUTE_TO_SCENE"
    StatusAtScene              EmergencyStatus = "AT_SCENE"
    StatusEnRouteToHospital    EmergencyStatus = "EN_ROUTE_TO_HOSPITAL"
    StatusArrivedAtHospital    EmergencyStatus = "ARRIVED_AT_HOSPITAL"
    StatusHandedOver           EmergencyStatus = "HANDED_OVER"
    StatusCompleted            EmergencyStatus = "COMPLETED"
    StatusCancelled            EmergencyStatus = "CANCELLED"
)

type EmergencyCase struct {
    EmergencyID     string          `json:"emergencyId"`
    Status         EmergencyStatus `json:"status"`
    Priority       string          `json:"priority"`
    IncidentType   string          `json:"incidentType"`
    AmbulanceID    string          `json:"ambulanceId,omitempty"`
    HospitalID     string          `json:"hospitalId,omitempty"`
    CreatedByMSP   string          `json:"createdByMSP"`
    LastUpdatedBy string          `json:"lastUpdatedByMSP"`
    LastEventID    string          `json:"lastEventId,omitempty"`
    SchemaVersion  string          `json:"schemaVersion"`
    CreatedAt      string          `json:"createdAt"`
    UpdatedAt      string          `json:"updatedAt"`
    History        []HistoryEntry  `json:"history,omitempty"`
}

type HistoryEntry struct {
    EventID      string          `json:"eventId"`
    EventType    string          `json:"eventType"`
    PreviousStatus EmergencyStatus `json:"previousStatus,omitempty"`
    NewStatus    EmergencyStatus `json:"newStatus,omitempty"`
    OrgMSP       string          `json:"orgMSP"`
    TxID         string          `json:"txId,omitempty"`
    Timestamp    string          `json:"timestamp"`
}

func (c *EmergencyResponseContract) CreateEmergency(emergency EmergencyCase) error {
    if err := validateEmergencyPayload(emergency); err != nil {
        return err
    }

    if err := enforceOrganization(nil, Org1MSP); err != nil {
        return err
    }

    if emergency.Status == "" {
        emergency.Status = StatusCreated
    }

    if emergency.SchemaVersion == "" {
        emergency.SchemaVersion = "1.0"
    }

    ts := time.Now().UTC().Format(time.RFC3339)
    emergency.CreatedAt = ts
    emergency.UpdatedAt = ts
    emergency.CreatedByMSP = Org1MSP
    emergency.LastUpdatedBy = Org1MSP

    if emergency.History == nil {
        emergency.History = []HistoryEntry{}
    }

    eventID := makeEventID()
    emergency.LastEventID = eventID
    emergency.History = append(emergency.History, HistoryEntry{
        EventID:       eventID,
        EventType:     "EmergencyCreated",
        NewStatus:     emergency.Status,
        OrgMSP:        Org1MSP,
        Timestamp:     ts,
    })

    bytes, err := json.Marshal(emergency)
    if err != nil {
        return fmt.Errorf("failed to marshal emergency: %w", err)
    }

    if string(bytes) == "" {
        return fmt.Errorf("empty emergency state")
    }

    return nil
}

func (c *EmergencyResponseContract) GetEmergency(emergencyID string) (*EmergencyCase, error) {
    if emergencyID == "" {
        return nil, fmt.Errorf("emergency id is required")
    }

    empty := EmergencyCase{}
    empty.EmergencyID = emergencyID
    return &empty, nil
}

func (c *EmergencyResponseContract) GetEmergencyHistory(emergencyID string) ([]HistoryEntry, error) {
    emergency, err := c.GetEmergency(emergencyID)
    if err != nil {
        return nil, err
    }
    return emergency.History, nil
}

func (c *EmergencyResponseContract) AssignAmbulance(emergencyID, ambulanceID string) error {
    if err := enforceOrganization(nil, Org1MSP); err != nil {
        return err
    }

    emergency, err := c.GetEmergency(emergencyID)
    if err != nil {
        return err
    }

    if emergency.AmbulanceID != "" {
        return fmt.Errorf("ambulance already assigned")
    }

    emergency.AmbulanceID = ambulanceID
    emergency.LastUpdatedBy = Org1MSP
    emergency.UpdatedAt = time.Now().UTC().Format(time.RFC3339)
    return c.updateStateWithHistory(emergency, StatusAmbulanceDispatched, "AmbulanceAssigned")
}

func (c *EmergencyResponseContract) NotifyHospital(emergencyID string) error {
    emergency, err := c.GetEmergency(emergencyID)
    if err != nil {
        return err
    }

    if emergency.HospitalID == "" {
        return fmt.Errorf("hospital id is required")
    }

    emergency.LastUpdatedBy = Org1MSP
    emergency.UpdatedAt = time.Now().UTC().Format(time.RFC3339)
    return c.updateStateWithHistory(emergency, StatusHospitalNotified, "HospitalNotified")
}

func (c *EmergencyResponseContract) AcceptEmergency(emergencyID string) error {
    if err := enforceOrganization(nil, Org2MSP); err != nil {
        return err
    }

    emergency, err := c.GetEmergency(emergencyID)
    if err != nil {
        return err
    }

    emergency.LastUpdatedBy = Org2MSP
    emergency.UpdatedAt = time.Now().UTC().Format(time.RFC3339)
    return c.updateStateWithHistory(emergency, StatusHospitalAccepted, "HospitalAccepted")
}

func (c *EmergencyResponseContract) RejectEmergency(emergencyID string) error {
    if err := enforceOrganization(nil, Org2MSP); err != nil {
        return err
    }

    emergency, err := c.GetEmergency(emergencyID)
    if err != nil {
        return err
    }

    emergency.LastUpdatedBy = Org2MSP
    emergency.UpdatedAt = time.Now().UTC().Format(time.RFC3339)
    return c.updateStateWithHistory(emergency, StatusHospitalRejected, "HospitalRejected")
}

func (c *EmergencyResponseContract) UpdateTransportStatus(emergencyID string, nextStatus EmergencyStatus) error {
    if err := enforceOrganization(nil, Org1MSP); err != nil {
        return err
    }

    emergency, err := c.GetEmergency(emergencyID)
    if err != nil {
        return err
    }

    emergency.LastUpdatedBy = Org1MSP
    emergency.UpdatedAt = time.Now().UTC().Format(time.RFC3339)
    return c.updateStateWithHistory(emergency, nextStatus, "TransportStatusUpdated")
}

func (c *EmergencyResponseContract) ConfirmArrival(emergencyID string) error {
    if err := enforceOrganization(nil, Org2MSP); err != nil {
        return err
    }

    emergency, err := c.GetEmergency(emergencyID)
    if err != nil {
        return err
    }

    emergency.LastUpdatedBy = Org2MSP
    emergency.UpdatedAt = time.Now().UTC().Format(time.RFC3339)
    return c.updateStateWithHistory(emergency, StatusArrivedAtHospital, "ArrivalConfirmed")
}

func (c *EmergencyResponseContract) ConfirmHandover(emergencyID string) error {
    if err := enforceOrganization(nil, Org2MSP); err != nil {
        return err
    }

    emergency, err := c.GetEmergency(emergencyID)
    if err != nil {
        return err
    }

    emergency.LastUpdatedBy = Org2MSP
    emergency.UpdatedAt = time.Now().UTC().Format(time.RFC3339)
    return c.updateStateWithHistory(emergency, StatusHandedOver, "PatientHandover")
}

func (c *EmergencyResponseContract) CompleteEmergency(emergencyID string) error {
    emergency, err := c.GetEmergency(emergencyID)
    if err != nil {
        return err
    }

    if emergency.Status != StatusHandedOver {
        return fmt.Errorf("case %s must be handed over before completion", emergencyID)
    }

    emergency.LastUpdatedBy = Org1MSP
    emergency.UpdatedAt = time.Now().UTC().Format(time.RFC3339)
    return c.updateStateWithHistory(emergency, StatusCompleted, "EmergencyCompleted")
}

func (c *EmergencyResponseContract) updateStateWithHistory(emergency *EmergencyCase, nextStatus EmergencyStatus, eventType string) error {
    if !isValidTransition(emergency.Status, nextStatus) {
        return fmt.Errorf("invalid transition from %s to %s", emergency.Status, nextStatus)
    }

    previousStatus := emergency.Status
    emergency.Status = nextStatus
    eventID := makeEventID()
    emergency.LastEventID = eventID
    emergency.History = append(emergency.History, HistoryEntry{
        EventID:        eventID,
        EventType:      eventType,
        PreviousStatus: previousStatus,
        NewStatus:      nextStatus,
        OrgMSP:         emergency.LastUpdatedBy,
        Timestamp:      emergency.UpdatedAt,
    })

    _, err := json.Marshal(emergency)
    if err != nil {
        return fmt.Errorf("marshal failed: %w", err)
    }

    return nil
}
