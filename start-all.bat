@echo off
REM Start backend and frontend in separate windows (Windows .bat)
REM Usage: start-all.bat [SERVICE_ROLE_KEY]
SET ROOT=%~dp0
IF NOT "%1"=="" (
  set "SR=%1"
) ELSE (
  set "SR="
)

REM Start backend in new window
IF NOT "%SR%"=="" (
  start "Backend" cmd /k "cd /d %ROOT%backend && set SUPABASE_SERVICE_ROLE=%SR% && npm run start"
) ELSE (
  start "Backend" cmd /k "cd /d %ROOT%backend && npm run start"
)

REM Start frontend in new window
start "Frontend" cmd /k "cd /d %ROOT% && npx http-server frontend -p 8080"
echo Started backend and frontend.
pause
