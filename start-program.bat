@echo off
title Web Final Project - MERN Demo
echo ==============================================
echo Starting Web Final Project Demo
echo ==============================================
echo.

REM Start backend server
echo Launching Backend Server...
start "Backend Server" cmd /k "cd backend && npm run server"

REM Start admin panel
echo Launching Admin Panel...
start "Admin Panel" cmd /k "cd admin && npm run dev"

REM Start frontend user app
echo Launching Frontend App...
start "Frontend App" cmd /k "cd frontend && npm run dev"

echo.
echo ==============================================
echo All components are starting in separate windows.
echo You may close any window to stop that component.
echo ==============================================
pause
