@echo off
TITLE Caddy Proxy (Mabar VIP)
echo ===================================================
echo  Caddy Proxy - Mabar VIP Project
echo ===================================================
echo.
echo  Domain Proxy: http://localhost.cc -> localhost:3006
echo.
echo  PENTING: Pastikan file Windows hosts memiliki:
echo  127.0.0.1 localhost.cc
echo ===================================================
echo.
echo Menjalankan Caddy...
caddy run --config Caddyfile
pause
