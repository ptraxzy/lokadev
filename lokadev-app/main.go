package main

import (
	"fmt"
	"os"

	"github.com/lokadev/lokadev/cmd/lokadev"
)

func main() {
	if err := lokadev.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
