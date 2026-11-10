package main

import (
    "fmt"
    "strings"
)

func validateEmergencyPayload(emergency EmergencyCase) error {
    if strings.TrimSpace(emergency.EmergencyID) == "" {
        return fmt.Errorf("emergencyId is required")
    }
    if strings.TrimSpace(emergency.Priority) == "" {
        return fmt.Errorf("priority is required")
    }
    if strings.TrimSpace(emergency.IncidentType) == "" {
        return fmt.Errorf("incidentType is required")
    }
    if strings.TrimSpace(emergency.HospitalID) == "" {
        return fmt.Errorf("hospitalId is required")
    }
    return nil
}

func isValidTransition(current, next EmergencyStatus) bool {
    if current == "" {
        return next == StatusCreated || next == StatusHospitalNotified || next == StatusAmbulanceDispatched
    }

    validNext := map[EmergencyStatus][]EmergencyStatus{
        StatusCreated:            {StatusHospitalNotified, StatusCancelled},
        StatusHospitalNotified:   {StatusHospitalAccepted, StatusHospitalRejected, StatusCancelled},
        StatusHospitalAccepted:   {StatusAmbulanceDispatched, StatusCancelled},
        StatusHospitalRejected:   {StatusCancelled},
        StatusAmbulanceDispatched:{StatusEnRouteToScene, StatusCancelled},
        StatusEnRouteToScene:     {StatusAtScene, StatusCancelled},
        StatusAtScene:            {StatusEnRouteToHospital, StatusCancelled},
        StatusEnRouteToHospital:  {StatusArrivedAtHospital, StatusCancelled},
        StatusArrivedAtHospital:  {StatusHandedOver, StatusCancelled},
        StatusHandedOver:        {StatusCompleted, StatusCancelled},
        StatusCompleted:          {},
        StatusCancelled:          {},
    }

    for _, allowed := range validNext[current] {
        if allowed == next {
            return true
        }
    }
    return false
}
