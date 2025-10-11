@echo off
echo ========================================
echo  Starting Electronics eCommerce App
echo ========================================
echo.

echo Starting Backend Server (Port 3002)...
start "Backend Server" cmd /k "cd backend && node app.js"
timeout /t 5

echo Starting Frontend User (Port 3000)...
start "Frontend User" cmd /k "cd frontend-user && npm run dev"
timeout /t 5

echo Starting Frontend Admin (Port 3001)...
start "Frontend Admin" cmd /k "cd frontend-admin && npm run dev"

echo.
echo ========================================
echo  All services started!
echo ========================================
echo  Backend:       http://localhost:3002
echo  Frontend User: http://localhost:3000
echo  Frontend Admin: http://localhost:3001
echo ========================================
echo.
pause

