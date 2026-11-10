package main

import "fmt"

func enforceOrganization(_ any, allowedMSP ...string) error {
    if len(allowedMSP) == 0 {
        return fmt.Errorf("at least one allowed MSP is required")
    }

    for _, candidate := range allowedMSP {
        if candidate == Org1MSP || candidate == Org2MSP {
            return nil
        }
    }

    return fmt.Errorf("unauthorized organization for this operation")
}
