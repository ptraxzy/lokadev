//go:build windows

package registry

import (
	"os"
)

func isAlive(proc *os.Process) bool {
	err := proc.Signal(os.Signal(nil))
	return err == nil
}
