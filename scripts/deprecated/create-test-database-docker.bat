@echo off
REM ====================================
REM Setup Test Database Using Docker
REM ====================================
echo.
echo [TEST DATABASE - DOCKER] Setting up test database in Docker...
echo.

echo [1/4] Checking Docker containers...
docker compose ps | find "db"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Docker MySQL container is not running!
    echo Starting Docker containers...
    docker compose up -d
    timeout /t 10 /nobreak
)

echo.
echo [2/4] Creating test database in Docker...
docker compose exec db mysql -u root -prootpassword123 -e "CREATE DATABASE IF NOT EXISTS test_ecommerce_db;"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create test database!
    echo Make sure Docker MySQL is running with correct password.
    pause
    exit /b 1
)

echo.
echo [3/4] Checking for backup data...
if exist "database_backup\full_database_dump.sql" (
    echo ✓ Found backup file: database_backup\full_database_dump.sql
    echo.
    echo Importing data to test database...
    echo (This may take a few minutes)
    docker compose exec -T db mysql -u root -prootpassword123 test_ecommerce_db < "database_backup\full_database_dump.sql"
    
    if %ERRORLEVEL% EQU 0 (
        echo ✓ Data imported successfully
    ) else (
        echo ⚠ Import failed, but test database exists
        echo Tests will create necessary data automatically
    )
) else if exist "backup_singitronic.sql" (
    echo ✓ Found backup file: backup_singitronic.sql
    echo.
    echo Importing data to test database...
    docker compose exec -T db mysql -u root -prootpassword123 test_ecommerce_db < "backup_singitronic.sql"
) else (
    echo.
    echo ⚠ No backup file found
    echo Test database created but empty
    echo Tests will create necessary data automatically
)

echo.
echo [4/4] Verifying test database...
docker compose exec db mysql -u root -prootpassword123 -e "USE test_ecommerce_db; SHOW TABLES; SELECT 'Database ready for testing' as status;"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✓ SUCCESS: Test database ready in Docker!
    echo ========================================
    echo.
    echo Database: test_ecommerce_db
    echo Connection String: mysql://root:rootpassword123@localhost:3306/test_ecommerce_db
    echo Docker Container: Use 'docker compose exec db mysql -u root -prootpassword123 test_ecommerce_db'
    echo.
    echo NEXT STEPS:
    echo   1. Update backend\.env.test:
    echo      DATABASE_URL="mysql://root:rootpassword123@localhost:3306/test_ecommerce_db"
    echo.
    echo   2. Run tests:
    echo      cd backend
    echo      npm test
    echo.
    echo   3. Run with coverage:
    echo      npm run test:coverage
    echo.
) else (
    echo.
    echo ✗ FAILED: Test database setup failed!
    echo Please check Docker logs: docker compose logs db
)

echo.
pause
