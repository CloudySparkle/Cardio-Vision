@echo off
title Starting CardioVision AI...
cd /d "%~dp0"
echo ========================================================
echo  Starting CardioVision AI Clinical Intelligence Server
echo ========================================================
echo.

if not exist ".venv\Scripts\python.exe" (
    if exist "..\.venv\Scripts\python.exe" (
        cd /d "%~dp0\.."
    )
)

echo Checking server status...
start "" "START_CARDIOVISION.vbs"
timeout /t 2 /nobreak >nul
echo Opened in your default browser!
exit
