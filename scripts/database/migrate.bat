@echo off
REM ============================================
REM Quick Migration Commands
REM ============================================

if "%1"=="" goto :help

if "%1"=="status" (
    echo Checking migration status...
    cd backend
    npx prisma migrate status
    goto :end
)

if "%1"=="validate" (
    echo Validating migrations...
    cd backend
    npm run migrate:validate
    goto :end
)

if "%1"=="studio" (
    echo Opening Prisma Studio...
    cd backend
    npx prisma studio
    goto :end
)

if "%1"=="format" (
    echo Formatting schema...
    cd backend
    npx prisma format
    goto :end
)

:help
echo.
echo Migration Quick Commands:
echo   migrate.bat status    - Check migration status
echo   migrate.bat validate  - Validate migrations for dangerous operations
echo   migrate.bat studio    - Open Prisma Studio (database GUI)
echo   migrate.bat format    - Format schema.prisma file
echo.
echo For full sync operations, use: sync-database.bat
echo.

:end
