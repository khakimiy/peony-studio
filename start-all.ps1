<#
Start both backend and frontend in separate windows.
Usage:
  .\start-all.ps1 '<SERVICE_ROLE_KEY>'
If SERVICE_ROLE_KEY is provided it's exported as SUPABASE_SERVICE_ROLE for the backend process.
#>
param(
  [Parameter(Mandatory=$false)]
  [string]$ServiceRole
)

$root = $PSScriptRoot

if ($ServiceRole) { Write-Output "Using provided service role (will be set for backend process)" }

# Start backend in new window
$backendCmd = "cd `"$root\backend`"; `n`n" +
"if (Test-Path \"$root\\backend\\.env\") { Get-Content \"$root\\backend\\.env\" | ForEach-Object { if ($_ -match '^\s*([^#=]+)=\s*(.*)\s*$') { $n=$Matches[1].Trim(); $v=$Matches[2].Trim(); Write-Output \"Set $n\" } } } ; `n"

# Simpler: start node server with env var passed
if ($ServiceRole) {
  Start-Process -FilePath "powershell" -ArgumentList "-NoExit","-Command","cd `"$root\\backend`"; $env:SUPABASE_SERVICE_ROLE=\"$ServiceRole\"; npm run start" -WindowStyle Normal -WorkingDirectory "$root\\backend"
} else {
  Start-Process -FilePath "powershell" -ArgumentList "-NoExit","-Command","cd `"$root\\backend`"; npm run start" -WindowStyle Normal -WorkingDirectory "$root\\backend"
}

Start-Sleep -Milliseconds 700

# Start frontend in new window (http-server)
Start-Process -FilePath "powershell" -ArgumentList "-NoExit","-Command","cd `"$root`"; npx http-server frontend -p 8080" -WindowStyle Normal -WorkingDirectory "$root"

Write-Output "Started backend and frontend (frontend: http://localhost:8080, backend: http://localhost:5000)"
