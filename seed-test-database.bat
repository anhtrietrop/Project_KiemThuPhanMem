@echo off
REM =========================================
REM Seed Test Database with Sample Data
REM =========================================
REM This script populates test_ecommerce_db with consistent sample data
REM All team members will get identical data after running this

echo.
echo ========================================
echo  Seeding Test Database
echo ========================================
echo.

REM Change to backend directory
cd /d "%~dp0backend"

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

REM Check if database container exists
docker compose ps db | findstr "db" >nul
if errorlevel 1 (
    echo [ERROR] Database container not found!
    echo Please run docker-compose up first.
    pause
    exit /b 1
)

REM Set environment to test database
echo [1/3] Setting up environment...
set DATABASE_URL=mysql://root:rootpassword123@localhost:3306/test_ecommerce_db
set NODE_ENV=test

echo [2/3] Running Prisma migrations...
npx prisma migrate deploy

echo [3/3] Seeding database with sample data...
npm run db:seed

if errorlevel 0 (
    echo.
    echo ========================================
    echo  SUCCESS! Test database seeded
    echo ========================================
    echo.
    echo Test database is ready with consistent data:
    echo - Admin user: admin@singitronic.com / admin123
    echo - Test users: user1@test.com to user5@test.com / admin123
    echo - Sample categories, products, orders, reviews
    echo.
    echo All team members will have identical data.
    echo.
) else (
    echo.
    echo [ERROR] Seeding failed!
    echo Check the error messages above.
)

pause
