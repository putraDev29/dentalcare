@echo off
title Setup & Build Pertama Kali - Dental Care System
color 0b

echo ================================================================
echo       SETUP & BUILD PERTAMA KALI - DENTAL CARE SYSTEM
echo ================================================================
echo.
echo Langkah ini hanya perlu dijalankan sekali saat setup pertama kali
echo (atau saat ingin memperbarui seluruh dependensi sistem).
echo.

set "ROOT_DIR=%~dp0"

:: -----------------------------------------------------------------
:: 1. BACKEND LARAVEL
:: -----------------------------------------------------------------
echo [1/3] Menyiapkan Backend Laravel...
cd /d "%ROOT_DIR%be_dentalcare"

if "%~1"=="update" (
    echo       - Menjalankan composer update...
    call composer update --no-interaction --prefer-dist
) else (
    echo       - Menjalankan composer install...
    call composer install --no-interaction --prefer-dist
    if errorlevel 1 (
        echo       * Composer install mengalami kendala, mencoba composer update...
        call composer update --no-interaction --prefer-dist
    )
)

echo       - Menjalankan npm install Backend...
call npm install

echo       - Memastikan file .env dan Application Key...
if not exist ".env" (
    copy .env.example .env
    call php artisan key:generate
)

echo       - Memeriksa migrasi database...
call php artisan migrate --force

echo.
:: -----------------------------------------------------------------
:: 2. WHATSAPP GATEWAY
:: -----------------------------------------------------------------
echo [2/3] Menyiapkan WhatsApp Gateway...
cd /d "%ROOT_DIR%wa_gateway"
echo       - Menjalankan npm install WhatsApp Gateway...
call npm install

echo.
:: -----------------------------------------------------------------
:: 3. FRONTEND NEXT.JS
:: -----------------------------------------------------------------
echo [3/3] Menyiapkan Frontend Next.js...
cd /d "%ROOT_DIR%fe_dentalcare"
echo       - Menjalankan npm install Frontend...
call npm install

echo       - Mengompilasi build Frontend Next.js...
call npm run build

echo       - Memasang icon shortcut ke Desktop...
call "%ROOT_DIR%PASANG_ICON_DESKTOP.bat" auto

echo.
echo ================================================================
echo   SETUP & BUILD PERTAMA KALI BERHASIL SELESAI!
echo.
echo   Sekarang Anda bisa langsung menjalankan aplikasi sekali klik
echo   menggunakan: START_DENTALCARE.vbs (tanpa jendela CMD)
echo   atau START_DENTALCARE.bat
echo ================================================================
echo.
pause
