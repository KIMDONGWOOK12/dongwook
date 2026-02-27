#!/bin/bash

SERVER_DATA_FOLDER_NAME=$1
DISTRO_ID=$2

SERVER_DATA_DIR="$HOME/${SERVER_DATA_FOLDER_NAME}"
SERVER_PIDFILE="$SERVER_DATA_DIR/.$DISTRO_ID.pid"

terminateTree() {
    local target_pid="$1"

    if [[ "$target_pid" -eq $$ ]]; then
        # Don't terminate this script
        return 0
    fi

    # Terminate children
    for cpid in $(/usr/bin/pgrep -P "$target_pid"); do
        terminateTree "$cpid"
    done

    echo "Terminating process $target_pid"
    kill -9 "$target_pid" > /dev/null 2>&1
    if [[ $? -ne 0 ]]; then
        echo "Warning: Failed to terminate process $target_pid"
    fi
}

if [[ -f "$SERVER_PIDFILE" ]]; then
    SERVER_PID=$(cat "$SERVER_PIDFILE")
    if [[ -n "$SERVER_PID" ]]; then
        terminateTree "$SERVER_PID"
    fi
fi
