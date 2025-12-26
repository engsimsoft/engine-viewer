@echo off
setlocal

REM Always run from this script's folder (handles spaces in path)
pushd "%~dp0" >nul

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run_start.ps1" -Port 5173 -Address localhost
set "EXITCODE=%ERRORLEVEL%"

popd
if not "%EXITCODE%"=="0" (
	echo.
	echo Failed with exit code: %EXITCODE%
	pause
)
endlocal
exit /b %EXITCODE%
