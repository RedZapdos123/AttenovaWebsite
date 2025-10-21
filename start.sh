#!/bin/bash
# Attenova QR Scanner Attendance System - Start Script
# This script starts both the backend and frontend development servers

echo ""
echo "Attenova Start Script"
echo ""

# Check if node_modules exist in server
echo "Checking server dependencies..."
if [ ! -d "server/node_modules" ]; then
    echo "ERROR: server/node_modules not found!"
    echo "Please run: ./setup.sh"
    exit 1
fi
echo "Server dependencies found"

# Check if node_modules exist in client
echo "Checking client dependencies..."
if [ ! -d "client/node_modules" ]; then
    echo "ERROR: client/node_modules not found!"
    echo "Please run: ./setup.sh"
    exit 1
fi
echo "Client dependencies found"

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
    echo "ERROR: MongoDB is not running!"
    echo "Please start MongoDB on localhost:27017"
    exit 1
fi

echo ""
echo "Starting backend server..."
echo "Opening new terminal for backend..."

# Detect terminal emulator and start backend
if command -v gnome-terminal &> /dev/null; then
    gnome-terminal -- bash -c "cd \"$(pwd)/server\" && echo 'Backend server starting on http://localhost:5000' && npm start; exec bash"
elif command -v xterm &> /dev/null; then
    xterm -e "cd \"$(pwd)/server\" && echo 'Backend server starting on http://localhost:5000' && npm start; exec bash" &
elif command -v konsole &> /dev/null; then
    konsole -e bash -c "cd \"$(pwd)/server\" && echo 'Backend server starting on http://localhost:5000' && npm start; exec bash" &
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript -e "tell application \"Terminal\" to do script \"cd \\\"$(pwd)/server\\\" && echo 'Backend server starting on http://localhost:5000' && npm start\""
else
    echo "WARNING: Could not detect terminal emulator. Starting backend in background..."
    cd server
    npm start &
    BACKEND_PID=$!
    cd ..
fi

# Wait for backend to initialize
echo "Waiting 3 seconds for backend to initialize..."
sleep 3

echo ""
echo "Starting frontend development server..."
echo "Opening new terminal for frontend..."

# Detect terminal emulator and start frontend
if command -v gnome-terminal &> /dev/null; then
    gnome-terminal -- bash -c "cd \"$(pwd)/client\" && echo 'Frontend development server starting on http://localhost:3000' && npm start; exec bash"
elif command -v xterm &> /dev/null; then
    xterm -e "cd \"$(pwd)/client\" && echo 'Frontend development server starting on http://localhost:3000' && npm start; exec bash" &
elif command -v konsole &> /dev/null; then
    konsole -e bash -c "cd \"$(pwd)/client\" && echo 'Frontend development server starting on http://localhost:3000' && npm start; exec bash" &
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript -e "tell application \"Terminal\" to do script \"cd \\\"$(pwd)/client\\\" && echo 'Frontend development server starting on http://localhost:3000' && npm start\""
else
    echo "WARNING: Could not detect terminal emulator. Starting frontend in background..."
    cd client
    npm start &
    FRONTEND_PID=$!
    cd ..
fi

echo ""
echo "Servers Started!"
echo ""
echo "Backend API: http://localhost:5000"
echo "Frontend App: http://localhost:3000"
echo ""
echo "Demo Credentials:"
echo "  Admin: admin@iiita.ac.in / Test123!"
echo "  Professor: xerontitan90@gmail.com / Test123!"
echo "  Student: iib2024017@iiita.ac.in / Test123!"
echo ""
echo "To stop the servers:"
echo "  1. Close the backend terminal window (Ctrl+C)"
echo "  2. Close the frontend terminal window (Ctrl+C)"
echo ""
echo "Press Ctrl+C in this window to exit, or keep it open for reference."
echo ""

# Keep the main script running
while true; do
    sleep 1
done

