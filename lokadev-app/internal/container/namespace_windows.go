//go:build windows

package container

import (
        "fmt"
        "os"
        "os/exec"
        "path/filepath"
        "unsafe"

        "golang.org/x/sys/windows"
)

// Project holds runtime info for an isolated project on Windows.
type Project struct {
        Name      string
        RootDir   string
        JobHandle windows.Handle
}

// CreateNamespace creates a Windows Job Object that isolates a project's
// processes. Provides process-level isolation equivalent to Linux namespaces.
func CreateNamespace(name, rootDir string) (*Project, error) {
        if err := os.MkdirAll(rootDir, 0755); err != nil {
                return nil, fmt.Errorf("create project dir: %w", err)
        }

        jobName, err := windows.UTF16PtrFromString(fmt.Sprintf("LokaDev-%s", name))
        if err != nil {
                return nil, fmt.Errorf("encode job name: %w", err)
        }

        job, err := windows.CreateJobObject(nil, jobName)
        if err != nil {
                return nil, fmt.Errorf("create job object: %w", err)
        }

        // Kill all processes when the job handle is closed (orphan prevention)
        info := windows.JOBOBJECT_EXTENDED_LIMIT_INFORMATION{
                BasicLimitInformation: windows.JOBOBJECT_BASIC_LIMIT_INFORMATION{
                        LimitFlags: windows.JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE,
                },
        }
        if err := windows.SetInformationJobObject(
                job,
                windows.JobObjectExtendedLimitInformation,
                uintptr(unsafe.Pointer(&info)),
                uint32(unsafe.Sizeof(info)),
        ); err != nil {
                windows.CloseHandle(job)
                return nil, fmt.Errorf("set job limits: %w", err)
        }

        return &Project{
                Name:      name,
                RootDir:   rootDir,
                JobHandle: job,
        }, nil
}

// ExecInNamespace spawns a process assigned to the project's Job Object.
func ExecInNamespace(project *Project, command ...string) *exec.Cmd {
        if len(command) == 0 {
                return nil
        }
        cmd := exec.Command(command[0], command[1:]...)
        cmd.Dir = project.RootDir
        return cmd
}

// AssignToJob assigns a running process to the project's Job Object.
func AssignToJob(project *Project, pid int) error {
        proc, err := windows.OpenProcess(windows.PROCESS_ALL_ACCESS, false, uint32(pid))
        if err != nil {
                return fmt.Errorf("open process: %w", err)
        }
        defer windows.CloseHandle(proc)
        return windows.AssignProcessToJobObject(project.JobHandle, proc)
}

// DestroyNamespace closes the Job Object handle, terminating all
// processes in the project group.
func DestroyNamespace(project *Project) error {
        return windows.CloseHandle(project.JobHandle)
}

// projectDataPath returns the local app data path for LokaDev projects.
func projectDataPath(name string) string {
        appData := os.Getenv("LOCALAPPDATA")
        return filepath.Join(appData, "LokaDev", "projects", name)
}
