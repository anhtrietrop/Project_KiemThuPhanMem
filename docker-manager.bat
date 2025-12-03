@echo off
REM ============================================
REM Docker Management Wrapper
REM ============================================
REM Quick commands for Docker operations
REM Usage: docker-manager <command>
REM ============================================

if "%1"=="" (
    echo Usage: docker-manager ^<command^>
    echo.
    echo Available commands:
    echo   start      - Start all containers
    echo   stop       - Stop all containers
    echo   restart    - Restart all containers
    echo   rebuild    - Rebuild and restart containers
    echo   logs       - View logs (all or specific service)
    echo   status     - Show container status
    echo   clean      - Clean up (down + prune)
    echo   check      - Check ports availability
    echo.
    echo Examples:
    echo   docker-manager start
    echo   docker-manager logs backend
    echo   docker-manager rebuild
    echo   docker-manager check
    echo.
    exit /b 1
)

set "COMMAND=%1"
shift

if "%COMMAND%"=="start" goto :start
if "%COMMAND%"=="stop" goto :stop
if "%COMMAND%"=="restart" goto :restart
if "%COMMAND%"=="rebuild" goto :rebuild
if "%COMMAND%"=="logs" goto :logs
if "%COMMAND%"=="status" goto :status
if "%COMMAND%"=="clean" goto :clean
if "%COMMAND%"=="check" goto :check

echo Unknown command: %COMMAND%
exit /b 1

:start
echo Starting Docker containers...
docker compose up -d
exit /b %ERRORLEVEL%

:stop
echo Stopping Docker containers...
docker compose down
exit /b %ERRORLEVEL%

:restart
echo Restarting Docker containers...
docker compose restart %1 %2 %3
exit /b %ERRORLEVEL%

:rebuild
echo Rebuilding and restarting Docker containers...
docker compose down
docker compose up -d --build
echo.
echo Applying migrations...
call scripts\database\sync-database.bat docker
exit /b %ERRORLEVEL%

:logs
if "%1"=="" (
    docker compose logs -f --tail=50
) else (
    docker compose logs -f --tail=50 %1
)
exit /b %ERRORLEVEL%

:status
docker compose ps
exit /b %ERRORLEVEL%

:clean
echo Cleaning Docker resources...
docker compose down -v
docker system prune -f
docker volume prune -f
exit /b %ERRORLEVEL%

:check
call scripts\docker\check-ports.bat
exit /b %ERRORLEVEL%
