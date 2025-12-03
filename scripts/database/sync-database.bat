@echo off
REM ============================================
REM DATABASE SYNC SCRIPT
REM ============================================
REM Đồng bộ schema Prisma giữa local, Docker và production
REM 
REM Usage:
REM   sync-database.bat dev      - Tạo migration mới từ schema changes (local dev)
REM   sync-database.bat deploy   - Apply migrations lên database (production-safe)
REM   sync-database.bat docker   - Apply migrations trong Docker container
REM   sync-database.bat reset    - Reset database và apply tất cả migrations
REM   sync-database.bat init     - Khởi tạo database từ đầu (dùng backup/seed)
REM ============================================

setlocal

set "PRISMA_DIR=backend\prisma"
set "ENV_FILE=.env"
set "DOCKER_ENV=.env.docker"

REM Check arguments
if "%1"=="" (
    echo [ERROR] Missing argument!
    echo.
    echo Usage:
    echo   sync-database.bat dev      - Create new migration from schema changes
    echo   sync-database.bat deploy   - Apply migrations to database
    echo   sync-database.bat docker   - Apply migrations in Docker
    echo   sync-database.bat reset    - Reset database and reapply all migrations
    echo   sync-database.bat init     - Initialize database from scratch (use backup/seed)
    exit /b 1
)

echo ============================================
echo DATABASE SYNC - Mode: %1
echo ============================================
echo.

REM Navigate to backend directory
cd backend

if "%1"=="dev" (
    echo [1/3] Creating new migration from schema changes...
    echo.
    set /p MIGRATION_NAME="Enter migration name (e.g., add_payment_table): "
    npx prisma migrate dev --name !MIGRATION_NAME!
    
    if errorlevel 1 (
        echo [ERROR] Migration failed!
        cd ..
        exit /b 1
    )
    
    echo.
    echo [2/3] Generating Prisma Client...
    npx prisma generate
    
    echo.
    echo [3/3] Copying migration to frontends...
    xcopy /E /I /Y "prisma\migrations" "..\frontend-admin\prisma\migrations\"
    xcopy /E /I /Y "prisma\migrations" "..\frontend-user\prisma\migrations\"
    xcopy /Y "prisma\schema.prisma" "..\frontend-admin\prisma\"
    xcopy /Y "prisma\schema.prisma" "..\frontend-user\prisma\"
    
    echo.
    echo [SUCCESS] Migration created and synced to frontends!
    echo Next steps:
    echo 1. Commit the migration files to Git
    echo 2. Push to repository
    echo 3. Deploy will auto-apply migrations via railway.json
)

if "%1"=="deploy" (
    echo [1/2] Applying pending migrations to database...
    echo.
    npx prisma migrate deploy
    
    if errorlevel 1 (
        echo [ERROR] Migration deploy failed!
        cd ..
        exit /b 1
    )
    
    echo.
    echo [2/2] Generating Prisma Client...
    npx prisma generate
    
    echo.
    echo [SUCCESS] Migrations applied successfully!
)

if "%1"=="docker" (
    echo [1/2] Applying migrations inside Docker container...
    echo.
    cd ..
    docker compose exec backend npx prisma migrate deploy
    
    if errorlevel 1 (
        echo [ERROR] Docker migration failed!
        exit /b 1
    )
    
    echo.
    echo [2/2] Generating Prisma Client in Docker...
    docker compose exec backend npx prisma generate
    
    echo.
    echo [SUCCESS] Docker database synced!
    cd backend
)

if "%1"=="reset" (
    echo [WARNING] This will DELETE all data and recreate the database!
    set /p CONFIRM="Are you sure? Type 'yes' to continue: "
    
    if not "!CONFIRM!"=="yes" (
        echo [CANCELLED] Reset aborted.
        cd ..
        exit /b 0
    )
    
    echo.
    echo [1/3] Resetting database...
    npx prisma migrate reset --force
    
    if errorlevel 1 (
        echo [ERROR] Reset failed!
        cd ..
        exit /b 1
    )
    
    echo.
    echo [2/3] Generating Prisma Client...
    npx prisma generate
    
    echo.
    echo [3/3] Seeding database (if seed script exists)...
    npm run seed 2>nul
    
    echo [SUCCESS] Database reset complete!
)

if "%1"=="init" (
    echo [INFO] Initializing database from scratch...
    echo This will use restore-database.bat to setup fresh database.
    echo.
    
    call restore-database.bat docker
    
    if errorlevel 1 (
        echo [ERROR] Database initialization failed!
        cd ..
        exit /b 1
    )
    
    echo.
    echo [SUCCESS] Database initialized successfully!
    echo.
    echo You can now:
    echo - View data: migrate.bat studio
    echo - Check status: migrate.bat status
    echo - Start app: npm run dev
)   echo [SUCCESS] Database reset complete!
)

cd ..
echo.
echo ============================================
echo Done!
echo ============================================
endlocal
