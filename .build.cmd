@echo off
set "NODE_OPTIONS="
set "CODEBUDDY_SAFE_DELETE_SHIM_DIR="
set "GENIE_TRASH_DIR="
set "PATH=C:\Users\dcc\.workbuddy\binaries\node\versions\24.14.0.installing.8432.__extract_temp__\node-v24.14.0-win-x64;%PATH%"
cd /d h:\GitHub\ryumonfalls
echo === check ===
call pnpm run check
echo CHECK_EXIT=%errorlevel%
echo === build ===
call pnpm run build
echo BUILD_EXIT=%errorlevel%
