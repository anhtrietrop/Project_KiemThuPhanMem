@echo off
echo ========================================
echo  Checking Required Ports
echo ========================================
echo.

set PORT_IN_USE=0

REM Check Port 3000 (Frontend User)
echo Checking port 3000 (Frontend User)...
netstat -ano | findstr :3000 >nul
if %ERRORLEVEL% EQU 0 (
    echo ❌ Port 3000 is already in use
    set PORT_IN_USE=1
) else (
    echo ✓ Port 3000 is available
)

echo.

REM Check Port 3001 (Frontend Admin)
echo Checking port 3001 (Frontend Admin)...
netstat -ano | findstr :3001 >nul
if %ERRORLEVEL% EQU 0 (
    echo ❌ Port 3001 is already in use
    set PORT_IN_USE=1
) else (
    echo ✓ Port 3001 is available
)

echo.

REM Check Port 3002 (Backend)
echo Checking port 3002 (Backend)...
netstat -ano | findstr :3002 >nul
if %ERRORLEVEL% EQU 0 (
    echo ❌ Port 3002 is already in use
    set PORT_IN_USE=1
) else (
    echo ✓ Port 3002 is available
)

echo.
echo ========================================

if %PORT_IN_USE% EQU 1 (
    echo.
    echo ⚠ Some ports are in use!
    echo.
    echo To free up ports:
    echo 1. Find PID: netstat -ano ^| findstr :PORT
    echo 2. Kill process: taskkill /PID [PID] /F
    echo.
    echo Or use Task Manager to close the applications.
    echo.
) else (
    echo.
    echo ✅ All required ports are available!
    echo You can now run start-all.bat
    echo.
)

echo ========================================
pause

