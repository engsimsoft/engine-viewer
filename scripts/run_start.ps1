# Engine Results Viewer - Start and Open in Browser
# Starts the application and opens it in the default browser

param(
    [int]$Port = 5173,
    [string]$Address = "localhost"
)

# Go to project root (scripts folder is one level down)
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Engine Results Viewer - Starting..." -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check dependencies
if (-not (Test-Path "backend\node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    Push-Location backend
    npm install
    Pop-Location
}

if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    Push-Location frontend
    npm install
    Pop-Location
}

# Kill existing processes on ports 3000 and 5173
Write-Host "Checking for existing processes..." -ForegroundColor Gray

$backend = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($backend) {
    $processId = $backend.OwningProcess
    Write-Host "Stopping existing backend (PID $processId)..." -ForegroundColor Yellow
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
}

$frontend = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
if ($frontend) {
    $processId = $frontend.OwningProcess
    Write-Host "Stopping existing frontend (PID $processId)..." -ForegroundColor Yellow
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
}

# Start Backend in new window
Write-Host ""
Write-Host "Starting Backend..." -ForegroundColor Green
$backendPath = Join-Path $projectRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm start" -WindowStyle Minimized

# Wait for backend
Write-Host "Waiting for backend to start..." -ForegroundColor Gray
$count = 0
$maxAttempts = 15
while ($count -lt $maxAttempts) {
    Start-Sleep -Seconds 1
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 1 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "Backend started: http://localhost:3000" -ForegroundColor Green
            break
        }
    } catch {}
    $count++
}

if ($count -ge $maxAttempts) {
    Write-Host "Error: Backend did not start in $maxAttempts seconds" -ForegroundColor Red
    exit 1
}

# Start Frontend in new window
Write-Host ""
Write-Host "Starting Frontend..." -ForegroundColor Green
$frontendPath = Join-Path $projectRoot "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev" -WindowStyle Minimized

# Wait for frontend
Write-Host "Waiting for frontend to start..." -ForegroundColor Gray
$count = 0
$maxAttempts = 20
$url = "http://${Address}:${Port}"
while ($count -lt $maxAttempts) {
    Start-Sleep -Seconds 1
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 1 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "Frontend started: $url" -ForegroundColor Green
            break
        }
    } catch {}
    $count++
}

if ($count -ge $maxAttempts) {
    Write-Host "Error: Frontend did not start in $maxAttempts seconds" -ForegroundColor Red
    exit 1
}

# Success - Open browser
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Engine Results Viewer started successfully!" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  http://localhost:3000" -ForegroundColor White
Write-Host "Frontend: $url" -ForegroundColor White
Write-Host ""
Write-Host "Opening browser..." -ForegroundColor Green
Start-Process $url

Write-Host ""
Write-Host "Servers are running in separate minimized windows" -ForegroundColor Gray
Write-Host ""
Write-Host "To stop:   run stop.bat" -ForegroundColor Gray
Write-Host "To check:  run status.bat" -ForegroundColor Gray
Write-Host ""

exit 0
