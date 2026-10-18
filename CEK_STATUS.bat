@echo off
title Status Dental Care System

echo ================================================================
echo           STATUS LAYANAN DENTAL CARE SYSTEM
echo ================================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "$fe3001 = Get-NetTCPConnection -State Listen -LocalPort 3001 -ErrorAction SilentlyContinue; $fe3000 = Get-NetTCPConnection -State Listen -LocalPort 3000 -ErrorAction SilentlyContinue; if ($fe3001) { Write-Host '[V] Frontend Next.js (Port 3001)    : AKTIF - http://localhost:3001' -ForegroundColor Green } elseif ($fe3000) { Write-Host '[V] Frontend Next.js (Port 3000)    : AKTIF (Dev) - http://localhost:3000' -ForegroundColor Green } else { Write-Host '[X] Frontend Next.js (Port 3001)    : MATI / BELUM JALAN' -ForegroundColor Red }; $be = Get-NetTCPConnection -State Listen -LocalPort 8000 -ErrorAction SilentlyContinue; if ($be) { Write-Host '[V] Backend Laravel (Port 8000)     : AKTIF - http://127.0.0.1:8000/api' -ForegroundColor Green } else { Write-Host '[X] Backend Laravel (Port 8000)     : MATI / BELUM JALAN' -ForegroundColor Red }; $wa = Get-NetTCPConnection -State Listen -LocalPort 21465 -ErrorAction SilentlyContinue; if ($wa) { Write-Host '[V] WhatsApp Gateway (Port 21465)   : AKTIF - http://127.0.0.1:21465' -ForegroundColor Green } else { Write-Host '[X] WhatsApp Gateway (Port 21465)   : MATI / BELUM JALAN' -ForegroundColor Red }; $db = Get-NetTCPConnection -State Listen -LocalPort 3306 -ErrorAction SilentlyContinue; if ($db) { Write-Host '[V] MySQL Database (Port 3306)      : AKTIF' -ForegroundColor Green } else { Write-Host '[X] MySQL Database (Port 3306)      : MATI (Nyalakan MySQL di XAMPP)' -ForegroundColor Yellow };"

echo.
echo ================================================================
pause
