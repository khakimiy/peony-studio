@echo off
REM Start frontend static server on port 8080
cd %~dp0
start "Frontend" cmd /k "npx http-server frontend -p 8080"
echo Frontend server starting on http://localhost:8080
pause
