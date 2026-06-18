# Start frontend static server (PowerShell)
# Usage: .\start-frontend.ps1

# Use npx http-server to serve the frontend folder on port 8080
$port = 8080
Write-Output "Starting frontend static server on http://localhost:$port"
Push-Location $PSScriptRoot

# If http-server is not installed, npx will fetch and run it
Start-Process -NoNewWindow -FilePath "npx" -ArgumentList "http-server frontend -p $port" -WorkingDirectory $PSScriptRoot
Pop-Location
