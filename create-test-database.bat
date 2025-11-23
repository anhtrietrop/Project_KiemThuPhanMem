@echo off
REM ====================================
REM Create Test Database for Testing
REM ====================================
echo.
echo [TEST DATABASE SETUP] Creating test database with sample data...
echo.

REM Tìm MySQL trong các thư mục phổ biến
set MYSQL_PATHS="C:\Program Files\MySQL\MySQL Server 8.0\bin" "C:\Program Files\MySQL\MySQL Server 8.4\bin" "C:\Program Files\MySQL\MySQL Server 5.7\bin" "C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin" "C:\xampp\mysql\bin" "C:\wamp64\bin\mysql\mysql8.0.27\bin"

set MYSQL=
for %%p in (%MYSQL_PATHS%) do (
    if exist "%%~p\mysql.exe" (
        set MYSQL=%%~p\mysql.exe
        echo Found MySQL at: %%~p
        goto :found
    )
)

echo ERROR: Cannot find mysql.exe
echo.
echo Please do one of the following:
echo.
echo [OPTION 1] Using Docker (RECOMMENDED if Docker is running):
echo   1. Make sure Docker containers are running: docker compose up -d
echo   2. Run: docker compose exec db mysql -u root -prootpassword123 -e "CREATE DATABASE test_ecommerce_db; USE test_ecommerce_db; SOURCE database_backup/full_database_dump.sql;"
echo.
echo [OPTION 2] Using MySQL Workbench GUI:
echo   1. Open MySQL Workbench
echo   2. Connect to localhost
echo   3. Run SQL: CREATE DATABASE test_ecommerce_db;
echo   4. File ^> Run SQL Script ^> Select database_backup\full_database_dump.sql
echo   5. Select schema: test_ecommerce_db
echo   6. Click "Run"
echo.
echo [OPTION 3] Manually add MySQL to PATH and run this script again
echo.
pause
exit /b 1

:found
echo.
echo [1/4] Creating test database...
"%MYSQL%" -u root -e "CREATE DATABASE IF NOT EXISTS test_ecommerce_db;"
if %ERRORLEVEL% NEQ 0 (
    echo Failed to create database. Trying with password prompt...
    "%MYSQL%" -u root -p -e "CREATE DATABASE IF NOT EXISTS test_ecommerce_db;"
)

echo.
echo [2/4] Checking if backup file exists...
if exist "database_backup\full_database_dump.sql" (
    echo ✓ Found full_database_dump.sql
    set BACKUP_FILE=database_backup\full_database_dump.sql
) else if exist "backup_singitronic.sql" (
    echo ✓ Found backup_singitronic.sql
    set BACKUP_FILE=backup_singitronic.sql
) else (
    echo.
    echo WARNING: No backup file found!
    echo.
    echo Creating empty test database for now...
    echo You can import data later using:
    echo   mysql -u root test_ecommerce_db ^< your_backup_file.sql
    echo.
    goto :verify
)

echo.
echo [3/4] Importing data from backup...
echo (This may take a few minutes for large databases)
echo.
"%MYSQL%" -u root test_ecommerce_db < "%BACKUP_FILE%"
if %ERRORLEVEL% NEQ 0 (
    echo Failed without password. Trying with password prompt...
    "%MYSQL%" -u root -p test_ecommerce_db < "%BACKUP_FILE%"
)

:verify
echo.
echo [4/4] Verifying test database...
"%MYSQL%" -u root -e "USE test_ecommerce_db; SHOW TABLES; SELECT COUNT(*) as user_count FROM user; SELECT COUNT(*) as product_count FROM product; SELECT COUNT(*) as category_count FROM category;" 2>nul
if %ERRORLEVEL% NEQ 0 (
    "%MYSQL%" -u root -p -e "USE test_ecommerce_db; SHOW TABLES;"
)

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✓ SUCCESS: Test database created!
    echo ========================================
    echo.
    echo Database: test_ecommerce_db
    echo Connection: mysql://root@localhost:3306/test_ecommerce_db
    echo.
    echo NEXT STEPS:
    echo   1. Update backend\.env.test with: DATABASE_URL="mysql://root:@localhost:3306/test_ecommerce_db"
    echo   2. Run tests: cd backend ^&^& npm test
    echo   3. Run with coverage: cd backend ^&^& npm run test:coverage
    echo.
) else (
    echo.
    echo ========================================
    echo ✓ Database created but data import might have failed
    echo ========================================
    echo.
    echo The test database exists but might be empty.
    echo Tests will create necessary data automatically.
    echo.
)

echo.
pause
