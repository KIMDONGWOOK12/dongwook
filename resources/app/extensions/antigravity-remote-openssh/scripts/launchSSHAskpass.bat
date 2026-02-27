@echo off
:: Expects:
:: - ANTIGRAVITY_SSH_ASKPASS_SOCKET environment variable to be set to a unix socket path
:: - ANTIGRAVITY_SSH_ELECTRON_PATH to be set to the path of the antigravity electron executable
:: - ANTIGRAVITY_SSH_ASKPASS_JS is set to the javascript to run (sshAskClient.js)

set ELECTRON_RUN_AS_NODE=1
"%ANTIGRAVITY_SSH_ELECTRON_PATH%" "%ANTIGRAVITY_SSH_ASKPASS_JS%" %*

:: This actually ends up running something like:
:: ELECTRON_RUN_AS_NODE=1 .../code .../out/scripts/sshAskClient.js "Password: "
