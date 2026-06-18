@echo off
REM Usage: start-backend.bat SERVICE_ROLE_KEY
IF "%1"=="" (
  echo No SERVICE_ROLE supplied, using environment.
) ELSE (
  set "SUPABASE_SERVICE_ROLE=%1"
)
cd backend
necho Starting backend...
npm run start
pause
