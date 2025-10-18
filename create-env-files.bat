@echo off
echo ========================================
echo  Creating Environment Files
echo ========================================
echo.

REM Create Frontend Admin .env.local
if not exist "frontend-admin\.env.local" (
    echo Creating frontend-admin/.env.local...
    (
        echo # Frontend Admin - Port 3001
        echo NEXT_PUBLIC_API_BASE_URL=http://localhost:3002
        echo NEXTAUTH_URL=http://localhost:3001
        echo NEXTAUTH_SECRET=your-secret-key-change-this-in-production
    ) > frontend-admin\.env.local
    echo ✓ Created frontend-admin/.env.local
) else (
    echo ✓ frontend-admin/.env.local already exists
)

echo.

REM Create Frontend User .env.local
if not exist "frontend-user\.env.local" (
    echo Creating frontend-user/.env.local...
    (
        echo # Frontend User - Port 3000
        echo NEXT_PUBLIC_API_BASE_URL=http://localhost:3002
        echo NEXTAUTH_URL=http://localhost:3000
        echo NEXTAUTH_SECRET=your-secret-key-change-this-in-production
    ) > frontend-user\.env.local
    echo ✓ Created frontend-user/.env.local
) else (
    echo ✓ frontend-user/.env.local already exists
)

echo.

REM Create Backend .env
if not exist "backend\.env" (
    echo Creating backend/.env...
    (
        echo # Backend - Port 3002
        echo PORT=3002
        echo NODE_ENV=development
        echo.
        echo # Frontend URLs
        echo FRONTEND_USER_URL=http://localhost:3000
        echo FRONTEND_ADMIN_URL=http://localhost:3001
        echo.
        echo # Database ^(update with your credentials^)
        echo DATABASE_URL="postgresql://user:password@localhost:5432/web_electronic?schema=public"
    ) > backend\.env
    echo ✓ Created backend/.env
    echo.
    echo ⚠ IMPORTANT: Please update DATABASE_URL in backend/.env with your actual database credentials!
) else (
    echo ✓ backend/.env already exists
)

echo.
echo ========================================
echo  Environment files created successfully!
echo ========================================
echo.
echo Port Configuration:
echo   Backend:       http://localhost:3002
echo   Frontend User: http://localhost:3000
echo   Frontend Admin: http://localhost:3001
echo.
echo Next steps:
echo   1. Update database credentials in backend/.env
echo   2. Run setup-all.bat to install dependencies
echo   3. Run start-all.bat to start all services
echo.
pause

