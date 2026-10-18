@echo off
title Dental Care Frontend (Next.js - Mode Ringan)
cd /d "%~dp0"

:: Pastikan file .env tersedia
if not exist ".env" (
    if exist ".env.example" (
        echo Menyiapkan file .env Frontend pertama kali...
        copy .env.example .env >nul
    )
)

if not exist "node_modules" (
    echo Menginstal dependensi Frontend pertama kali...
    call npm install
)

:: Pastikan serve tersedia di node_modules
if not exist "node_modules\serve" (
    echo Menginstal package serve...
    call npm install --save serve
)

:: Jika build produksi belum ada di out/index.html, buat build sekarang
if not exist "out\index.html" (
    echo [Info] Menyiapkan build awal agar hemat RAM & CPU di spek laptop minim...
    call npm run build
)

:: Jika build out/index.html tetap tidak ada (misal build gagal), fallback ke next dev port 3001
if not exist "out\index.html" (
    echo [Peringatan] Direktori static out belum siap, beralih ke mode dev di port 3001...
    call npx next dev -p 3001
    exit /b
)

echo ========================================================
echo  Dental Care Frontend (Mode Produksi - Hemat RAM & Cepat)
echo  Port: 3001 | RAM ~25MB | Navigasi Instan
echo  (Gunakan run_frontend_dev.bat jika ingin mode koding)
echo ========================================================
call npx --yes serve -s out -l 3001
pause
