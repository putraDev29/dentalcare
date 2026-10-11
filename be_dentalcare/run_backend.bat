@echo off
title Dental Care Backend (Laravel)
cd /d "%~dp0"

:: Cek pengaman jika folder vendor belum ada (belum pernah di-install)
if not exist "vendor" (
    echo Folder vendor belum ditemukan. Menjalankan composer install...
    call composer install --no-interaction --prefer-dist
    if errorlevel 1 (
        echo Menjalankan composer update...
        call composer update --no-interaction --prefer-dist
    )
)

if not exist "node_modules" (
    echo Menjalankan npm install di Backend...
    call npm install
)

echo Menjalankan Backend Laravel di port 8000...
php artisan serve --host=127.0.0.1 --port=8000
pause
