@echo off
echo ========================================
echo  Restarting After Schema Changes
echo ========================================
echo.

echo Step 1: Stopping all services...
echo Please close all terminal windows running:
echo - Backend (node app.js)
echo - Frontend User (npm run dev)
echo - Frontend Admin (npm run dev)
echo.
pause
echo.

echo Step 2: Generating Prisma Client...
cd backend
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Failed to generate Prisma client!
    echo Make sure all Node processes are stopped.
    echo.
    pause
    exit /b 1
)
echo ✓ Prisma client generated successfully
echo.
cd ..

echo Step 3: Generating Prisma Client for frontend-user...
cd frontend-user
call npx prisma generate
echo ✓ Frontend-user Prisma client generated
cd ..
echo.

echo Step 4: Generating Prisma Client for frontend-admin...
cd frontend-admin
call npx prisma generate
echo ✓ Frontend-admin Prisma client generated
cd ..
echo.

echo ========================================
echo  Prisma Clients Generated Successfully!
echo ========================================
echo.
echo Now you can start all services:
echo.
echo Option 1: Use automated script
echo   start-all.bat
echo.
echo Option 2: Manual start
echo   Terminal 1: cd backend ^&^& node app.js
echo   Terminal 2: cd frontend-user ^&^& npm run dev
echo   Terminal 3: cd frontend-admin ^&^& npm run dev
echo.
pause

