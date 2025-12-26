# Engine Results Viewer - Stop Script
# Stops Backend and Frontend servers

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Engine Results Viewer - Stopping..." -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$stoppedCount = 0

# Stop Backend (port 3000)
Write-Host "Checking port 3000 (Backend)..." -ForegroundColor Gray
$backend = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($backend) {
    $processId = $backend.OwningProcess
    Write-Host "Stopping Backend (PID $processId)..." -ForegroundColor Yellow
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    if ($?) {
        Write-Host "Backend stopped" -ForegroundColor Green
        $stoppedCount++
    }
}

# Stop Frontend (port 5173)
Write-Host "Checking port 5173 (Frontend)..." -ForegroundColor Gray
$frontend = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
if ($frontend) {
    $processId = $frontend.OwningProcess
    Write-Host "Stopping Frontend (PID $processId)..." -ForegroundColor Yellow
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    if ($?) {
        Write-Host "Frontend stopped" -ForegroundColor Green
        $stoppedCount++
    }
}

# Result
Write-Host ""
if ($stoppedCount -gt 0) {
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host "Engine Results Viewer stopped successfully" -ForegroundColor Cyan
    Write-Host "=============================================" -ForegroundColor Cyan
} else {
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host "No processes found (already stopped)" -ForegroundColor Cyan
    Write-Host "=============================================" -ForegroundColor Cyan
}
Write-Host ""
Write-Host "To start: run start.bat" -ForegroundColor Gray
Write-Host ""

exit 0
