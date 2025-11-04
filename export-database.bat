@echo off
REM ====================================
REM Export Database from MySQL Workbench
REM ====================================
echo.
echo [STEP 1] Exporting database from MySQL Workbench...
echo.

REM Tìm mysqldump.exe trong các thư mục cài đặt MySQL phổ biến
set MYSQL_PATHS="C:\Program Files\MySQL\MySQL Server 8.0\bin" "C:\Program Files\MySQL\MySQL Server 5.7\bin" "C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin" "C:\xampp\mysql\bin" "C:\wamp64\bin\mysql\mysql8.0.27\bin"

set MYSQLDUMP=
for %%p in (%MYSQL_PATHS%) do (
    if exist "%%~p\mysqldump.exe" (
        set MYSQLDUMP=%%~p\mysqldump.exe
        echo Found MySQL at: %%~p
        goto :found
    )
)

echo ERROR: Cannot find mysqldump.exe
echo.
echo Please do one of the following:
echo 1. Use MySQL Workbench GUI to export database:
echo    - Server ^> Data Export
echo    - Select database: singitronic_nextjs_db
echo    - Export to Self-Contained File: backup_singitronic.sql
echo    - Start Export
echo.
echo 2. Or manually run this command (replace PATH):
echo    "C:\Path\To\MySQL\bin\mysqldump.exe" -u root -p singitronic_nextjs_db ^> backup_singitronic.sql
echo.
pause
exit /b 1

:found
echo.
echo Exporting database...
echo (You will be prompted for MySQL password)
echo.

"%MYSQLDUMP%" -u root -p singitronic_nextjs_db > backup_singitronic.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ SUCCESS: Database exported to backup_singitronic.sql
    echo File size:
    dir backup_singitronic.sql | find "backup_singitronic.sql"
    echo.
    echo NEXT STEP: Run import-to-docker.bat to load data into Docker MySQL
) else (
    echo.
    echo ✗ FAILED: Export failed!
    echo Please check your MySQL password and try again.
)

echo.
pause
