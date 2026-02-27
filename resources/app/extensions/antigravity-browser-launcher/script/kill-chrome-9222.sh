#!/bin/bash

# Script to continuously poll for and kill Chrome processes on port 9222
# Useful for simulating browser launch failure

echo "Monitoring for Chrome on port 9222..."
echo "Press Ctrl+C to stop"

while true; do
	# Check if something is listening on port 9222
	PID=$(lsof -ti:9222 2>/dev/null)

	if [ ! -z "$PID" ]; then
		kill -9 $PID
		echo "[$(date '+%H:%M:%S')] Process killed"
	fi

	# Poll every 0.5 seconds
	sleep 0.01
done
