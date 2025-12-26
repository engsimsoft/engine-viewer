# Engine Results Viewer - Status Script
# Checks status of Backend and Frontend servers

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Engine Results Viewer - Status" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check Backend
Write-Host "Backend (http://localhost:3000):" -ForegroundColor White
$backend = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($backend) {
    $processId = $backend.OwningProcess
    Write-Host "  Status: " -NoNewline -ForegroundColor Gray
    Write-Host "Running" -ForegroundColor Green
    Write-Host "  PID:    $processId" -ForegroundColor Gray

    # Check health endpoint
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "  Health: " -NoNewline -ForegroundColor Gray
            Write-Host "OK" -ForegroundColor Green
        }
    } catch {
        Write-Host "  Health: " -NoNewline -ForegroundColor Gray
        Write-Host "ERROR (not responding)" -ForegroundColor Red
    }
} else {
    Write-Host "  Status: " -NoNewline -ForegroundColor Gray
    Write-Host "Stopped" -ForegroundColor Red
}

Write-Host ""

# Check Frontend
Write-Host "Frontend (http://localhost:5173):" -ForegroundColor White
$frontend = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
if ($frontend) {
    $processId = $frontend.OwningProcess
    Write-Host "  Status: " -NoNewline -ForegroundColor Gray
    Write-Host "Running" -ForegroundColor Green
    Write-Host "  PID:    $processId" -ForegroundColor Gray

    # Check HTTP
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "  HTTP:   " -NoNewline -ForegroundColor Gray
            Write-Host "OK" -ForegroundColor Green
        }
    } catch {
        Write-Host "  HTTP:   " -NoNewline -ForegroundColor Gray
        Write-Host "ERROR (not responding)" -ForegroundColor Red
    }
} else {
    Write-Host "  Status: " -NoNewline -ForegroundColor Gray
    Write-Host "Stopped" -ForegroundColor Red
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start: run start.bat" -ForegroundColor Gray
Write-Host "To stop:  run stop.bat" -ForegroundColor Gray
Write-Host ""

Read-Host "Press Enter to exit"

exit 0
