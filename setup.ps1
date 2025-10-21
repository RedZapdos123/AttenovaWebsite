# Attenova QR Scanner Attendance System - Setup Script
# This script sets up the development environment for the Attenova project

Write-Host ""
Write-Host "Attenova Setup Script" -ForegroundColor Cyan
Write-Host ""

# Check Node.js version
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($null -eq $nodeVersion) {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js 18 LTS from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

$nodeMajor = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
if ($nodeMajor -lt 18) {
    Write-Host "ERROR: Node.js version 18+ is required. Current version: $nodeVersion" -ForegroundColor Red
    exit 1
}
Write-Host "Node.js $nodeVersion found" -ForegroundColor Green

# Check npm version
Write-Host "Checking npm installation..." -ForegroundColor Yellow
$npmVersion = npm --version 2>$null
if ($null -eq $npmVersion) {
    Write-Host "ERROR: npm is not installed!" -ForegroundColor Red
    exit 1
}
Write-Host "npm $npmVersion found" -ForegroundColor Green

# Check MongoDB
Write-Host "Checking MongoDB..." -ForegroundColor Yellow
$mongoRunning = $false

# Try to check if MongoDB service is running
try {
    $mongoService = Get-Service MongoDB -ErrorAction SilentlyContinue
    if ($mongoService -and $mongoService.Status -eq "Running") {
        $mongoRunning = $true
        Write-Host "MongoDB service is running" -ForegroundColor Green
    }
} catch {
    # If service check fails, try mongosh command
    try {
        $mongoTest = mongosh --eval "db.adminCommand('ping')" 2>$null
        if ($LASTEXITCODE -eq 0) {
            $mongoRunning = $true
            Write-Host "MongoDB is running" -ForegroundColor Green
        }
    } catch {
        # MongoDB check failed
    }
}

if (-not $mongoRunning) {
    Write-Host "WARNING: MongoDB does not appear to be running" -ForegroundColor Yellow
    Write-Host "Please ensure MongoDB is running on localhost:27017" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
Set-Location server
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Backend npm install failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Backend dependencies installed" -ForegroundColor Green

Set-Location ..

Write-Host ""
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location client
npm install --legacy-peer-deps
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend npm install failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Frontend dependencies installed" -ForegroundColor Green

Set-Location ..

Write-Host ""
Write-Host "Seeding database..." -ForegroundColor Yellow
Set-Location server
node seedData.js
if ($LASTEXITCODE -eq 0) {
    Write-Host "Database seeded successfully" -ForegroundColor Green
} else {
    Write-Host "WARNING: Database seeding may have failed. Check MongoDB connection." -ForegroundColor Yellow
}
Set-Location ..

Write-Host ""
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Ensure MongoDB is running on localhost:27017" -ForegroundColor Cyan
Write-Host "2. Run: .\start.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "Demo Credentials:" -ForegroundColor Yellow
Write-Host "  Admin: admin@iiita.ac.in / Test123!" -ForegroundColor Gray
Write-Host "  Professor: xerontitan90@gmail.com / Test123!" -ForegroundColor Gray
Write-Host "  Student: iib2024017@iiita.ac.in / Test123!" -ForegroundColor Gray
Write-Host ""

