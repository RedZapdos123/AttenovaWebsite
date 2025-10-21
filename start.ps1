# Attenova QR Scanner Attendance System - Start Script
# This script starts both the backend and frontend development servers

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Attenova Start Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exist in server
Write-Host "Checking server dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "server/node_modules")) {
    Write-Host "ERROR: server/node_modules not found!" -ForegroundColor Red
    Write-Host "Please run: .\setup.ps1" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Server dependencies found" -ForegroundColor Green

# Check if node_modules exist in client
Write-Host "Checking client dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "client/node_modules")) {
    Write-Host "ERROR: client/node_modules not found!" -ForegroundColor Red
    Write-Host "Please run: .\setup.ps1" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Client dependencies found" -ForegroundColor Green

# Check MongoDB
Write-Host "Checking MongoDB..." -ForegroundColor Yellow
$mongoRunning = $false
try {
    $mongoTest = mongosh --eval "db.adminCommand('ping')" 2>$null
    if ($LASTEXITCODE -eq 0) {
        $mongoRunning = $true
        Write-Host "✓ MongoDB is running" -ForegroundColor Green
    }
} catch {
    Write-Host "ERROR: MongoDB is not running!" -ForegroundColor Red
    Write-Host "Please start MongoDB on localhost:27017" -ForegroundColor Yellow
    exit 1
}

if (-not $mongoRunning) {
    Write-Host "ERROR: MongoDB is not running!" -ForegroundColor Red
    Write-Host "Please start MongoDB on localhost:27017" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Starting backend server..." -ForegroundColor Yellow
Write-Host "Opening new PowerShell window for backend..." -ForegroundColor Cyan

# Start backend in a new PowerShell window
$backendScript = @"
Set-Location "$PSScriptRoot"
Set-Location server
Write-Host "Backend server starting on http://localhost:5000" -ForegroundColor Green
npm start
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript

# Wait for backend to initialize
Write-Host "Waiting 3 seconds for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Starting frontend development server..." -ForegroundColor Yellow
Write-Host "Opening new PowerShell window for frontend..." -ForegroundColor Cyan

# Start frontend in a new PowerShell window
$frontendScript = @"
Set-Location "$PSScriptRoot"
Set-Location client
Write-Host "Frontend development server starting on http://localhost:3000" -ForegroundColor Green
npm start
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Servers Started!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend API: http://localhost:5000" -ForegroundColor Green
Write-Host "Frontend App: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Demo Credentials:" -ForegroundColor Yellow
Write-Host "  Admin: admin@iiita.ac.in / Test123!" -ForegroundColor Gray
Write-Host "  Professor: xerontitan90@gmail.com / Test123!" -ForegroundColor Gray
Write-Host "  Student: iib2024017@iiita.ac.in / Test123!" -ForegroundColor Gray
Write-Host ""
Write-Host "To stop the servers:" -ForegroundColor Yellow
Write-Host "  1. Close the backend PowerShell window (Ctrl+C)" -ForegroundColor Cyan
Write-Host "  2. Close the frontend PowerShell window (Ctrl+C)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C in this window to exit, or keep it open for reference." -ForegroundColor Yellow
Write-Host ""

# Keep the main window open
while ($true) {
    Start-Sleep -Seconds 1
}

