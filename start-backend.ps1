# Start backend with service role (PowerShell)
# Usage: Open PowerShell, run: .\start-backend.ps1 '<SERVICE_ROLE_KEY>'
param(
  [Parameter(Mandatory=$false)]
  [string]$ServiceRole
)

if ($ServiceRole) { $env:SUPABASE_SERVICE_ROLE = $ServiceRole }

# Load .env if present
if (Test-Path ".env") {
  Write-Output "Loading .env"
  Get-Content .env | ForEach-Object {
    if ($_ -match "^\s*([^#=]+)=\s*(.*)\s*$") {
      $name = $Matches[1].Trim(); $val = $Matches[2].Trim();
      $env:$name = $val
    }
  }
}

# Kill existing process on 5000
$p = (Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue).OwningProcess; if($p){ Stop-Process -Id $p -Force -ErrorAction SilentlyContinue }

cd backend
Write-Output "Starting backend..."
npm run start
