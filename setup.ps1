# Attenova QR Scanner Attendance System - Setup Script
# This script sets up the development environment for the Attenova project

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Attenova Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
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
Write-Host "✓ Node.js $nodeVersion found" -ForegroundColor Green

# Check npm version
Write-Host "Checking npm installation..." -ForegroundColor Yellow
$npmVersion = npm --version 2>$null
if ($null -eq $npmVersion) {
    Write-Host "ERROR: npm is not installed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ npm $npmVersion found" -ForegroundColor Green

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
Write-Host "✓ Backend dependencies installed" -ForegroundColor Green

Set-Location ..

Write-Host ""
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location client
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend npm install failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green

Set-Location ..

Write-Host ""
Write-Host "Environment Variables Configuration" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "To configure environment variables, create a file: server/.env" -ForegroundColor Cyan
Write-Host ""
Write-Host "Example server/.env:" -ForegroundColor Cyan
Write-Host "MONGO_URI=mongodb://localhost:27017/attendance" -ForegroundColor Gray
Write-Host "PORT=5000" -ForegroundColor Gray
Write-Host "JWT_SECRET=your_jwt_secret_here" -ForegroundColor Gray
Write-Host "NODE_ENV=development" -ForegroundColor Gray
Write-Host ""

$configEnv = Read-Host "Do you want to create server/.env now? (y/n)"
if ($configEnv -eq 'y' -or $configEnv -eq 'Y') {
    $mongoUri = Read-Host "Enter MongoDB URI (default: mongodb://localhost:27017/attendance)"
    if ([string]::IsNullOrWhiteSpace($mongoUri)) { $mongoUri = "mongodb://localhost:27017/attendance" }
    
    $port = Read-Host "Enter server port (default: 5000)"
    if ([string]::IsNullOrWhiteSpace($port)) { $port = "5000" }
    
    $jwtSecret = Read-Host "Enter JWT secret (default: your_jwt_secret)"
    if ([string]::IsNullOrWhiteSpace($jwtSecret)) { $jwtSecret = "your_jwt_secret" }
    
    $envContent = @"
MONGO_URI=$mongoUri
PORT=$port
JWT_SECRET=$jwtSecret
NODE_ENV=development
"@
    
    Set-Content -Path "server/.env" -Value $envContent
    Write-Host "✓ server/.env created" -ForegroundColor Green
}

Write-Host ""
Write-Host "Database Seeding" -ForegroundColor Yellow
Write-Host "================" -ForegroundColor Yellow
Write-Host ""

$seedDb = Read-Host "Do you want to seed the database with demo data? (y/n)"
if ($seedDb -eq 'y' -or $seedDb -eq 'Y') {
    Write-Host "Seeding database..." -ForegroundColor Yellow
    Set-Location server
    node seedData.js
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database seeded successfully" -ForegroundColor Green
    } else {
        Write-Host "WARNING: Database seeding may have failed. Check MongoDB connection." -ForegroundColor Yellow
    }
    Set-Location ..
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
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

