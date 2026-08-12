@echo off
TITLE Mabar VIP Web Application
echo =========================================
echo       Mabar VIP Live Stream App          
echo =========================================
echo.
echo Launching Dashboard & Web Server on Port 3006...
echo.

:: Auto launch browser tab directly to localhost:3006
start "" "http://localhost:3006"

:: Start Next.js Development Server on port 3006
npm run dev
