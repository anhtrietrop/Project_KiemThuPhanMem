@echo off
REM ============================================
REM RESTORE DATABASE FROM BACKUP
REM ============================================
REM Khôi phục database từ file backup SQL
REM 
REM Usage:
REM   restore-database.bat docker     - Restore vào Docker MySQL
REM   restore-database.bat local      - Restore vào MySQL local
REM   restore-database.bat <file>     - Restore file cụ thể
REM ============================================

setlocal

set "BACKUP_DIR=database_backup"
set "DEFAULT_BACKUP=%BACKUP_DIR%\full_database_dump.sql"

if "%1"=="" (
    echo [ERROR] Missing argument!
    echo.
    echo Usage:
    echo   restore-database.bat docker              - Restore to Docker MySQL
    echo   restore-database.bat local               - Restore to local MySQL
    echo   restore-database.bat full_database_dump  - Restore specific backup file
    echo.
    echo Available backup files:
    dir /b %BACKUP_DIR%\*.sql
    exit /b 1
)

echo ============================================
echo DATABASE RESTORE
echo ============================================
echo.

REM Determine backup file
if "%1"=="docker" (
    set "TARGET=docker"
    set "BACKUP_FILE=%DEFAULT_BACKUP%"
) else if "%1"=="local" (
    set "TARGET=local"
    set "BACKUP_FILE=%DEFAULT_BACKUP%"
) else (
    set "TARGET=docker"
    if exist "%BACKUP_DIR%\%1.sql" (
        set "BACKUP_FILE=%BACKUP_DIR%\%1.sql"
    ) else if exist "%BACKUP_DIR%\%1" (
        set "BACKUP_FILE=%BACKUP_DIR%\%1"
    ) else (
        echo [ERROR] Backup file not found: %1
        exit /b 1
    )
)

if not exist "%BACKUP_FILE%" (
    echo [ERROR] Backup file not found: %BACKUP_FILE%
    exit /b 1
)

echo Backup file: %BACKUP_FILE%
echo Target: %TARGET%
echo.

if "%TARGET%"=="docker" (
    echo [1/5] Checking Docker containers...
    docker compose ps | findstr "singitronic_db" >nul
    if errorlevel 1 (
        echo [ERROR] Docker database container not running!
        echo Please start Docker: docker compose up -d db
        exit /b 1
    )
    
    echo [2/5] Recreating database...
    docker compose exec -T db mysql -uroot -prootpassword123 -e "DROP DATABASE IF EXISTS singitronic_nextjs_db; CREATE DATABASE singitronic_nextjs_db;"
    
    echo [3/5] Pushing schema from Prisma...
    docker compose exec backend npx prisma db push --accept-data-loss --skip-generate
    
    if errorlevel 1 (
        echo [ERROR] Schema push failed!
        exit /b 1
    )
    
    echo [4/5] Marking migrations as applied...
    docker compose exec backend npx prisma migrate resolve --applied 20251019150614_init
    docker compose exec backend npx prisma migrate resolve --applied 20251019153342_remove_instock_field
    docker compose exec backend npx prisma migrate resolve --applied 20251020115155_remove_momo_payment_status
    docker compose exec backend npx prisma migrate resolve --applied 20251024104748_add_cart_tables
    
    echo [5/5] Importing data from backup...
    if exist "%BACKUP_DIR%\data_only.sql" (
        type "%BACKUP_DIR%\data_only.sql" | docker compose exec -T db mysql -uroot -prootpassword123 singitronic_nextjs_db
        echo Data imported successfully!
    ) else (
        echo [SKIP] No data_only.sql found, running seed instead...
        docker compose exec backend npm run db:seed 2>nul
    )
    
    echo.
    echo [SUCCESS] Database restored to Docker!
    echo.
    echo Restarting containers...
    docker compose restart backend frontend-admin frontend-user
    
) else if "%TARGET%"=="local" (
    echo [1/3] Dropping existing database...
    mysql -uroot -p -e "DROP DATABASE IF EXISTS singitronic_nextjs_db; CREATE DATABASE singitronic_nextjs_db;"
    
    echo [2/3] Importing backup into local database...
    mysql -uroot -p singitronic_nextjs_db < "%BACKUP_FILE%"
    
    if errorlevel 1 (
        echo [ERROR] Import failed!
        exit /b 1
    )
    
    echo [3/3] Updating Prisma migration history...
    cd backend
    npx prisma migrate resolve --applied 20251019150614_init
    npx prisma migrate resolve --applied 20251019153342_remove_instock_field
    npx prisma migrate resolve --applied 20251020115155_remove_momo_payment_status
    npx prisma migrate resolve --applied 20251024104748_add_cart_tables
    cd ..
    
    echo.
    echo [SUCCESS] Database restored to local MySQL!
)

echo.
echo ============================================
echo Restore Complete!
echo ============================================
echo.
echo Next steps:
echo 1. Verify data: migrate.bat studio
echo 2. Check migration status: migrate.bat status
echo 3. Test application: npm run dev

endlocal
