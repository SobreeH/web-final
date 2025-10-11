@echo off
title Web Final Project - MERN Demo
echo ==============================================
echo Starting Web Final Project Demo
echo ==============================================
echo.

:: Get absolute path of this script
set "BASE_DIR=%~dp0"
set "NODE_DIR=%BASE_DIR%node"

:: Add Node.js and npm to PATH
set "PATH=%NODE_DIR%;%NODE_DIR%\node_modules\npm\bin;%PATH%"

echo Using local Node.js binaries from:
echo   %NODE_DIR%
echo.

echo Checking Node.js and NPM versions...
call "%NODE_DIR%\node.exe" -v
call "%NODE_DIR%\npm.cmd" -v
echo.
pause

@echo off
title Web Final Project - MERN Demo
echo ==============================================
echo Starting Web Final Project Demo
echo ==============================================
echo.

REM Start backend server
echo Launching Backend Server...
start "Backend Server" cmd /k "cd backend && npm i && npm run server"

REM Start admin panel
echo Launching Admin Panel...
start "Admin Panel" cmd /k "cd admin && npm i && npm run dev"

REM Start frontend user app
echo Launching Frontend App...
start "Frontend App" cmd /k "cd frontend && npm i && npm run dev"

echo.
echo ==============================================
echo All components are starting in separate windows.
echo You may close any window to stop that component.
echo ==============================================
pause
