#!/bin/bash
# Attenova QR Scanner Attendance System - Setup Script
# This script sets up the development environment for the Attenova project

echo ""
echo "Attenova Setup Script"
echo ""

# Check Node.js version
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js 18 LTS from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')

if [ "$NODE_MAJOR" -lt 18 ]; then
    echo "ERROR: Node.js version 18+ is required. Current version: $NODE_VERSION"
    exit 1
fi
echo "Node.js $NODE_VERSION found"

# Check npm version
echo "Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed!"
    exit 1
fi

NPM_VERSION=$(npm --version)
echo "npm $NPM_VERSION found"

# Check MongoDB
echo "Checking MongoDB..."
MONGO_RUNNING=false
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.adminCommand('ping')" &> /dev/null; then
        MONGO_RUNNING=true
        echo "MongoDB is running"
    fi
fi

if [ "$MONGO_RUNNING" = false ]; then
    echo "WARNING: MongoDB does not appear to be running"
    echo "Please ensure MongoDB is running on localhost:27017"
fi

echo ""
echo "Installing backend dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Backend npm install failed!"
    exit 1
fi
echo "Backend dependencies installed"

cd ..

echo ""
echo "Installing frontend dependencies..."
cd client
npm install --legacy-peer-deps
if [ $? -ne 0 ]; then
    echo "ERROR: Frontend npm install failed!"
    exit 1
fi
echo "Frontend dependencies installed"

cd ..

echo ""
echo "Seeding database..."
cd server
node seedData.js
if [ $? -eq 0 ]; then
    echo "Database seeded successfully"
else
    echo "WARNING: Database seeding may have failed. Check MongoDB connection."
fi
cd ..

echo ""
echo "Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Ensure MongoDB is running on localhost:27017"
echo "2. Run: ./start.sh"
echo ""
echo "Demo Credentials:"
echo "  Admin: admin@iiita.ac.in / Test123!"
echo "  Professor: xerontitan90@gmail.com / Test123!"
echo "  Student: iib2024017@iiita.ac.in / Test123!"
echo ""

