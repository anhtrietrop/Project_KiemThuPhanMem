@echo off
echo ========================================
echo  Setup Electronics eCommerce App
echo ========================================
echo.

echo [1/3] Installing Backend Dependencies...
cd backend
call npm install
echo Backend dependencies installed!
echo.

echo [2/3] Installing Frontend User Dependencies...
cd ..\frontend-user
call npm install
echo Frontend User dependencies installed!
echo.

echo [3/3] Installing Frontend Admin Dependencies...
cd ..\frontend-admin
call npm install
echo Frontend Admin dependencies installed!
echo.

cd ..

echo ========================================
echo  Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Create .env files in each folder (use env-template.txt as reference)
echo 2. Run: cd backend
echo 3. Run: npx prisma migrate dev
echo 4. Run: cd utills ^&^& node insertDemoData.js
echo 5. Run: start-all.bat to start all services
echo.
pause

