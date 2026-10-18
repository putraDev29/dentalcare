@echo off
title Hentikan Dental Care System
color 0c

echo ================================================================
echo           MENGHENTIKAN DENTAL CARE SYSTEM
echo ================================================================
echo.

echo [1/3] Menghentikan Backend Laravel (Port 8000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1

echo [2/3] Menghentikan WhatsApp Gateway (Port 21465)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :21465 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1

echo [3/3] Menghentikan Frontend Next.js (Port 3001 / 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1

:: Tutup window CMD terkait Dental Care jika ada yang tertinggal
taskkill /F /FI "WINDOWTITLE eq DentalCare*" >nul 2>&1

echo.
echo ================================================================
echo   Semua layanan Dental Care berhasil dihentikan!
echo ================================================================
ping 127.0.0.1 -n 3 >nul
exit
