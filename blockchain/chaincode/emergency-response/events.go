package main

import (
    "fmt"
    "time"
)

func makeEventID() string {
    return fmt.Sprintf("EVT-%d", time.Now().UTC().UnixNano())
}
