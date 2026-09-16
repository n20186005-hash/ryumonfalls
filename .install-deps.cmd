@echo off
set "NODE_OPTIONS="
set "CODEBUDDY_SAFE_DELETE_SHIM_DIR="
set "GENIE_TRASH_DIR="
set "PATH=C:\Users\dcc\.workbuddy\binaries\node\versions\24.14.0.installing.8432.__extract_temp__\node-v24.14.0-win-x64;%PATH%"
cd /d h:\GitHub\ryumonfalls
echo cleaning node_modules
node -e "require('fs').rmSync('node_modules',{recursive:true,force:true})"
for /l %%i in (1,1,6) do (
  echo ==== attempt %%i ====
  call pnpm install --config.node-linker=hoisted --no-frozen-lockfile --store-dir .pnpm-store --reporter=append-only
  echo exit=!errorlevel!
  if not errorlevel 1 goto finish
  echo retrying
)
:finish
echo FINISHED
node -e "console.log('astro-exists:' + require('fs').existsSync('node_modules/astro'))"
node -e "console.log('bin-exists:' + require('fs').existsSync('node_modules/.bin/astro.cmd'))"
