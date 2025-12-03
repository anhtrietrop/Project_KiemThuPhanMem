@echo off
echo ========================================
echo Import Database to Railway MySQL
echo ========================================
echo.

REM Railway MySQL credentials
set RAILWAY_HOST=ballast.proxy.rlwy.net
set RAILWAY_PORT=39074
set RAILWAY_USER=root
set RAILWAY_PASSWORD=FznBhCbYEIOgEXzkdbPIxCJNDnXzCGSf
set RAILWAY_DATABASE=railway

echo Connecting to Railway MySQL: %RAILWAY_HOST%:%RAILWAY_PORT%
echo Database: %RAILWAY_DATABASE%
echo.

REM Check if backup file exists
if not exist "database_backup\railway_import.sql" (
    echo ERROR: Backup file not found!
    echo Please run export-database.bat first.
    pause
    exit /b 1
)

echo Importing database from: database_backup\railway_import.sql
echo.
echo This will:
echo 1. Drop and recreate database 'railway'
echo 2. Import all tables and data
echo.

set /p CONFIRM="Are you sure you want to continue? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo Import cancelled.
    pause
    exit /b 0
)

echo.
echo Starting import using Docker...
echo.

REM Import using Docker MySQL container
docker run --rm -i ^
    -v "%CD%\database_backup:/backup" ^
    mysql:8.0 ^
    mysql -h %RAILWAY_HOST% -P %RAILWAY_PORT% -u %RAILWAY_USER% -p%RAILWAY_PASSWORD% %RAILWAY_DATABASE% ^
    < database_backup\railway_import.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Import completed successfully!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo Import FAILED!
    echo ========================================
    echo Error code: %ERRORLEVEL%
)

echo.
pause
