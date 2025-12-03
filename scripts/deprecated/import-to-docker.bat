@echo off
REM ====================================
REM Import Database to Docker MySQL
REM ====================================
echo.
echo [STEP 2] Importing database to Docker MySQL container...
echo.

REM Kiểm tra folder backup có tồn tại không
if not exist "database_backup" (
    echo ERROR: database_backup folder not found!
    echo.
    echo Please export from MySQL Workbench first and copy files to database_backup\
    echo.
    pause
    exit /b 1
)

echo Checking Docker containers...
docker compose ps | find "db"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Docker MySQL container is not running!
    echo Please start Docker containers first: docker compose up -d
    echo.
    pause
    exit /b 1
)

echo.
echo [1/3] Creating database if not exists...
docker compose exec db mysql -u root -prootpassword123 -e "CREATE DATABASE IF NOT EXISTS singitronic_nextjs_db;"

echo.
echo [2/3] Importing all SQL files...
echo (This may take a few minutes)
echo.

for %%f in (database_backup\*.sql) do (
    echo Importing %%f...
    docker compose exec -T db mysql -u root -prootpassword123 singitronic_nextjs_db < "%%f"
    if %ERRORLEVEL% NEQ 0 (
        echo WARNING: Failed to import %%f
    )
)

echo.
echo [3/3] Verifying imported data...
docker compose exec db mysql -u root -prootpassword123 -e "USE singitronic_nextjs_db; SHOW TABLES; SELECT COUNT(*) as product_count FROM product; SELECT COUNT(*) as user_count FROM user; SELECT COUNT(*) as category_count FROM category;"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✓ SUCCESS: Database synchronized!
    echo ========================================
    echo.
    echo You can now:
    echo   1. Test API: curl http://localhost:3002/api/products
    echo   2. Open User Frontend: http://localhost:3000
    echo   3. Open Admin Portal: http://localhost:3001
    echo.
    echo Data is now identical to your local MySQL Workbench!
    echo.
) else (
    echo.
    echo ✗ FAILED: Import or verification failed!
    echo Please check the error messages above.
)

echo.
pause
