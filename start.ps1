# Start the backend server and frontend development server simultaneously
Write-Host "🚀 Starting Avatar Booking Project..." -ForegroundColor Cyan

# Start backend
Start-Process "nodmon" "server.js" -NoNewWindow
Write-Host "✅ Backend server starting on port 3002..." -ForegroundColor Green

# Start frontend
Set-Location client
npm run dev
