@echo off
title Status Dental Care System
color 0a

echo ================================================================
echo           STATUS LAYANAN DENTAL CARE SYSTEM
echo ================================================================
echo.

netstat -aon | findstr :3001 | findstr LISTENING >nul
if not errorlevel 1 (
    echo [V] Frontend Next.js (Port 3001)    : AKTIF - http://localhost:3001
) else (
    echo [X] Frontend Next.js (Port 3001)    : MATI / BELUM JALAN
)

netstat -aon | findstr :8000 | findstr LISTENING >nul
if not errorlevel 1 (
    echo [V] Backend Laravel (Port 8000)     : AKTIF - http://127.0.0.1:8000/api
) else (
    echo [X] Backend Laravel (Port 8000)     : MATI / BELUM JALAN
)

netstat -aon | findstr :21465 | findstr LISTENING >nul
if not errorlevel 1 (
    echo [V] WhatsApp Gateway (Port 21465)   : AKTIF - http://127.0.0.1:21465
) else (
    echo [X] WhatsApp Gateway (Port 21465)   : MATI / BELUM JALAN
)

netstat -aon | findstr :3306 | findstr LISTENING >nul
if not errorlevel 1 (
    echo [V] MySQL Database (Port 3306)      : AKTIF
) else (
    echo [X] MySQL Database (Port 3306)      : MATI (Nyalakan MySQL di XAMPP)
)

echo.
echo ================================================================
pause
