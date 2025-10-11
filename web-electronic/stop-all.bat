@echo off
echo ========================================
echo  Stopping All Services
echo ========================================
echo.

REM Stop processes on port 3000 (Frontend User)
echo Stopping Frontend User (Port 3000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    taskkill /PID %%a /F >nul 2>&1
)
echo ✓ Stopped processes on port 3000

REM Stop processes on port 3001 (Frontend Admin)
echo Stopping Frontend Admin (Port 3001)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    taskkill /PID %%a /F >nul 2>&1
)
echo ✓ Stopped processes on port 3001

REM Stop processes on port 3002 (Backend)
echo Stopping Backend (Port 3002)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3002') do (
    taskkill /PID %%a /F >nul 2>&1
)
echo ✓ Stopped processes on port 3002

REM Also kill any node.exe and npm.cmd processes from this project
echo.
echo Cleaning up Node processes...
taskkill /F /IM node.exe >nul 2>&1
echo ✓ Cleaned up Node processes

echo.
echo ========================================
echo  All services stopped!
echo ========================================
echo.
pause

