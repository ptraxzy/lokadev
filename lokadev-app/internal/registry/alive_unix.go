//go:build !windows

package registry

import (
	"os"
	"syscall"
)

func isAlive(proc *os.Process) bool {
	err := proc.Signal(syscall.Signal(0))
	return err == nil
}
