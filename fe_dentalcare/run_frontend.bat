@echo off
title Dental Care Frontend (Next.js - Mode Ringan)
cd /d "%~dp0"

if not exist "node_modules" (
    echo Menginstal dependensi Frontend pertama kali...
    call npm install
)

:: Jika build produksi belum ada, buat build sekali agar hemat RAM & CPU
if not exist ".next\BUILD_ID" (
    echo [Info] Menyiapkan build awal agar hemat RAM & CPU di spek laptop minim...
    call npx next build
)

echo ========================================================
echo  Dental Care Frontend (Mode Produksi - Hemat RAM & Cepat)
echo  Port: 3001 | RAM ~25MB | Navigasi Instan
echo  (Gunakan run_frontend_dev.bat jika ingin mode koding)
echo ========================================================
npx serve -s out -l 3001
pause
