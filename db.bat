@echo off
REM ============================================
REM Database Management Wrapper
REM ============================================
REM Wrapper script to call database scripts
REM Usage: db <command> [args]
REM ============================================

if "%1"=="" (
    echo Usage: db ^<command^> [args]
    echo.
    echo Available commands:
    echo   init       - Initialize database from scratch
    echo   dev        - Create new migration from schema changes
    echo   deploy     - Apply migrations to database
    echo   docker     - Apply migrations in Docker
    echo   reset      - Reset database and reapply all migrations
    echo   restore    - Restore database from backup
    echo   status     - Check migration status
    echo   validate   - Validate migrations
    echo   studio     - Open Prisma Studio GUI
    echo   format     - Format schema.prisma
    echo.
    echo Examples:
    echo   db init          - Setup fresh database
    echo   db dev           - Create new migration
    echo   db status        - Check migration status
    echo   db studio        - Open database GUI
    echo.
    exit /b 1
)

set "COMMAND=%1"
shift

if "%COMMAND%"=="init" goto :sync_init
if "%COMMAND%"=="dev" goto :sync_dev
if "%COMMAND%"=="deploy" goto :sync_deploy
if "%COMMAND%"=="docker" goto :sync_docker
if "%COMMAND%"=="reset" goto :sync_reset
if "%COMMAND%"=="restore" goto :restore
if "%COMMAND%"=="status" goto :status
if "%COMMAND%"=="validate" goto :validate
if "%COMMAND%"=="studio" goto :studio
if "%COMMAND%"=="format" goto :format

echo Unknown command: %COMMAND%
echo Run 'db' without arguments to see available commands.
exit /b 1

:sync_init
call scripts\database\sync-database.bat init
exit /b %ERRORLEVEL%

:sync_dev
call scripts\database\sync-database.bat dev
exit /b %ERRORLEVEL%

:sync_deploy
call scripts\database\sync-database.bat deploy
exit /b %ERRORLEVEL%

:sync_docker
call scripts\database\sync-database.bat docker
exit /b %ERRORLEVEL%

:sync_reset
call scripts\database\sync-database.bat reset
exit /b %ERRORLEVEL%

:restore
if "%1"=="" (
    call scripts\database\restore-database.bat docker
) else (
    call scripts\database\restore-database.bat %1 %2 %3 %4
)
exit /b %ERRORLEVEL%

:status
call scripts\database\migrate.bat status
exit /b %ERRORLEVEL%

:validate
call scripts\database\migrate.bat validate
exit /b %ERRORLEVEL%

:studio
call scripts\database\migrate.bat studio
exit /b %ERRORLEVEL%

:format
call scripts\database\migrate.bat format
exit /b %ERRORLEVEL%
