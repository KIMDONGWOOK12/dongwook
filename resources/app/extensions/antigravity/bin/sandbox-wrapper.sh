#!/bin/bash
# Unified sandbox wrapper for macOS Seatbelt
# Usage: sandbox-wrapper.sh [--allow-network] <command> [args...]

set -euo pipefail

# Parse network flag
ALLOW_NETWORK=false
if [ "${1:-}" = "--allow-network" ]; then
	ALLOW_NETWORK=true
	shift
fi

# Validate environment
if [ -z "${SANDBOX_WORK_DIR:-}" ]; then
	echo "Error: SANDBOX_WORK_DIR must be set" >&2
	exit 1
fi

WORK_DIR="$SANDBOX_WORK_DIR"
TEMP_PROFILE=$(mktemp)
TEMP_STDERR=$(mktemp)
trap 'rm -f "$TEMP_PROFILE" "$TEMP_STDERR"' EXIT

# Generate base sandbox profile
cat >"$TEMP_PROFILE" <<EOF
(version 1)
(allow default)

; Process permissions
(allow process-exec)
(allow process-fork)
(allow process-info* (target same-sandbox))
(allow signal (target same-sandbox))
(allow mach-priv-task-port (target same-sandbox))

; User preferences
(allow user-preference-read)

; Mach IPC - specific services only (no wildcard)
(allow mach-lookup
	(global-name "com.apple.audio.systemsoundserver")
	(global-name "com.apple.distributed_notifications@Uv3")
	(global-name "com.apple.FontObjectsServer")
	(global-name "com.apple.fonts")
	(global-name "com.apple.logd")
	(global-name "com.apple.lsd.mapdb")
	(global-name "com.apple.PowerManagement.control")
	(global-name "com.apple.system.logger")
	(global-name "com.apple.system.notification_center")
	(global-name "com.apple.trustd.agent")
	(global-name "com.apple.system.opendirectoryd.libinfo")
	(global-name "com.apple.system.opendirectoryd.membership")
	(global-name "com.apple.bsd.dirhelper")
	(global-name "com.apple.securityd.xpc")
	(global-name "com.apple.coreservices.launchservicesd")
)

; POSIX IPC - shared memory
(allow ipc-posix-shm)

; POSIX IPC - semaphores for Python multiprocessing
(allow ipc-posix-sem)

; IOKit - specific operations only
(allow iokit-open
	(iokit-registry-entry-class "IOSurfaceRootUserClient")
	(iokit-registry-entry-class "RootDomainUserClient")
	(iokit-user-client-class "IOSurfaceSendRight")
)

; IOKit properties
(allow iokit-get-properties)

; Specific safe system-sockets, doesn't allow network access
(allow system-socket (require-all (socket-domain AF_SYSTEM) (socket-protocol 2)))

; sysctl - specific sysctls only
(allow sysctl-read
	(sysctl-name "hw.activecpu")
	(sysctl-name "hw.busfrequency_compat")
	(sysctl-name "hw.byteorder")
	(sysctl-name "hw.cacheconfig")
	(sysctl-name "hw.cachelinesize_compat")
	(sysctl-name "hw.cpufamily")
	(sysctl-name "hw.cpufrequency")
	(sysctl-name "hw.cpufrequency_compat")
	(sysctl-name "hw.cputype")
	(sysctl-name "hw.l1dcachesize_compat")
	(sysctl-name "hw.l1icachesize_compat")
	(sysctl-name "hw.l2cachesize_compat")
	(sysctl-name "hw.l3cachesize_compat")
	(sysctl-name "hw.logicalcpu")
	(sysctl-name "hw.logicalcpu_max")
	(sysctl-name "hw.machine")
	(sysctl-name "hw.memsize")
	(sysctl-name "hw.ncpu")
	(sysctl-name "hw.nperflevels")
	(sysctl-name "hw.packages")
	(sysctl-name "hw.pagesize_compat")
	(sysctl-name "hw.pagesize")
	(sysctl-name "hw.physicalcpu")
	(sysctl-name "hw.physicalcpu_max")
	(sysctl-name "hw.tbfrequency_compat")
	(sysctl-name "hw.vectorunit")
	(sysctl-name "kern.argmax")
	(sysctl-name "kern.bootargs")
	(sysctl-name "kern.hostname")
	(sysctl-name "kern.maxfiles")
	(sysctl-name "kern.maxfilesperproc")
	(sysctl-name "kern.maxproc")
	(sysctl-name "kern.ngroups")
	(sysctl-name "kern.osproductversion")
	(sysctl-name "kern.osrelease")
	(sysctl-name "kern.ostype")
	(sysctl-name "kern.osvariant_status")
	(sysctl-name "kern.osversion")
	(sysctl-name "kern.secure_kernel")
	(sysctl-name "kern.tcsm_available")
	(sysctl-name "kern.tcsm_enable")
	(sysctl-name "kern.usrstack64")
	(sysctl-name "kern.version")
	(sysctl-name "kern.willshutdown")
	(sysctl-name "machdep.cpu.brand_string")
	(sysctl-name "machdep.ptrauth_enabled")
	(sysctl-name "security.mac.lockdown_mode_state")
	(sysctl-name "sysctl.proc_cputype")
	(sysctl-name "vm.loadavg")
	(sysctl-name-prefix "hw.optional.arm")
	(sysctl-name-prefix "hw.optional.arm.")
	(sysctl-name-prefix "hw.optional.armv8_")
	(sysctl-name-prefix "hw.perflevel")
	(sysctl-name-prefix "kern.proc.all")
	(sysctl-name-prefix "kern.proc.pgrp.")
	(sysctl-name-prefix "kern.proc.pid.")
	(sysctl-name-prefix "machdep.cpu.")
	(sysctl-name-prefix "net.routetable.")
)

; V8 thread calculations
(allow sysctl-write
	(sysctl-name "kern.tcsm_enable")
)

; Distributed notifications
(allow distributed-notification-post)

; Specific mach-lookup permissions for security operations
(allow mach-lookup (global-name "com.apple.SecurityServer"))

; File I/O on device files
(allow file-ioctl (literal "/dev/null"))
(allow file-ioctl (literal "/dev/zero"))
(allow file-ioctl (literal "/dev/random"))
(allow file-ioctl (literal "/dev/urandom"))
(allow file-ioctl (literal "/dev/dtracehelper"))
(allow file-ioctl (literal "/dev/tty"))

(allow file-ioctl file-read-data file-write-data
	(require-all
		(literal "/dev/null")
		(vnode-type CHARACTER-DEVICE)
	)
)

EOF

# Add network rules based on flag
if [ "$ALLOW_NETWORK" = "false" ]; then
	cat >>"$TEMP_PROFILE" <<EOF
; Deny network
(deny network*)

EOF
fi

# Add file write rules
cat >>"$TEMP_PROFILE" <<EOF
; Default deny file writes
(deny file-write*)

; Allow writes to workspace
(allow file-write* (subpath "$WORK_DIR"))

; Allow writes to /tmp (both versions for macOS)
(allow file-write* (subpath "/tmp"))
(allow file-write* (subpath "/private/tmp"))

EOF

# Process ignore file - convert gitignore patterns to sandbox rules; currently underblocks
# Sed pipeline explanation:
#   1. Remove comments (lines starting with #)
#   2. Remove empty lines
#   3. Remove negations (lines starting with !)
#   4. Trim whitespace
#   5. Remove empty lines again
#   6. Skip directory-only patterns (ending in /); known limitation
#   7-15. Escape regex special characters (. + ( ) { } | ^ $)
#   16-17. Save ** and **/ as placeholders
#   18-19. Convert glob patterns (* and ?) to regex
#   20-21. Restore ** and **/ placeholders
process_ignore_file() {
	local ignore_file="$1"
	local base_dir="$2"

	[ -f "$ignore_file" ] || return 0

	sed -E \
		-e '/^[[:space:]]*#/d' \
		-e '/^[[:space:]]*$/d' \
		-e '/^!/d' \
		-e 's/^[[:space:]]+//; s/[[:space:]]+$//' \
		-e '/^$/d' \
		-e '/\/$/d' \
		-e 's/\./\\./g' \
		-e 's/\+/\\+/g' \
		-e 's/\(/\\(/g' \
		-e 's/\)/\\)/g' \
		-e 's/\{/\\{/g' \
		-e 's/\}/\\}/g' \
		-e 's/\|/\\|/g' \
		-e 's/\^/\\^/g' \
		-e 's/\$/\\$/g' \
		-e 's|\*\*/|__GLOBSTAR_SLASH__|g' \
		-e 's/\*\*/__GLOBSTAR__/g' \
		-e 's|\*|[^/]*|g' \
		-e 's|\?|[^/]|g' \
		-e 's|__GLOBSTAR_SLASH__|(.*/)?|g' \
		-e 's/__GLOBSTAR__/.*/g' \
		"$ignore_file" | while IFS= read -r regex || [ -n "$regex" ]; do
		# Generate deny rules with proper anchoring
		if [[ "$regex" == /* ]]; then
			# Absolute path pattern
			echo "(deny file-read* (regex #\"^${base_dir}${regex}$\"))"
			echo "(deny file-write* (regex #\"^${base_dir}${regex}$\"))"
		else
			# Relative path pattern - can appear anywhere in workspace
			echo "(deny file-read* (regex #\"^${base_dir}/(.*/)?${regex}$\"))"
			echo "(deny file-write* (regex #\"^${base_dir}/(.*/)?${regex}$\"))"
		fi
	done >>"$TEMP_PROFILE"
}

# Process ignore files
process_ignore_file "$WORK_DIR/.gitignore" "$WORK_DIR"
process_ignore_file "$WORK_DIR/.agyignore" "$WORK_DIR"

# Run command
[ $# -eq 0 ] && {
	echo "Usage: $0 [--allow-network] <command> [args...]" >&2
	exit 1
}

# Run command, capturing stderr for analysis
sandbox-exec -f "$TEMP_PROFILE" "$@" 2> >(tee "$TEMP_STDERR" >&2)
EXIT_CODE=$?

# Detect sandbox violations and provide helpful message
# TODO: Update the URL to the actual documentation when ready.
if [ $EXIT_CODE -ne 0 ] && grep -q "Operation not permitted" "$TEMP_STDERR"; then
	echo "" >&2
	echo "Your command might have failed due to sandbox restrictions. See https://antigravity.google/docs/sandbox-mode for more details. You can disable sandbox permanently in settings, or for a single run by checking the 'No Sandbox' box on the next terminal command." >&2
fi

exit $EXIT_CODE
